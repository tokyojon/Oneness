

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Send, Smile, Video, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fileToDataUri } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { TipButton } from "@/components/wallet/tip-button";
import { useEffect } from "react";

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
}

interface Story {
    id: number;
    username: string;
    avatarUrl: string;
}

interface Suggestion {
    id: number;
    name: string;
    username: string;
    avatarUrl: string;
}

// Main Component
export default function DashboardPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Fetch live data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch user profile data
                const token = localStorage.getItem('auth_token');
                if (token) {
                    const profileResponse = await fetch('/api/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (profileResponse.ok) {
                        const profileData = await profileResponse.json();
                        setUserProfile(profileData.profile);
                    }
                }

                // In a real implementation, these would be separate API calls
                // For now, we'll use empty arrays and let the user create content
                setPosts([]);
                setStories([]);
                setSuggestions([]);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleNewPost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
        const newPost: Post = {
            id: Date.now(),
            author: {
                name: userProfile?.name || user?.profile?.display_name || 'ユーザー',
                username: userProfile?.username || user?.email?.split('@')[0] || 'user',
                avatarUrl: userProfile?.avatarUrl || user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100"
            },
            content,
            likes: 0,
            comments: 0,
            timestamp: "たった今",
        };
        if (mediaUrl) {
            if (mediaType === 'image') {
                 newPost.imageUrl = mediaUrl;
                 newPost.imageHint = "user uploaded content";
            } else {
                 newPost.videoUrl = mediaUrl;
            }
        }
        setPosts([newPost, ...posts]);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground">読み込み中...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <Stories stories={stories} />
                <CreatePostCard onNewPost={handleNewPost} />
                {posts.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">まだ投稿がありません。最初の投稿を作成しましょう！</p>
                        </CardContent>
                    </Card>
                ) : (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                )}
                <RightSidebar suggestions={suggestions} />
            </div>
        </ProtectedRoute>
    );
}

// Sub-components
const Stories = ({ stories }: { stories: Story[] }) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex space-x-4 overflow-x-auto pb-2">
                {stories.map((story: Story) => (
                    <Link href="/dashboard/profile" key={story.id}>
                        <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
                            <Avatar className="h-16 w-16 border-2 border-pink-500 p-0.5">
                                <AvatarImage src={story.avatarUrl} alt={story.username} />
                                <AvatarFallback>{story.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{story.username}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </CardContent>
    </Card>
);

const EMOJIS = ['😊', '😂', '😍', '🤔', '😢', '🙏', '❤️', '✨', '🎉', '🔥', '👍', '🌿'];

const CreatePostCard = ({ onNewPost }: { onNewPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<any>(null);

    // Fetch fresh user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;

                const response = await fetch('/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data.profile);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    // Use fresh profile data or fallback to localStorage data
    const displayName = userProfile?.name || user?.profile?.display_name || 'ユーザー';
    const avatarUrl = userProfile?.avatarUrl || user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100";

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

    const handleMediaButtonClick = () => {
        fileInputRef.current?.click();
    };

    const removeMedia = () => {
        setMediaUrl(null);
        setMediaType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (!content.trim() && !mediaUrl) {
            toast({
                variant: 'destructive',
                title: '投稿は空にできません',
                description: '何かメッセージを入力するか、メディアをアップロードしてください。',
            });
            return;
        }
        onNewPost(content, mediaUrl || undefined, mediaType || undefined);
        setContent('');
        setMediaUrl(null);
        setMediaType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast({
            title: '投稿しました！',
            description: 'あなたの考えが共有されました。',
        });
    };
    
    const addEmoji = (emoji: string) => {
        setContent(currentContent => currentContent + emoji);
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <Link href="/dashboard/profile">
                        <Avatar>
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <Textarea 
                        placeholder={`何を考えていますか、${displayName}さん？`} 
                        className="flex-grow bg-muted border-none min-h-[60px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                 {mediaUrl && (
                    <div className="relative w-fit mx-auto">
                        {mediaType === 'image' ? (
                             <Image src={mediaUrl} alt="プレビュー" width={400} height={300} className="rounded-md max-h-72 w-auto object-contain" />
                        ) : (
                             <video src={mediaUrl} controls className="rounded-md max-h-72 w-auto" />
                        )}
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={removeMedia}>
                            <X className="h-4 w-4" />
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
                        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleMediaButtonClick}><ImageIcon className="text-green-500" /></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleMediaButtonClick}><Video className="text-blue-500" /></Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground"><Smile className="text-yellow-500" /></Button>
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
                    <Button onClick={handleSubmit} disabled={!content.trim() && !mediaUrl}>投稿する</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const PostCard = ({ post }: { post: any }) => {
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isSaved, setIsSaved] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        toast({
            title: isSaved ? "保存を取り消しました" : "投稿を保存しました",
            description: "保存した投稿はプロフィールから確認できます。",
        });
    };
    
    const showComingSoon = () => {
        toast({
            title: "近日公開",
            description: "この機能は現在開発中です。",
        });
    }

    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/profile">
                            <Avatar>
                                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <Link href="/dashboard/profile"><p className="font-bold hover:underline">{post.author.name}</p></Link>
                            <p className="text-sm text-muted-foreground">@{post.author.username}・{post.timestamp}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <p>{post.content}</p>
                 {post.imageUrl && (
                    <div className="rounded-lg overflow-hidden border">
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
                 {post.videoUrl && (
                    <div className="rounded-lg overflow-hidden border">
                        <video
                            src={post.videoUrl}
                            controls
                            className="w-full h-auto"
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col items-start space-y-3">
                 <div className="flex justify-between w-full text-muted-foreground">
                    <span>{likeCount.toLocaleString()} いいね</span>
                    <span>{post.comments} コメント</span>
                </div>
                <Separator />
                <div className="flex justify-around w-full">
                    <Button variant="ghost" className="text-muted-foreground" onClick={handleLike}>
                        <Heart className={isLiked ? "mr-2 text-red-500 fill-current" : "mr-2"} />
                        いいね
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground" onClick={showComingSoon}><MessageCircle className="mr-2" />コメント</Button>
                    <Button variant="ghost" className="text-muted-foreground" onClick={showComingSoon}><Send className="mr-2" />シェア</Button>
                    <TipButton 
                        recipientId={post.author.username} 
                        recipientName={post.author.name}
                        className="text-muted-foreground"
                    />
                    <Button variant="ghost" className="text-muted-foreground" onClick={handleSave}>
                        <Bookmark className={isSaved ? "mr-2 text-primary fill-current" : "mr-2"} />
                        保存
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}


const RightSidebar = ({ suggestions }: { suggestions: Suggestion[] }) => (
    <aside className="hidden lg:block sticky top-24 self-start space-y-6 lg:w-[320px]">
        <Card>
            <CardHeader><h3 className="font-bold">フォローするかも</h3></CardHeader>
            <CardContent className="space-y-4">
                {suggestions.map((sug: Suggestion) => (
                    <div key={sug.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/profile">
                                <Avatar>
                                    <AvatarImage src={sug.avatarUrl} alt={sug.name} />
                                    <AvatarFallback>{sug.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <Link href="/dashboard/profile"><p className="font-semibold hover:underline">{sug.name}</p></Link>
                                <p className="text-sm text-muted-foreground">@{sug.username}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline">フォロー</Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    </aside>
);
