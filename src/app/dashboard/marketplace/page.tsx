'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, MoreHorizontal, Search, Filter, Star, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock marketplace data
const marketplaceItems = [
    {
        id: 1,
        title: "手作り陶器マグカップ",
        description: "愛情を込めて作られたオリジナル陶器マグカップ。毎朝のコーヒータイムを豊かにします。",
        price: 2500,
        image: "https://picsum.photos/seed/pottery1/400/300",
        seller: {
            name: "陶芸工房 やまと",
            avatar: "https://picsum.photos/seed/seller1/100/100",
            rating: 4.8,
            location: "京都"
        },
        category: "工芸品",
        condition: "新品",
        likes: 24,
        comments: 8,
        timestamp: "2時間前"
    },
    {
        id: 2,
        title: "オーガニック野菜セット",
        description: "無農薬で育てた新鮮なオーガニック野菜の詰め合わせ。健康と環境に優しい選択です。",
        price: 1800,
        image: "https://picsum.photos/seed/vegetables2/400/300",
        seller: {
            name: "グリーンファーム",
            avatar: "https://picsum.photos/seed/seller2/100/100",
            rating: 4.9,
            location: "千葉"
        },
        category: "食品",
        condition: "新鮮",
        likes: 45,
        comments: 12,
        timestamp: "5時間前"
    },
    {
        id: 3,
        title: "ハンドメイドアクセサリー",
        description: "天然石を使用したユニークなネックレス。一つ一つ丁寧に作られています。",
        price: 3200,
        image: "https://picsum.photos/seed/jewelry3/400/300",
        seller: {
            name: "宝石工房 アキラ",
            avatar: "https://picsum.photos/seed/seller3/100/100",
            rating: 4.7,
            location: "東京"
        },
        category: "アクセサリー",
        condition: "新品",
        likes: 67,
        comments: 23,
        timestamp: "1日前"
    },
    {
        id: 4,
        title: "瞑想用クッション",
        description: "瞑想やヨガに最適な快適なクッション。自然素材で作られています。",
        price: 4500,
        image: "https://picsum.photos/seed/cushion4/400/300",
        seller: {
            name: "平和堂",
            avatar: "https://picsum.photos/seed/seller4/100/100",
            rating: 5.0,
            location: "鎌倉"
        },
        category: "生活用品",
        condition: "新品",
        likes: 89,
        comments: 31,
        timestamp: "2日前"
    },
    {
        id: 5,
        title: "手作りジャムセット",
        description: "季節の果物で作った自家製ジャム3種セット。パンやヨーグルトにどうぞ。",
        price: 1500,
        image: "https://picsum.photos/seed/jam5/400/300",
        seller: {
            name: "果樹園 さくら",
            avatar: "https://picsum.photos/seed/seller5/100/100",
            rating: 4.6,
            location: "山梨"
        },
        category: "食品",
        condition: "手作り",
        likes: 34,
        comments: 15,
        timestamp: "3日前"
    },
    {
        id: 6,
        title: "エコバッグ（麻素材）",
        description: "環境に優しい麻素材のエコバッグ。丈夫で使いやすく、デザインもおしゃれです。",
        price: 800,
        image: "https://picsum.photos/seed/bag6/400/300",
        seller: {
            name: "エコライフ",
            avatar: "https://picsum.photos/seed/seller6/100/100",
            rating: 4.5,
            location: "大阪"
        },
        category: "生活用品",
        condition: "新品",
        likes: 56,
        comments: 18,
        timestamp: "4日前"
    }
];

const categories = [
    "すべて",
    "工芸品",
    "食品",
    "アクセサリー",
    "生活用品",
    "アート",
    "本",
    "サービス"
];

export default function MarketplacePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("すべて");
    const [sortBy, setSortBy] = useState("newest");
    const { toast } = useToast();

    const filteredItems = marketplaceItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "すべて" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleLike = (itemId: number) => {
        toast({
            title: "いいねしました",
            description: "商品をお気に入りに追加しました。",
        });
    };

    const handleShare = (itemId: number) => {
        toast({
            title: "共有しました",
            description: "商品リンクをコピーしました。",
        });
    };

    const handleContactSeller = (sellerName: string) => {
        toast({
            title: "メッセージを送信",
            description: `${sellerName}に連絡します。`,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">マーケットプレイス</h1>
                    <p className="text-muted-foreground mt-1">
                        コミュニティメンバーが作った素晴らしい商品を発見しましょう
                    </p>
                </div>
                <Button className="bg-primary text-primary-foreground">
                    商品を出品する
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="商品を検索..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="カテゴリー" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="並び替え" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">新しい順</SelectItem>
                                    <SelectItem value="price-low">価格が低い順</SelectItem>
                                    <SelectItem value="price-high">価格が高い順</SelectItem>
                                    <SelectItem value="popular">人気順</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {filteredItems.length}件の商品が見つかりました
                </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="p-0">
                            <div className="relative">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={400}
                                    height={300}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="bg-background/80">
                                        {item.category}
                                    </Badge>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-background/80 hover:bg-background"
                                        onClick={() => handleLike(item.id)}
                                    >
                                        <Heart className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {item.description}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={item.seller.avatar} alt={item.seller.name} />
                                        <AvatarFallback>{item.seller.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <span>{item.seller.name}</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span>{item.seller.rating}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{item.seller.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-primary">¥{item.price.toLocaleString()}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {item.condition}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{item.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 space-y-3">
                            <div className="flex justify-between w-full text-muted-foreground text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Heart className="h-4 w-4" />
                                        {item.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="h-4 w-4" />
                                        {item.comments}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleShare(item.id)}
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Separator />
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => handleContactSeller(item.seller.name)}
                                >
                                    メッセージ
                                </Button>
                                <Button className="flex-1">
                                    購入する
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Load More */}
            {filteredItems.length > 0 && (
                <div className="flex justify-center">
                    <Button variant="outline">
                        もっと見る
                    </Button>
                </div>
            )}
        </div>
    );
}
