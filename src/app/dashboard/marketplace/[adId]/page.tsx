'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, MapPin, Clock, ShoppingBag, Send, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatWKP, priceService } from "@/lib/wkp-token";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const CreateAdForm = dynamic(() => import("@/components/marketplace/CreateAdForm"), { ssr: false });

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
  comments: Array<{
    id: number;
    content: string;
    created_at: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  }>;
  offers: Array<{
    id: number;
    amount: number;
    message: string;
    status: string;
    created_at: string;
    buyer: {
      id: string;
      name: string;
      avatar: string;
    };
  }>;
}

interface AdDetailPageProps {
  params: {
    adId: string;
  };
}

export default function AdDetailPage({ params }: AdDetailPageProps) {
  const [ad, setAd] = useState<MarketplaceAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [commentText, setCommentText] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [makingOffer, setMakingOffer] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Subscribe to live price updates
  useEffect(() => {
    const unsubscribe = priceService.subscribe((data) => {
      setCurrentPrice(data.price);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch ad details
  useEffect(() => {
    fetchAdDetails();
  }, [params.adId]);

  const fetchAdDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/marketplace/${params.adId}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setAd(data.ad);
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "商品の詳細を読み込めませんでした。",
        });
        router.push('/dashboard/marketplace');
      }
    } catch (error) {
      console.error('Error fetching ad details:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "商品の詳細を読み込めませんでした。",
      });
      router.push('/dashboard/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!ad) return;

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

      const response = await fetch(`/api/marketplace/${ad.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAd(prev => prev ? {
          ...prev,
          isLiked: data.liked,
          likes: data.liked ? prev.likes + 1 : prev.likes - 1
        } : null);
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

  const handleComment = async () => {
    if (!ad || !commentText.trim()) return;

    setPostingComment(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "ログインが必要です",
          description: "コメントするにはログインしてください。",
        });
        return;
      }

      const response = await fetch(`/api/marketplace/${ad.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (response.ok) {
        setCommentText("");
        fetchAdDetails(); // Refresh to get new comment
        toast({
          title: "コメントを投稿しました",
        });
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "エラー",
          description: error.error || "コメントの投稿に失敗しました",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "コメントの投稿中にエラーが発生しました。",
      });
    } finally {
      setPostingComment(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!ad || !offerAmount) return;

    setMakingOffer(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "ログインが必要です",
          description: "オファーするにはログインしてください。",
        });
        return;
      }

      const response = await fetch(`/api/marketplace/${ad.id}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(offerAmount),
          message: offerMessage.trim()
        }),
      });

      if (response.ok) {
        setOfferAmount("");
        setOfferMessage("");
        setShowOfferDialog(false);
        fetchAdDetails(); // Refresh to get new offer
        toast({
          title: "オファーを送信しました",
        });
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "エラー",
          description: error.error || "オファーの送信に失敗しました",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "オファーの送信中にエラーが発生しました。",
      });
    } finally {
      setMakingOffer(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "リンクをコピーしました",
      description: "商品リンクをクリップボードにコピーしました。",
    });
  };

  const handleDelete = async () => {
    if (!ad) return;

    if (!confirm('この商品を削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "ログインが必要です",
        });
        return;
      }

      const response = await fetch(`/api/marketplace/${ad.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "商品を削除しました",
        });
        router.push('/dashboard/marketplace');
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "エラー",
          description: error.error || "商品の削除に失敗しました",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "商品の削除中にエラーが発生しました。",
      });
    }
  };

  const handleAdUpdated = () => {
    setShowEditDialog(false);
    fetchAdDetails();
  };

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

  if (!ad) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">商品が見つかりませんでした。</p>
        </div>
      </div>
    );
  }

  const isOwner = ad.seller.id === localStorage.getItem('user_id'); // This would need to be properly implemented

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard/marketplace')}>
          ← マーケットプレイスに戻る
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            共有
          </Button>
          {isOwner && (
            <>
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>商品を編集する</DialogTitle>
                  </DialogHeader>
                  <CreateAdForm
                    onSuccess={handleAdUpdated}
                    editData={ad}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Image
                src={ad.image_url || "https://picsum.photos/seed/default/600/400"}
                alt={ad.title}
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold font-headline">{ad.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>{ad.category}</Badge>
                  <Badge variant="outline">{ad.condition}</Badge>
                  <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                    {ad.status === 'active' ? '販売中' : ad.status === 'sold' ? '売却済み' : '停止中'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={ad.isLiked ? 'text-red-500' : ''}
              >
                <Heart className={`h-6 w-6 ${ad.isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <div className="text-4xl font-bold text-primary mb-2">
              {formatWKP(Math.floor(ad.price / currentPrice))}
              <span className="text-lg text-muted-foreground ml-2">
                (約 ¥{ad.price.toLocaleString()})
              </span>
            </div>

            <p className="text-muted-foreground mb-4">{ad.description}</p>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={ad.seller.avatar} alt={ad.seller.name} />
                    <AvatarFallback>{ad.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{ad.seller.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {ad.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{ad.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(ad.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-center">
            <div>
              <div className="text-2xl font-bold">{ad.views}</div>
              <div className="text-sm text-muted-foreground">閲覧数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ad.likes}</div>
              <div className="text-sm text-muted-foreground">いいね</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ad.commentsCount}</div>
              <div className="text-sm text-muted-foreground">コメント</div>
            </div>
          </div>

          {/* Actions */}
          {ad.status === 'active' && !isOwner && (
            <div className="space-y-3">
              <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    オファーを送る
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>オファーを送る</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">オファー金額 (円)</label>
                      <Input
                        type="number"
                        placeholder="希望金額を入力"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">メッセージ (任意)</label>
                      <Input
                        placeholder="売り手にメッセージを送る"
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleMakeOffer}
                      disabled={makingOffer || !offerAmount}
                      className="w-full"
                    >
                      {makingOffer ? '送信中...' : 'オファーを送信'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button className="w-full">
                <ShoppingBag className="h-4 w-4 mr-2" />
                購入を申し込む
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">コメント</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Input */}
          <div className="flex gap-2">
            <Input
              placeholder="コメントを入力..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <Button
              onClick={handleComment}
              disabled={postingComment || !commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {ad.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            {ad.comments.length === 0 && (
              <p className="text-muted-foreground text-center py-4">コメントがありません</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offers Section (for sellers) */}
      {isOwner && ad.offers.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">受け取ったオファー</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ad.offers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={offer.buyer.avatar} alt={offer.buyer.name} />
                        <AvatarFallback>{offer.buyer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{offer.buyer.name}</span>
                      <Badge variant={
                        offer.status === 'pending' ? 'secondary' :
                        offer.status === 'accepted' ? 'default' : 'destructive'
                      }>
                        {offer.status === 'pending' ? '保留中' :
                         offer.status === 'accepted' ? '承認済み' : '拒否済み'}
                      </Badge>
                    </div>
                    <span className="font-bold">¥{offer.amount.toLocaleString()}</span>
                  </div>
                  {offer.message && (
                    <p className="text-sm text-muted-foreground mb-2">{offer.message}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(offer.created_at).toLocaleDateString('ja-JP')}
                    </span>
                    {offer.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Handle accept offer
                            toast({
                              title: "オファー承認機能は開発中です",
                            });
                          }}
                        >
                          承認
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Handle reject offer
                            toast({
                              title: "オファー拒否機能は開発中です",
                            });
                          }}
                        >
                          拒否
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
