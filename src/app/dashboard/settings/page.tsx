'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/lib/icons";
import { BannerUpload } from "@/components/profile/banner-upload";
import KawaiiGenerator from "@/components/KawaiiGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string;
    bannerUrl: string;
    bio: string;
    created_at: string;
    updated_at: string;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
    const [avatarSaving, setAvatarSaving] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        bio: '',
        avatar_url: '',
        banner_url: ''
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data.profile);
                    setFormData({
                        display_name: data.profile.name || '',
                        bio: data.profile.bio || '',
                        avatar_url: data.profile.avatarUrl || '',
                        banner_url: data.profile.bannerUrl || '/default_banner.png'
                    });
                } else {
                    console.error('Failed to fetch profile data');
                    // Fallback to basic user data
                    const fallbackProfile = {
                        id: user?.id || '',
                        name: user?.profile?.display_name || 'ユーザー',
                        username: user?.email?.split('@')[0] || 'user',
                        email: user?.email || '',
                        avatarUrl: user?.profile?.avatar_url || "https://picsum.photos/seed/user1/200/200",
                        bannerUrl: user?.profile?.banner_url || "/default_banner.png",
                        bio: user?.profile?.bio || "ワンネスキングダムの市民。貢献とつながりを大切にしています。",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    setUserProfile(fallbackProfile);
                    setFormData({
                        display_name: fallbackProfile.name,
                        bio: fallbackProfile.bio,
                        avatar_url: fallbackProfile.avatarUrl,
                        banner_url: fallbackProfile.bannerUrl
                    });
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    const handleBannerUpload = async (bannerUrl: string) => {
        // If it's the default banner, just update the form data
        if (bannerUrl === '/default_banner.png') {
            setFormData(prev => ({ ...prev, banner_url: bannerUrl }));
            return;
        }

        setBannerUploading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Convert data URL to blob for upload
            const response = await fetch(bannerUrl);
            const blob = await response.blob();
            const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/upload/banner', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (uploadResponse.ok) {
                const data = await uploadResponse.json();
                setFormData(prev => ({ ...prev, banner_url: data.bannerUrl }));
                toast({
                    title: 'バナーを更新しました',
                    description: 'プロフィールバナーが正常に更新されました。'
                });
            } else {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Failed to upload banner');
            }
        } catch (error) {
            console.error('Error uploading banner:', error);
            toast({
                variant: 'destructive',
                title: 'アップロードエラー',
                description: error instanceof Error ? error.message : 'バナーのアップロードに失敗しました。'
            });
        } finally {
            setBannerUploading(false);
        }
    };

    const handleProfileSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: 'プロフィールを保存しました',
                    description: 'プロフィール情報が正常に更新されました。'
                });
                
                // Update local state
                if (userProfile) {
                    setUserProfile({
                        ...userProfile,
                        name: formData.display_name,
                        bio: formData.bio,
                        avatarUrl: formData.avatar_url,
                        bannerUrl: formData.banner_url,
                        updated_at: new Date().toISOString()
                    });
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            toast({
                variant: 'destructive',
                title: '保存エラー',
                description: error instanceof Error ? error.message : 'プロフィールの保存に失敗しました。'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSave = async (avatarData: { avatar: any; imageUrl: string }) => {
        setAvatarSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Convert data URL to blob
            const response = await fetch(avatarData.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'avatar.png', { type: 'image/png' });

            // Create form data for upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('avatar_config', JSON.stringify(avatarData.avatar));

            // Upload avatar
            const uploadResponse = await fetch('/api/upload/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (uploadResponse.ok) {
                const data = await uploadResponse.json();
                toast({
                    title: 'アバターを保存しました',
                    description: '新しいアバターが正常に設定されました。'
                });
                
                // Update local state
                if (userProfile) {
                    setUserProfile({
                        ...userProfile,
                        avatarUrl: data.avatarUrl,
                        updated_at: new Date().toISOString()
                    });
                }

                // Update form data
                setFormData(prev => ({
                    ...prev,
                    avatar_url: data.avatarUrl
                }));

                setAvatarEditorOpen(false);
            } else {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Failed to upload avatar');
            }
        } catch (error) {
            console.error('Error saving avatar:', error);
            toast({
                variant: 'destructive',
                title: '保存エラー',
                description: error instanceof Error ? error.message : 'アバターの保存に失敗しました。'
            });
        } finally {
            setAvatarSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <LoadingSpinner className="h-8 w-8 animate-spin mx-auto" />
                        <p className="text-muted-foreground">読み込み中...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <div className="text-center">
                    <p className="text-muted-foreground">プロフィールデータを読み込めませんでした。</p>
                </div>
            </div>
        );
    }
    return (
        <div className="container mx-auto max-w-4xl py-8">
            <h1 className="text-2xl font-headline mb-6">設定</h1>
            <div className="grid gap-8 md:grid-cols-[180px_1fr]">
                <nav className="grid gap-1 text-muted-foreground">
                    <Link href="#profile" className="font-semibold text-primary">プロフィール編集</Link>
                    <Link href="#account" className="hover:text-foreground">アカウント</Link>
                    <Link href="#notifications" className="hover:text-foreground">通知</Link>
                    <Link href="#privacy" className="hover:text-foreground">プライバシー</Link>
                </nav>
                <div className="grid gap-6">

                    {/* Profile Section */}
                    <Card id="profile">
                        <CardHeader>
                            <CardTitle>プロフィール編集</CardTitle>
                            <CardDescription>公開プロフィール情報を更新します。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Banner Upload */}
                            <div className="space-y-2">
                                <Label>プロフィールバナー</Label>
                                <BannerUpload
                                    currentBanner={formData.banner_url}
                                    onBannerChange={handleBannerUpload}
                                    isUploading={bannerUploading}
                                />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={userProfile.avatarUrl} />
                                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Dialog open={avatarEditorOpen} onOpenChange={setAvatarEditorOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">アバターを作成</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>カワイイアバターを作成</DialogTitle>
                                        </DialogHeader>
                                        <KawaiiGenerator 
                                            onSave={handleAvatarSave}
                                            isSaving={avatarSaving}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">氏名</Label>
                                <Input 
                                    id="name" 
                                    value={formData.display_name} 
                                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">ユーザーネーム</Label>
                                <Input id="username" value={userProfile.username} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">自己紹介</Label>
                                <Textarea 
                                    id="bio" 
                                    value={formData.bio} 
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    rows={4} 
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleProfileSave} disabled={saving}>
                                {saving ? '保存中...' : 'プロフィールを保存'}
                            </Button>
                        </CardFooter>
                    </Card>

                     {/* Account Section */}
                    <Card id="account">
                        <CardHeader>
                            <CardTitle>アカウント</CardTitle>
                            <CardDescription>アカウント設定を管理します。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input id="email" type="email" value={userProfile.email} disabled />
                            </div>
                             <Separator />
                             <div>
                                <h3 className="font-semibold mb-2">パスワードの変更</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">現在のパスワード</Label>
                                    <Input id="current-password" type="password" autoComplete="current-password" />
                                </div>
                                <div className="space-y-2 mt-2">
                                    <Label htmlFor="new-password">新しいパスワード</Label>
                                    <Input id="new-password" type="password" autoComplete="new-password" />
                                </div>
                             </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button>アカウント情報を保存</Button>
                            <Button variant="destructive">アカウントを削除</Button>
                        </CardFooter>
                    </Card>

                    {/* Notifications Section */}
                    <Card id="notifications">
                        <CardHeader>
                            <CardTitle>通知</CardTitle>
                            <CardDescription>通知の受け取り方法を選択してください。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-base">メール通知</Label>
                                    <p className="text-sm text-muted-foreground">
                                        重要な更新やダイジェストをメールで受け取ります。
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-base">プッシュ通知</Label>
                                    <p className="text-sm text-muted-foreground">
                                        「いいね」やコメントなどに関するリアルタイム通知。
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>通知設定を保存</Button>
                        </CardFooter>
                    </Card>

                </div>
            </div>
        </div>
    );
}