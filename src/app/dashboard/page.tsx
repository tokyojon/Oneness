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
import LoadingSpinner from "@/components/common/loading-state";
import { useRouter } from "next/navigation";

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

export default function DashboardPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setError(null);
                setLoading(true);
                
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    throw new Error('No auth token found');
                }

                const profileResponse = await fetch('/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
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
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
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

                setStories([]);
                setSuggestions([]);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error instanceof Error ? error.message : 'Unknown error');
                
                if (user) {
                    setUserProfile({
                        name: user.profile?.display_name || 'ユーザー',
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

    const handleNewPost = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
        try {
            console.log('Creating new post:', { content, mediaUrl, mediaType });
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const postData: any = { content };
            if (mediaUrl) {
                if (mediaType === 'image') {
                    postData.imageUrl = mediaUrl;
                    postData.imageHint = "user uploaded content";
                } else {
                    postData.videoUrl = mediaUrl;
                }
            }

            console.log('Sending post data:', postData);
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            console.log('Post response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Post created successfully:', data);
                setPosts([data.post, ...posts]);
            } else {
                const errorData = await response.json();
                console.error('Post creation failed:', errorData);
                throw new Error(errorData.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
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
                isLiked: false,
                isBookmarked: false
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
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <LoadingSpinner className="h-8 w-8 animate-spin mx-auto" />
                        <p className="text-muted-foreground">読み込み中...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <p className="text-destructive">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            再読み込み
                        </Button>
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
            </div>
        </ProtectedRoute>
    );
}

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

const CreatePostCard = ({ onNewPost }: { onNewPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => Promise<void> }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async () => {
        if (!content.trim() && !mediaUrl) {
            toast({
                variant: 'destructive',
                title: '投稿は空にできません',
                description: '何かメッセージを入力するか、メディアをアップロードしてください。',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onNewPost(content, mediaUrl || undefined, mediaType || undefined);
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
        } catch (error) {
            console.error('Error submitting post:', error);
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
                    <Button onClick={handleSubmit} disabled={(!content.trim() && !mediaUrl) || isSubmitting}>
                    {isSubmitting ? '投稿中...' : '投稿する'}
                </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const PostCard = ({ post }: { post: Post }) => {
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [shareUrls, setShareUrls] = useState<any>(null);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast({
                    variant: 'destructive',
                    title: '認証エラー',
                    description: 'ログインしてください。',
                });
                return;
            }

            const response = await fetch(`/api/posts/${post.id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isLiked);
                setLikeCount(data.likesCount);
                toast({
                    title: data.message,
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to toggle like');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            toast({
                variant: 'destructive',
                title: 'エラー',
                description: 'いいねの処理中にエラーが発生しました。',
            });
        }
    };

    const handleBookmark = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast({
                    variant: 'destructive',
                    title: '認証エラー',
                    description: 'ログインしてください。',
                });
                return;
            }

            const response = await fetch(`/api/posts/${post.id}/bookmark`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
                toast({
                    title: data.message,
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to toggle bookmark');
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            toast({
                variant: 'destructive',
                title: 'エラー',
                description: '保存の処理中にエラーが発生しました。',
            });
        }
    };

    const loadComments = async () => {
        if (!showComments) {
            setCommentsLoading(true);
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;

                const response = await fetch(`/api/posts/${post.id}/comments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setComments(data.comments || []);
                } else {
                    console.error('Failed to load comments');
                }
            } catch (error) {
                console.error('Error loading comments:', error);
            } finally {
                setCommentsLoading(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`/api/posts/${post.id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments([...comments, data.comment]);
                setNewComment('');
                post.comments = data.commentsCount; 
                toast({
                    title: 'コメントを投稿しました',
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post comment');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            toast({
                variant: 'destructive',
                title: 'コメントエラー',
                description: 'コメントの投稿中にエラーが発生しました。',
            });
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleShare = async (platform: string = 'copy') => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast({
                    variant: 'destructive',
                    title: '認証エラー',
                    description: 'ログインしてください。',
                });
                return;
            }

            const response = await fetch(`/api/posts/${post.id}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ platform }),
            });

            if (response.ok) {
                const data = await response.json();
                setShareUrls(data.shareUrls);
                
                if (platform === 'copy') {
                    await navigator.clipboard.writeText(data.postUrl);
                    toast({
                        title: 'リンクをコピーしました',
                        description: '投稿リンクがクリップボードにコピーされました。',
                    });
                } else {
                    window.open(data.shareUrls[platform], '_blank', 'width=600,height=400');
                }
                
                setShowShareOptions(false);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to share post');
            }
        } catch (error) {
            console.error('Error sharing post:', error);
            toast({
                variant: 'destructive',
                title: '共有エラー',
                description: '投稿の共有中にエラーが発生しました。',
            });
        }
    };

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
                    <Button variant="ghost" className="text-muted-foreground" onClick={loadComments}>
                        <MessageCircle className="mr-2" />コメント
                    </Button>
                    
                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            className="text-muted-foreground" 
                            onClick={() => setShowShareOptions(!showShareOptions)}
                        >
                            <Send className="mr-2" />シェア
                        </Button>
                        
                        {showShareOptions && (
                            <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg p-2 min-w-40 z-10">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-sm"
                                    onClick={() => handleShare('copy')}
                                >
                                    リンクをコピー
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-sm"
                                    onClick={() => handleShare('twitter')}
                                >
                                    Twitterでシェア
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-sm"
                                    onClick={() => handleShare('facebook')}
                                >
                                    Facebookでシェア
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    <TipButton 
                        recipientId={post.author.username} 
                        recipientName={post.author.name}
                        postId={post.id.toString()}
                        className="text-muted-foreground"
                    />
                    <Button variant="ghost" className="text-muted-foreground" onClick={handleBookmark}>
                        <Bookmark className={isBookmarked ? "mr-2 text-primary fill-current" : "mr-2"} />
                        保存
                    </Button>
                </div>
                
                {showComments && (
                    <div className="w-full border-t pt-4 mt-4">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="コメントを追加..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                                    className="flex-grow"
                                />
                                <Button 
                                    onClick={handleSubmitComment} 
                                    disabled={!newComment.trim() || submittingComment}
                                    size="sm"
                                >
                                    {submittingComment ? '投稿中...' : '投稿'}
                                </Button>
                            </div>
                            
                            {commentsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    <span className="ml-2 text-sm text-muted-foreground">読み込み中...</span>
                                </div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 p-2 rounded-lg bg-muted/50">
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                                                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm">{comment.author.name}</span>
                                                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                                </div>
                                                <p className="text-sm break-words">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                    まだコメントがありません。最初のコメントを投稿しましょう！
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
