

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Send, Smile, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

// Mock Data
const userProfile = {
    name: "愛 平和 (Ai Heiwa)",
    username: "ai_heiwa",
    avatarUrl: "https://picsum.photos/seed/user1/100/100",
    op_balance: 12500,
};

const stories = [
    { id: 1, username: "Satoshi", avatarUrl: "https://picsum.photos/seed/story1/80/80" },
    { id: 2, username: "Yuki", avatarUrl: "https://picsum.photos/seed/story2/80/80" },
    { id: 3, username: "Haru", avatarUrl: "https://picsum.photos/seed/story3/80/80" },
    { id: 4, username: "Kenji", avatarUrl: "https://picsum.photos/seed/story4/80/80" },
    { id: 5, username: "Mei", avatarUrl: "https://picsum.photos/seed/story5/80/80" },
    { id: 6, username: "Ren", avatarUrl: "https://picsum.photos/seed/story6/80/80" },
];

const initialPosts = [
    {
        id: 1,
        author: { name: "コミュニティガーデン", username: "community_garden_jp", avatarUrl: "https://picsum.photos/seed/post1/80/80" },
        content: "今日の収穫です！愛情を込めて育てた野菜は、格別な味がしますね。皆さんも、ぜひ土に触れる喜びを感じてみてください。 #家庭菜園 #オーガニック #貢献",
        imageUrl: "https://picsum.photos/seed/p1/600/400",
        imageHint: "fresh vegetables harvest",
        likes: 128,
        comments: 15,
        timestamp: "2時間前",
    },
    {
        id: 2,
        author: { name: "ワンネスアート", username: "oneness_art", avatarUrl: "https://picsum.photos/seed/post2/80/80" },
        content: "「調和」をテーマにした新作が完成しました。異なる色が混ざり合い、一つの美しい全体を創り出す様子は、私たちのコミュニティそのものです。 #アート #調和 #創造性",
        imageUrl: "https://picsum.photos/seed/p2/600/700",
        imageHint: "abstract painting harmony",
        likes: 340,
        comments: 45,
        timestamp: "5時間前",
    },
];

const suggestions = [
    { id: 1, name: "未来技術ラボ", username: "future_tech_lab", avatarUrl: "https://picsum.photos/seed/sug1/80/80" },
    { id: 2, name: "平和の祈り", username: "peace_prayer", avatarUrl: "https://picsum.photos/seed/sug2/80/80" },
];

// Main Component
export default function DashboardPage() {
    const [posts, setPosts] = useState(initialPosts);

    const handleNewPost = (content: string) => {
        const newPost = {
            id: posts.length + 3,
            author: userProfile,
            content,
            likes: 0,
            comments: 0,
            timestamp: "たった今",
        };
        setPosts([newPost, ...posts]);
    };

    return (
        <div className="space-y-6">
            <Stories />
            <CreatePostCard onNewPost={handleNewPost} />
            {posts.map(post => <PostCard key={post.id} post={post} />)}
             <RightSidebar />
        </div>
    );
}

// Sub-components
const Stories = () => (
    <Card>
        <CardContent className="p-4">
            <div className="flex space-x-4 overflow-x-auto pb-2">
                {stories.map(story => (
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

const CreatePostCard = ({ onNewPost }: { onNewPost: (content: string) => void }) => {
    const [content, setContent] = useState('');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!content.trim()) {
            toast({
                variant: 'destructive',
                title: '投稿は空にできません',
                description: '何かメッセージを入力してください。',
            });
            return;
        }
        onNewPost(content);
        setContent('');
        toast({
            title: '投稿しました！',
            description: 'あなたの考えが共有されました。',
        });
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <Link href="/dashboard/profile">
                        <Avatar>
                            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <Textarea 
                        placeholder={`何を考えていますか、${userProfile.name}さん？`} 
                        className="flex-grow bg-muted border-none min-h-[60px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><ImageIcon className="text-green-500" /></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Video className="text-blue-500" /></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Smile className="text-yellow-500" /></Button>
                    </div>
                    <Button onClick={handleSubmit} disabled={!content.trim()}>投稿する</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const PostCard = ({ post }: { post: (typeof initialPosts)[0] | { id: number; author: typeof userProfile; content: string; likes: number; comments: number; timestamp: string; imageUrl?: string | undefined, imageHint?: string | undefined } }) => {
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
                    <Button variant="ghost" className="text-muted-foreground" onClick={handleSave}>
                        <Bookmark className={isSaved ? "mr-2 text-primary fill-current" : "mr-2"} />
                        保存
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}


const RightSidebar = () => (
    <aside className="hidden lg:block sticky top-24 self-start space-y-6 lg:w-[320px]">
        <Card>
            <CardHeader><h3 className="font-bold">フォローするかも</h3></CardHeader>
            <CardContent className="space-y-4">
                {suggestions.map(sug => (
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
