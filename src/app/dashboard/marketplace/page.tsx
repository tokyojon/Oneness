'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, MoreHorizontal, Search, Filter, Star, MapPin, Clock, ShoppingBag, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TipButton } from "@/components/wallet/tip-button";
import { formatWKP, calculateJPYValue, priceService } from "@/lib/wkp-token";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CreateAdForm = dynamic(() => import("@/components/marketplace/CreateAdForm"), { ssr: false });

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

interface MarketplaceAd {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  condition: string;
  location: string;
  status: string;
  views: number;
  likes: number;
  commentsCount: number;
  created_at: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  isLiked: boolean;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [sortBy, setSortBy] = useState("newest");
  const [ads, setAds] = useState<MarketplaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Subscribe to live price updates
  useEffect(() => {
    const unsubscribe = priceService.subscribe((data) => {
      setCurrentPrice(data.price);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch ads
  useEffect(() => {
    fetchAds();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = new URLSearchParams({
        category: selectedCategory === "すべて" ? "" : selectedCategory,
        search: searchQuery,
        sortBy,
        limit: "12"
      });

      const response = await fetch(`/api/marketplace?${params}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setAds(data.ads);
      } else {
        console.error('Failed to fetch ads');
        setAds([]);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (adId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "ログインが必要です",
          description: "いいねするにはログインしてください。",
        });
        return;
      }

      const response = await fetch(`/api/marketplace/${adId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the ad in the list
        setAds(prevAds =>
          prevAds.map(ad =>
            ad.id === adId
              ? { ...ad, isLiked: data.liked, likes: data.liked ? ad.likes + 1 : ad.likes - 1 }
              : ad
          )
        );
        toast({
          title: data.liked ? "いいねしました" : "いいねを解除しました",
        });
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "エラー",
          description: error.error || "いいねに失敗しました",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "いいね中にエラーが発生しました。",
      });
    }
  };

  const handleShare = (adId: number) => {
    const url = `${window.location.origin}/dashboard/marketplace/${adId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "リンクをコピーしました",
      description: "商品リンクをクリップボードにコピーしました。",
    });
  };

  const handleContactSeller = (sellerName: string) => {
    toast({
      title: "メッセージ機能は開発中です",
      description: `${sellerName}に連絡するにはコメント機能をご利用ください。`,
    });
  };

  const handleAdCreated = () => {
    setCreateDialogOpen(false);
    fetchAds(); // Refresh the ads list
  };

  const filteredAds = ads; // Filtering is now done in the API

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">商品を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              商品を出品する
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>商品を出品する</DialogTitle>
            </DialogHeader>
            <CreateAdForm onSuccess={handleAdCreated} />
          </DialogContent>
        </Dialog>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAds.length}件の商品が見つかりました
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.map(ad => (
          <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <Link href={`/dashboard/marketplace/${ad.id}`}>
                <div className="relative">
                  <Image
                    src={ad.image_url || "https://picsum.photos/seed/default/400/300"}
                    alt={ad.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-background/80">
                      {ad.category}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-background/80 hover:bg-background"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike(ad.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${ad.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </div>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Link href={`/dashboard/marketplace/${ad.id}`}>
                    <h3 className="font-semibold text-lg line-clamp-1 hover:underline">{ad.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {ad.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ad.seller.avatar} alt={ad.seller.name} />
                    <AvatarFallback>{ad.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{ad.seller.name}</span>
                    {ad.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{ad.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <div className="text-2xl font-bold text-primary">
                        {formatWKP(Math.floor(ad.price / currentPrice))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        約 ¥{ad.price.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ad.condition}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(ad.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 space-y-3">
              <div className="flex justify-between w-full text-muted-foreground text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className={`h-4 w-4 ${ad.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {ad.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {ad.commentsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {ad.views}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleShare(ad.id)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleContactSeller(ad.seller.name)}
                >
                  メッセージ
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "購入機能は開発中です",
                      description: "現在、売り手との直接交渉をお願いします。",
                    });
                  }}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  購入
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredAds.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">商品が見つかりませんでした。</p>
        </div>
      )}
    </div>
  );
}
