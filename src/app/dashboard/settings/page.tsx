'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/lib/icons";
import KawaiiGenerator, { GeneratedAvatarPayload } from "@/components/KawaiiGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase'; // Import supabase directly for robust token retrieval

interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string;
    bannerUrl: string;
    bio: string;
    website?: string;
    location?: string;
    created_at: string;
    updated_at: string;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
    const [avatarSaving, setAvatarSaving] = useState(false);

    // Form state corresponding to the new UI fields
    const [formData, setFormData] = useState({
        display_name: '',
        username: '', // usually read-only or depends on backend
        bio: '',
        website: '',
        location: '',
        avatar_url: ''
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Use robust token retrieval
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token || localStorage.getItem('auth_token');

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
                        username: data.profile.username || '', // Display only usually
                        bio: data.profile.bio || '',
                        website: data.profile.website || '',
                        location: data.profile.location || 'Tokyo, Japan', // Default or fetched
                        avatar_url: data.profile.avatarUrl || ''
                    });
                } else {
                    console.error('Failed to fetch profile data');
                    // Fallback to basic user data
                    const fallbackProfile = {
                        id: user?.id || '',
                        name: user?.profile?.display_name || 'Kenji Tanaka', // Fallback to design default if absolutely nothing
                        username: user?.email?.split('@')[0] || 'kenji_t',
                        email: user?.email || '',
                        avatarUrl: user?.profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDfwO1Jx9MFwaP4l1MUwMTUAIkibQ-Z9TCrPDzL0ZKDpyidnRfYCnjnwPBjvsU6JkfSg2ah5i48ilhfk0_JT13VBAwanriDu0b2XQ5LyM7ubfm1bX8bNhuoqzlA92hHgoTTH2OvyVkxDz_mDgO4H2-RJxYF54_GHwSIWKcglcRTmws5KZSOy8LKOy692HTq_pLxFnJ2wF-me6dH-a6rI-mgp75kcha02TLHGOatBPFIe0V6kMOyqQtyYROU_pUeSpN3YB2ZaB4MP6w",
                        bannerUrl: user?.profile?.banner_url || "/default_banner.png",
                        bio: user?.profile?.bio || "Designer based in Tokyo. Love minimalism and nature.",
                        website: "https://kenji-design.jp",
                        location: "Tokyo, Japan",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    setUserProfile(fallbackProfile);
                    setFormData({
                        display_name: fallbackProfile.name,
                        username: fallbackProfile.username,
                        bio: fallbackProfile.bio,
                        website: fallbackProfile.website,
                        location: fallbackProfile.location,
                        avatar_url: fallbackProfile.avatarUrl
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

    const handleProfileSave = async () => {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Not authenticated');
            }

            // Note: API/profile only expects partial updates. 
            // We map our form data to what the API likely expects or extend it.
            // Existing API route seemed to accept everything in body.
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    display_name: formData.display_name,
                    bio: formData.bio,
                    // If API supports website/location, they will be saved. If not, they'll be ignored.
                    website: formData.website,
                    location: formData.location
                }),
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
                        website: formData.website,
                        location: formData.location,
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

    const handleAvatarSave = async (avatarData: { avatar: GeneratedAvatarPayload['avatarConfig']; imageUrl: string }) => {
        setAvatarSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Not authenticated');
            }

            // Resize and convert to blob
            // Using a simple fetch here as a hack if we don't have the resize utility imported
            // But ideally we should import `resizeImage` from utils if available or just send as is.
            // Existing code used `resizeImage` from `AvatarSetupModal`. I'll try to just convert blob directly.
            const response = await fetch(avatarData.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

            // Create form data for upload
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('avatar_config', JSON.stringify(avatarData.avatar));

            // Upload avatar
            const uploadResponse = await fetch('/api/upload/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataUpload,
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
            <div className="flex items-center justify-center min-h-screen bg-[#f8f7f6] dark:bg-[#221810]">
                <div className="text-center space-y-4">
                    <LoadingSpinner className="h-8 w-8 animate-spin mx-auto" />
                    <p className="text-[#897261] dark:text-[#a19891]">読み込み中...</p>
                </div>
            </div>
        );
    }

    // Avatar URL helper
    const avatarUrl = formData.avatar_url || userProfile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDfwO1Jx9MFwaP4l1MUwMTUAIkibQ-Z9TCrPDzL0ZKDpyidnRfYCnjnwPBjvsU6JkfSg2ah5i48ilhfk0_JT13VBAwanriDu0b2XQ5LyM7ubfm1bX8bNhuoqzlA92hHgoTTH2OvyVkxDz_mDgO4H2-RJxYF54_GHwSIWKcglcRTmws5KZSOy8LKOy692HTq_pLxFnJ2wF-me6dH-a6rI-mgp75kcha02TLHGOatBPFIe0V6kMOyqQtyYROU_pUeSpN3YB2ZaB4MP6w";

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f8f7f6] dark:bg-[#221810] group/design-root text-[#181411] dark:text-[#f4f2f0] font-sans">
            <header className="sticky top-0 z-10 flex w-full items-center justify-between whitespace-nowrap border-b border-solid border-[#e6e0db] dark:border-[#3f362e] px-4 sm:px-10 py-3 bg-white/80 dark:bg-[#181411]/80 backdrop-blur-sm">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-[#181411] dark:text-[#f4f2f0]">
                        <div className="size-6 text-[#ec6d13]">
                            {/* Logo Icon */}
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z"
                                    fill="currentColor"></path>
                                <path clipRule="evenodd"
                                    d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z"
                                    fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">SocialConnect</h2>
                    </div>
                </div>
                <div className="flex flex-1 justify-end gap-2 sm:gap-4 items-center">
                    <div className="hidden md:flex items-center gap-6">
                        <a className="text-sm font-medium leading-normal hover:text-[#ec6d13]" href="/dashboard">ホーム</a>
                        <a className="text-sm font-medium leading-normal hover:text-[#ec6d13]" href="#">発見</a>
                        <a className="text-sm font-medium leading-normal hover:text-[#ec6d13]" href="#">メッセージ</a>
                    </div>
                    <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ec6d13] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d45f0f] transition-colors">
                        <span className="truncate">投稿する</span>
                    </button>
                    <button
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f4f2f0] dark:bg-[#2d241c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{ backgroundImage: `url("${avatarUrl}")` }}>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 justify-center py-5 sm:py-10 px-4">
                <div className="flex w-full max-w-6xl gap-8">
                    <aside className="w-1/4 hidden md:block">
                        <div className="flex h-full flex-col justify-between rounded-xl bg-white dark:bg-[#181411] p-4 border border-[#e6e0db] dark:border-[#3f362e] sticky top-24">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-3 items-center">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                        style={{ backgroundImage: `url("${avatarUrl}")` }}>
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-base font-medium leading-normal">{formData.display_name || userProfile?.name}</h1>
                                        <p className="text-[#897261] dark:text-[#a19891] text-sm font-normal leading-normal">@{formData.username || userProfile?.username}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-4">
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f4f2f0] dark:bg-[#2d241c] hover:bg-[#e6e0db] transition-colors" href="#profile">
                                        <span className="material-symbols-outlined text-2xl !font-light" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                                        <p className="text-sm font-medium leading-normal">プロフィール編集</p>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f4f2f0] dark:hover:bg-[#2d241c] transition-colors" href="#notifications">
                                        <span className="material-symbols-outlined text-2xl !font-light">notifications</span>
                                        <p className="text-sm font-medium leading-normal">通知設定</p>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f4f2f0] dark:hover:bg-[#2d241c] transition-colors" href="#privacy">
                                        <span className="material-symbols-outlined text-2xl !font-light">lock</span>
                                        <p className="text-sm font-medium leading-normal">プライバシー設定</p>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f4f2f0] dark:hover:bg-[#2d241c] transition-colors" href="#security">
                                        <span className="material-symbols-outlined text-2xl !font-light">shield</span>
                                        <p className="text-sm font-medium leading-normal">セキュリティ</p>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors" href="#delete">
                                        <span className="material-symbols-outlined text-2xl !font-light">delete</span>
                                        <p className="text-sm font-medium leading-normal">アカウント削除</p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 flex flex-col gap-8">
                        {/* Profile Section */}
                        <section className="flex flex-col gap-6 p-6 rounded-xl bg-white dark:bg-[#181411] border border-[#e6e0db] dark:border-[#3f362e]" id="profile">
                            <div className="flex flex-col gap-2 pb-4 border-b border-[#e6e0db] dark:border-[#3f362e]">
                                <h3 className="text-2xl font-bold leading-tight tracking-[-0.033em]">プロフィール編集</h3>
                                <p className="text-[#897261] dark:text-[#a19891] text-base font-normal leading-normal">公開プロフィール情報を更新します。</p>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="relative group">
                                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24"
                                            style={{ backgroundImage: `url("${avatarUrl}")` }}>
                                        </div>
                                        <Dialog open={avatarEditorOpen} onOpenChange={setAvatarEditorOpen}>
                                            <button onClick={() => setAvatarEditorOpen(true)} className="absolute bottom-0 right-0 flex items-center justify-center size-8 rounded-full bg-[#f4f2f0] dark:bg-[#2d241c] border border-[#e6e0db] dark:border-[#3f362e] hover:bg-[#e6e0db] dark:hover:bg-[#3f362e] transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>アバターを編集</DialogTitle>
                                                </DialogHeader>
                                                <KawaiiGenerator
                                                    onSave={handleAvatarSave}
                                                    isSaving={avatarSaving}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-base font-medium leading-normal">プロフィール写真</p>
                                        <p className="text-[#897261] dark:text-[#a19891] text-sm font-normal leading-normal">新しい画像をアップロードしてプロフィール写真を変更します。</p>
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => setAvatarEditorOpen(true)} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-[#f4f2f0] dark:bg-[#2d241c] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e6e0db] transition-colors">
                                                <span className="truncate">画像をアップロード</span>
                                            </button>
                                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 text-[#897261] dark:text-[#a19891] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#f4f2f0] dark:hover:bg-[#2d241c] transition-colors">
                                                <span className="truncate">削除</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    <label className="flex flex-col min-w-40 flex-1">
                                        <p className="text-sm font-medium leading-normal pb-2">表示名</p>
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] h-12 placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal"
                                            value={formData.display_name}
                                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-col min-w-40 flex-1">
                                        <p className="text-sm font-medium leading-normal pb-2">ユーザー名</p>
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] h-12 placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal disabled:opacity-50"
                                            value={formData.username}
                                            disabled
                                            readOnly
                                        />
                                    </label>
                                    <label className="flex flex-col min-w-40 flex-1 md:col-span-2">
                                        <p className="text-sm font-medium leading-normal pb-2">自己紹介</p>
                                        <textarea
                                            className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] min-h-[120px] placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-col min-w-40 flex-1">
                                        <p className="text-sm font-medium leading-normal pb-2">ウェブサイト</p>
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] h-12 placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal"
                                            placeholder="https://..."
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-col min-w-40 flex-1">
                                        <p className="text-sm font-medium leading-normal pb-2">場所</p>
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] h-12 placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal"
                                            placeholder="例：東京、日本"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e0db] dark:border-[#3f362e]">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f4f2f0] dark:bg-[#2d241c] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e6e0db] transition-colors">
                                    <span className="truncate">キャンセル</span>
                                </button>
                                <button
                                    onClick={handleProfileSave}
                                    disabled={saving}
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ec6d13] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d45f0f] transition-colors disabled:opacity-70">
                                    <span className="truncate">{saving ? '保存中...' : '保存'}</span>
                                </button>
                            </div>
                        </section>

                        {/* Notifications Section */}
                        <section className="flex flex-col gap-6 p-6 rounded-xl bg-white dark:bg-[#181411] border border-[#e6e0db] dark:border-[#3f362e]" id="notifications">
                            <div className="flex flex-wrap justify-between gap-3 pb-4 border-b border-[#e6e0db] dark:border-[#3f362e]">
                                <div className="flex flex-col gap-2">
                                    <p className="text-2xl font-bold leading-tight tracking-[-0.033em]">通知設定</p>
                                    <p className="text-[#897261] dark:text-[#a19891] text-base font-normal leading-normal">通知の受け取り方を管理します。</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 p-4">
                                {/* Toggles (Mock Functionality) */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">新しいフォロワー</p>
                                        <p className="text-sm text-[#897261] dark:text-[#a19891]">新しいフォロワーができたときに通知します。</p>
                                    </div>
                                    <button aria-checked="true" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#ec6d13] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2" role="switch">
                                        <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">コメント</p>
                                        <p className="text-sm text-[#897261] dark:text-[#a19891]">あなたの投稿にコメントがあったときに通知します。</p>
                                    </div>
                                    <button aria-checked="true" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#ec6d13] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2" role="switch">
                                        <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">メール通知</p>
                                        <p className="text-sm text-[#897261] dark:text-[#a19891]">重要な更新をメールで受け取ります。</p>
                                    </div>
                                    <button aria-checked="true" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#ec6d13] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2" role="switch">
                                        <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 p-4 mt-4 border-t border-[#e6e0db] dark:border-[#3f362e]">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ec6d13] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d45f0f] transition-colors">
                                    <span className="truncate">変更を保存</span>
                                </button>
                            </div>
                        </section>

                        {/* Privacy Section */}
                        <section className="flex flex-col gap-6 p-6 rounded-xl bg-white dark:bg-[#181411] border border-[#e6e0db] dark:border-[#3f362e]" id="privacy">
                            <div className="flex flex-wrap justify-between gap-3 pb-4 border-b border-[#e6e0db] dark:border-[#3f362e]">
                                <div className="flex flex-col gap-2">
                                    <p className="text-2xl font-bold leading-tight tracking-[-0.033em]">プライバシー設定</p>
                                    <p className="text-[#897261] dark:text-[#a19891] text-base font-normal leading-normal">アカウントの公開範囲を管理します。</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">非公開アカウント</p>
                                        <p className="text-sm text-[#897261] dark:text-[#a19891]">オンにすると、あなたが承認した人のみがあなたの投稿を見ることができます。</p>
                                    </div>
                                    <button aria-checked="false" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2" role="switch">
                                        <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Security Section - Simplifed for visual match, functional later */}
                        <section className="flex flex-col gap-6 p-6 rounded-xl bg-white dark:bg-[#181411] border border-[#e6e0db] dark:border-[#3f362e]" id="security">
                            <div className="flex flex-wrap justify-between gap-3 pb-4 border-b border-[#e6e0db] dark:border-[#3f362e]">
                                <div className="flex flex-col gap-2">
                                    <p className="text-2xl font-bold leading-tight tracking-[-0.033em]">セキュリティ</p>
                                    <p className="text-[#897261] dark:text-[#a19891] text-base font-normal leading-normal">パスワードの変更とアカウントの保護。</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                <label className="flex flex-col min-w-40 flex-1">
                                    <p className="text-sm font-medium leading-normal pb-2">現在のパスワード</p>
                                    <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] h-12 placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal" type="password" value="••••••••••" readOnly />
                                </label>
                                <div></div>
                                <label className="flex flex-col min-w-40 flex-1">
                                    <p className="text-sm font-medium leading-normal pb-2">新しいパスワード</p>
                                    <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] h-12 placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal" placeholder="新しいパスワードを入力" type="password" />
                                </label>
                                <label className="flex flex-col min-w-40 flex-1">
                                    <p className="text-sm font-medium leading-normal pb-2">新しいパスワードの確認</p>
                                    <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#ec6d13] border border-[#e6e0db] dark:border-[#3f362e] bg-transparent focus:border-[#ec6d13] h-12 placeholder:text-[#897261] dark:placeholder:text-[#a19891] p-[15px] text-base font-normal leading-normal" placeholder="パスワードを再入力" type="password" />
                                </label>
                            </div>
                            <div className="flex justify-end gap-4 p-4 mt-4 border-t border-[#e6e0db] dark:border-[#3f362e]">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ec6d13] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d45f0f] transition-colors">
                                    <span className="truncate">パスワードを更新</span>
                                </button>
                            </div>
                        </section>

                        {/* Delete Account Section */}
                        <section className="flex flex-col gap-6 p-6 rounded-xl bg-white dark:bg-[#181411] border border-[#e6e0db] dark:border-[#3f362e]" id="delete">
                            <div className="flex flex-wrap justify-between gap-3">
                                <div className="flex flex-col gap-2">
                                    <p className="text-2xl font-bold leading-tight tracking-[-0.033em]">アカウント削除</p>
                                    <p className="text-[#897261] dark:text-[#a19891] text-base font-normal leading-normal">アカウントを恒久的に削除します。</p>
                                </div>
                            </div>
                            <div className="p-4 bg-red-500/10 rounded-lg">
                                <p className="text-red-700 dark:text-red-300 text-sm">
                                    この操作は元に戻せません。アカウントを削除すると、すべてのプロフィール、投稿、写真、コメントが完全に削除されます。続行する前に、必要なデータをすべてバックアップしてください。
                                </p>
                            </div>
                            <div className="flex justify-start p-4">
                                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
                                    <span className="truncate">アカウントを完全に削除する</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}