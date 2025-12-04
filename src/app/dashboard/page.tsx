'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import LoadingSpinner from "@/components/common/loading-state";
import { fileToDataUri } from "@/lib/utils";
import { TipButton } from "@/components/wallet/tip-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AvatarSetupModal from "@/components/dashboard/AvatarSetupModal";
import FirstTimeUserOnboardingModal from "@/components/dashboard/FirstTimeUserOnboardingModal";

interface Post {
    id: number;
    author: {
        name: string;
        username: string;
        avatarUrl: string;
    };
    content: string;
    imageUrl?: string;
    imageHint?: string;
    videoUrl?: string;
    likes: number;
    comments: number;
    timestamp: string;
    isLiked: boolean;
    isBookmarked: boolean;
}

interface UserProfile {
    name: string;
    username: string;
    avatarUrl: string;
}

const EMOJIS = ['😊', '😂', '😍', '🤔', '😢', '🙏', '❤️', '✨', '🎉', '🔥', '👍', '🌿'];

export default function DashboardPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setError(null);
                setLoading(true);

                const token = localStorage.getItem('auth_token');
                // We don't throw error if token is missing, as we might have cookies
                // if (!token) {
                //     throw new Error('No auth token found');
                // }

                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const profileResponse = await fetch('/api/profile', {
                    headers,
                });

                if (!profileResponse.ok) {
                    if (profileResponse.status === 401) {
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('auth_token');
                            router.push('/login');
                        }
                        toast({
                            variant: 'destructive',
                            title: 'セッションが切れました',
                            description: '再度ログインしてください',
                        });
                        return;
                    }
                    throw new Error(`Profile fetch failed: ${profileResponse.status}`);
                }

                const profileData = await profileResponse.json();
                setUserProfile(profileData.profile);

                const postsResponse = await fetch('/api/posts', {
                    headers,
                });

                if (!postsResponse.ok) {
                    if (postsResponse.status === 401) {
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('auth_token');
                            router.push('/login');
                        }
                        return;
                    }

                    console.error('Posts API failed, using fallback');
                    setPosts([]);
                } else {
                    const postsData = await postsResponse.json();
                    setPosts(postsData.posts || []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error instanceof Error ? error.message : 'Unknown error');

                if (user) {
                    setUserProfile({
                        name: user.profile?.display_name || 'ユーザー名',
                        username: user.email?.split('@')[0] || 'user',
                        avatarUrl: user.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, router, toast]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUri = await fileToDataUri(file);
                setMediaUrl(dataUri);
                setMediaType(file.type.startsWith('image') ? 'image' : 'video');
            } catch (error) {
                toast({ variant: 'destructive', title: 'ファイル処理エラー', description: 'ファイルの読み込み中にエラーが発生しました。' });
            }
        }
    };

    const removeMedia = () => {
        setMediaUrl(null);
        setMediaType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleNewPost = async () => {
        if (!newPostContent.trim() && !mediaUrl) {
            toast({
                variant: 'destructive',
                title: '投稿は空にできません',
                description: '何かメッセージを入力するか、メディアをアップロードしてください。',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const postData: any = { content: newPostContent };
            if (mediaUrl) {
                if (mediaType === 'image') {
                    postData.imageUrl = mediaUrl;
                    postData.imageHint = "user uploaded content";
                } else {
                    postData.videoUrl = mediaUrl;
                }
            }

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers,
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                const data = await response.json();
                setPosts([data.post, ...posts]);
                setNewPostContent('');
                setMediaUrl(null);
                setMediaType(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                toast({
                    title: '投稿しました！',
                    description: 'あなたの考えが共有されました。',
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast({
                variant: 'destructive',
                title: '投稿エラー',
                description: '投稿の保存中にエラーが発生しました。',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addEmoji = (emoji: string) => {
        setNewPostContent(currentContent => currentContent + emoji);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen bg-[#f8f7f6] dark:bg-[#221810]">
                    <div className="text-center space-y-4">
                        <LoadingSpinner className="h-8 w-8 animate-spin mx-auto" />
                        <p className="text-[#897261] dark:text-gray-400">読み込み中...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen bg-[#f8f7f6] dark:bg-[#221810]">
                    <div className="text-center space-y-4">
                        <p className="text-red-600">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            再読み込み
                        </Button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const displayName = userProfile?.name || user?.profile?.display_name || 'ユーザー名';
    const avatarUrl = userProfile?.avatarUrl || user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100";

    return (
        <ProtectedRoute>
            <FirstTimeUserOnboardingModal />
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8f7f6] dark:bg-[#221810] text-[#181411] dark:text-gray-200 font-sans">
                <div className="layout-container flex h-full grow flex-col">
                    <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                            {/* Header */}
                            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e6e0db] dark:border-gray-700 px-4 md:px-10 py-3 bg-white/80 dark:bg-[#221810]/80 backdrop-blur-sm sticky top-0 z-10 rounded-xl">
                                <div className="flex items-center gap-4 text-[#181411] dark:text-white">
                                    <div className="size-6 text-[#ec6d13]">
                                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">ソーシャル</h2>
                                </div>
                                <div className="flex flex-1 justify-end gap-4 sm:gap-8">
                                    <div className="hidden md:flex items-center gap-9">
                                        <a className="text-sm font-medium leading-normal hover:text-[#ec6d13] dark:hover:text-[#ec6d13]" href="/dashboard">ホーム</a>
                                        <a className="text-sm font-medium leading-normal hover:text-[#ec6d13] dark:hover:text-[#ec6d13]" href="#">マーケットプレイス</a>
                                        <a className="text-sm font-medium leading-normal hover:text-[#ec6d13] dark:hover:text-[#ec6d13]" href="#">ウォレット</a>
                                    </div>
                                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-[#f4f2f0] dark:bg-gray-800 text-[#181411] dark:text-gray-200 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                                        <span className="material-symbols-outlined">notifications</span>
                                    </button>
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                        style={{ backgroundImage: `url("${avatarUrl}")` }}>
                                    </div>
                                </div>
                            </header>

                            <main className="flex flex-col gap-8 mt-8">
                                {/* Welcome Section */}
                                <div className="flex flex-wrap justify-between gap-3 p-4">
                                    <p className="text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">こんにちは, {displayName}さん</p>
                                </div>

                                {/* Create Post Section */}
                                <div className="p-4">
                                    <div className="flex flex-col gap-4 rounded-xl border border-[#e6e0db] dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 shadow-[0_0_4px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex-shrink-0"
                                                style={{ backgroundImage: `url("${avatarUrl}")` }}>
                                            </div>
                                            <div className="flex-grow">
                                                <Textarea
                                                    placeholder={`何を考えていますか、${displayName}さん？`}
                                                    className="bg-[#f8f7f6] dark:bg-gray-800 border-none resize-none min-h-[60px]"
                                                    value={newPostContent}
                                                    onChange={(e) => setNewPostContent(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {mediaUrl && (
                                            <div className="relative w-fit mx-auto">
                                                {mediaType === 'image' ? (
                                                    <Image src={mediaUrl} alt="プレビュー" width={400} height={300} className="rounded-md max-h-72 w-auto object-contain" />
                                                ) : (
                                                    <video src={mediaUrl} controls className="rounded-md max-h-72 w-auto" />
                                                )}
                                                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={removeMedia}>
                                                    ×
                                                </Button>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-1">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*,video/*"
                                                    onChange={handleFileChange}
                                                />
                                                <Button variant="ghost" size="icon" className="text-[#897261]" onClick={() => fileInputRef.current?.click()}>
                                                    <span className="material-symbols-outlined">add_a_photo</span>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-[#897261]" onClick={() => fileInputRef.current?.click()}>
                                                    <span className="material-symbols-outlined">videocam</span>
                                                </Button>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-[#897261]">
                                                            <span className="material-symbols-outlined">sentiment_satisfied</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-2">
                                                        <div className="grid grid-cols-6 gap-1">
                                                            {EMOJIS.map(emoji => (
                                                                <Button key={emoji} variant="ghost" size="icon" onClick={() => addEmoji(emoji)}>{emoji}</Button>
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <Button
                                                onClick={handleNewPost}
                                                disabled={(!newPostContent.trim() && !mediaUrl) || isSubmitting}
                                                className="bg-[#ec6d13] hover:bg-[#d45f0f] text-white"
                                            >
                                                {isSubmitting ? '投稿中...' : '投稿する'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Section */}
                                <div className="flex flex-wrap gap-4 p-4">
                                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#e6e0db] dark:border-gray-700 bg-white dark:bg-gray-800/50">
                                        <p className="text-base font-medium leading-normal">フォロワー</p>
                                        <p className="tracking-light text-2xl font-bold leading-tight">1,204</p>
                                    </div>
                                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#e6e0db] dark:border-gray-700 bg-white dark:bg-gray-800/50">
                                        <p className="text-base font-medium leading-normal">投稿</p>
                                        <p className="tracking-light text-2xl font-bold leading-tight">{posts.length}</p>
                                    </div>
                                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#e6e0db] dark:border-gray-700 bg-white dark:bg-gray-800/50">
                                        <p className="text-base font-medium leading-normal">出品中の商品</p>
                                        <p className="tracking-light text-2xl font-bold leading-tight">12</p>
                                    </div>
                                </div>

                                {/* Posts Feed */}
                                <div className="p-4">
                                    <div className="flex flex-col gap-4">
                                        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">最近のアクティビティ</h2>
                                        {posts.length === 0 ? (
                                            <div className="flex items-center justify-center py-8 text-center">
                                                <p className="text-[#897261] dark:text-gray-400">まだ投稿がありません。最初の投稿を作成しましょう！</p>
                                            </div>
                                        ) : (
                                            posts.map(post => (
                                                <div key={post.id} className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_0_4px_rgba(0,0,0,0.1)] bg-white dark:bg-gray-800/50 overflow-hidden border border-transparent dark:border-gray-700">
                                                    {post.imageUrl && (
                                                        <div className="w-full bg-center bg-no-repeat aspect-video bg-cover">
                                                            <Image
                                                                src={post.imageUrl}
                                                                alt="投稿画像"
                                                                width={600}
                                                                height={400}
                                                                className="w-full h-auto object-cover"
                                                                data-ai-hint={post.imageHint}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 px-4">
                                                        <p className="text-sm font-normal leading-normal text-[#897261] dark:text-gray-400">投稿</p>
                                                        <p className="text-lg font-bold leading-tight tracking-[-0.015em]">{post.content}</p>
                                                        <div className="flex items-end gap-3 justify-between mt-2">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-4 text-[#897261] dark:text-gray-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-base">favorite</span> {post.likes}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-base">chat_bubble</span> {post.comments}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button className="bg-[#ec6d13] hover:bg-[#d45f0f] text-white text-sm font-medium leading-normal">
                                                                投稿を見る
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </main>

                            {/* Footer */}
                            <footer className="mt-16 border-t border-solid border-[#e6e0db] dark:border-gray-700 py-8 px-4">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#897261] dark:text-gray-400">
                                    <p>© 2024 ソーシャル. All rights reserved.</p>
                                    <div className="flex items-center gap-6">
                                        <a className="hover:text-[#ec6d13] dark:hover:text-[#ec6d13]" href="#">会社概要</a>
                                        <a className="hover:text-[#ec6d13] dark:hover:text-[#ec6d13]" href="#">ヘルプ</a>
                                        <a className="hover:text-[#ec6d13] dark:hover:text-[#ec6d13]" href="#">利用規約</a>
                                        <a className="hover:text-[#ec6d13] dark:hover:text-[#ec6d13]" href="#">プライバシーポリシー</a>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
