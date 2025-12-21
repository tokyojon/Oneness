'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Grid3x3, Settings, UserPlus, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/lib/icons";

interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string;
    bannerUrl: string;
    bio: string;
    posts: number;
    followers: number;
    following: number;
    op_balance: number;
    created_at: string;
    updated_at: string;
}

interface UserPost {
    id: string;
    imageUrl: string;
    imageHint: string;
    likes: number;
    comments: number;
    created_at: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<UserPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                console.log('Profile page - Starting data fetch...');
                const guestUserId = localStorage.getItem('guest_user_id');

                console.log('Profile page - Fetching profile data...');
                const response = await fetch('/api/profile', {
                    headers: {
                        'x-guest-user-id': guestUserId || '',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Profile page - Data received:', data);
                    setUserProfile(data.profile);
                    setUserPosts(data.posts || []);
                    console.log('Profile page - Posts set:', data.posts?.length || 0, 'posts');
                } else {
                    console.error('Profile page - Failed to fetch profile data:', response.status);
                    const errorData = await response.json();
                    console.error('Profile page - Error:', errorData);
                    // Fallback to basic user data
                    setUserProfile({
                        id: user?.id || '',
                        name: user?.profile?.display_name || 'ユーザー',
                        username: user?.email?.split('@')[0] || 'user',
                        email: user?.email || '',
                        avatarUrl: user?.profile?.avatar_url || "https://picsum.photos/seed/user1/200/200",
                        bannerUrl: user?.profile?.banner_url || "/default_banner.png",
                        bio: user?.profile?.bio || "ワンネスキングダムの市民。貢献とつながりを大切にしています。",
                        posts: 0,
                        followers: 0,
                        following: 0,
                        op_balance: user?.points?.total || 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                    setUserPosts([]);
                }
            } catch (error) {
                console.error('Profile page - Error fetching profile data:', error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

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
            {/* Desktop Banner Section */}
            <div className="hidden md:block mb-6">
                <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
                    <Image 
                        src={userProfile.bannerUrl} 
                        alt="Profile Banner" 
                        layout="fill"
                        objectFit="cover"
                        className="w-full h-full"
                    />
                </div>
            </div>

            <header className="flex items-center gap-8 md:gap-16 px-4">
                <Avatar className="w-24 h-24 md:w-36 md:h-36 border-4 border-background ring-2 ring-primary">
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-4 flex-grow">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-light">{userProfile.username}</h1>
                        <div className="flex gap-2">
                             <Button variant="secondary">フォロー中</Button>
                             <Button variant="secondary">メッセージ</Button>
                             <Link href="/dashboard/settings">
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-5 w-5" />
                                </Button>
                             </Link>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-8">
                        <p><span className="font-semibold">{userProfile.posts}</span> 投稿</p>
                        <p><span className="font-semibold">{userProfile.followers}</span> フォロワー</p>
                        <p><span className="font-semibold">{userProfile.following}</span> フォロー中</p>
                        <p><span className="font-semibold text-primary">🪙 {userProfile.op_balance}</span> OP</p>
                    </div>
                     <div>
                        <h2 className="font-semibold">{userProfile.name}</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{userProfile.bio}</p>
                    </div>
                </div>
            </header>
            
            <div className="flex justify-around md:hidden border-t mt-4 pt-2 text-sm text-center">
                <div><p className="font-semibold">{userProfile.posts}</p><p className="text-muted-foreground">投稿</p></div>
                <div><p className="font-semibold">{userProfile.followers}</p><p className="text-muted-foreground">フォロワー</p></div>
                <div><p className="font-semibold">{userProfile.following}</p><p className="text-muted-foreground">フォロー中</p></div>
            </div>

            <main className="mt-8">
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full justify-center border-t">
                        <TabsTrigger value="posts" className="gap-2"><Grid3x3 className="w-4 h-4" />投稿</TabsTrigger>
                        <TabsTrigger value="saved" className="gap-2"><Bookmark className="w-4 h-4" />保存済み</TabsTrigger>
                        <TabsTrigger value="tagged" className="gap-2"><Tag className="w-4 h-4" />タグ付けされた投稿</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts">
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {userPosts.map(post => (
                                <div key={post.id} className="aspect-square relative group cursor-pointer">
                                    <Image src={post.imageUrl} alt="投稿画像" layout="fill" objectFit="cover" data-ai-hint={post.imageHint} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4">
                                        <span>❤️ {Math.floor(Math.random() * 1000)}</span>
                                        <span>💬 {Math.floor(Math.random() * 100)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="saved">
                        <p className="text-center py-16 text-muted-foreground">保存済みの投稿はここに表示されます。</p>
                    </TabsContent>
                    <TabsContent value="tagged">
                        <p className="text-center py-16 text-muted-foreground">タグ付けされた投稿はここに表示されます。</p>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}