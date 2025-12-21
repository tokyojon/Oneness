'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  ExternalLink,
  Gift,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { 
  WKPWallet, 
  TokenTransaction, 
  LiveTokenData, 
  priceService, 
  formatWKP, 
  formatPrice, 
  calculateJPYValue 
} from '@/lib/wkp-token';
import { useAuth } from '@/hooks/use-auth';

interface WKPWalletProps {
  className?: string;
}

export function WKPWalletComponent({ className }: WKPWalletProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WKPWallet | null>(null);
  const [liveData, setLiveData] = useState<LiveTokenData | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize wallet data
    initializeWallet();
    
    // Subscribe to live price updates
    const unsubscribe = priceService.subscribe((data) => {
      setLiveData(data);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);

  const initializeWallet = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch wallet data from API
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
      } else {
        console.error('Failed to fetch wallet data');
        // Fallback to minimal wallet data
        const fallbackWallet: WKPWallet = {
          id: `wallet_${user.id}`,
          user_id: user.id,
          wallet_address: `0x${user.id.slice(0, 8)}${user.id.slice(-8)}`,
          private_key: 'encrypted_key',
          balance: user?.points?.total || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setWallet(fallbackWallet);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
      // Fallback to minimal wallet data
      const fallbackWallet: WKPWallet = {
        id: `wallet_${user.id}`,
        user_id: user.id,
        wallet_address: `0x${user.id.slice(0, 8)}${user.id.slice(-8)}`,
        private_key: 'encrypted_key',
        balance: user?.points?.total || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setWallet(fallbackWallet);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.wallet_address) {
      navigator.clipboard.writeText(wallet.wallet_address);
      toast({
        title: 'アドレスをコピー',
        description: 'ウォレットアドレスをクリップボードにコピーしました。'
      });
    }
  };

  const handleSendTip = () => {
    toast({
      title: 'チップ機能',
      description: 'チップ送信画面を開きます。'
    });
  };

  const handlePurchase = () => {
    toast({
      title: '購入機能',
      description: 'マーケットプレイスで商品を購入します。'
    });
  };

  const handleDonate = () => {
    toast({
      title: '寄付機能',
      description: '寄付画面を開きます。'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">ウォレットが見つかりません</p>
          <Button className="mt-4">ウォレットを作成</Button>
        </CardContent>
      </Card>
    );
  }

  const jpValue = liveData ? calculateJPYValue(wallet.balance, liveData.price) : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            WKP ウォレット
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Display */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              {formatWKP(wallet.balance)}
            </div>
            <div className="text-sm text-muted-foreground">
              約 {formatPrice(jpValue, 'JPY')}
            </div>
            {liveData && (
              <div className="flex items-center justify-center gap-2 text-xs">
                {liveData.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={liveData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {liveData.change24h >= 0 ? '+' : ''}{liveData.change24h.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">24時間</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Wallet Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ウォレットアドレス</span>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
              {wallet.wallet_address}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={handleSendTip}>
              <Gift className="h-4 w-4 mr-1" />
              チップ
            </Button>
            <Button variant="outline" size="sm" onClick={handlePurchase}>
              <ShoppingBag className="h-4 w-4 mr-1" />
              購入
            </Button>
            <Button variant="outline" size="sm" onClick={handleDonate}>
              <Heart className="h-4 w-4 mr-1" />
              寄付
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Market Data */}
      {liveData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ライブ市場データ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">現在価格</span>
                <div className="font-semibold">{formatPrice(liveData.price, 'JPY')}</div>
              </div>
              <div>
                <span className="text-muted-foreground">時価総額</span>
                <div className="font-semibold">{formatPrice(liveData.marketCap, 'JPY')}</div>
              </div>
              <div>
                <span className="text-muted-foreground">24h取引高</span>
                <div className="font-semibold">{formatPrice(liveData.volume24h, 'JPY')}</div>
              </div>
              <div>
                <span className="text-muted-foreground">ホルダー数</span>
                <div className="font-semibold">{liveData.holders.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              最終更新: {new Date(liveData.lastUpdated).toLocaleString('ja-JP')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">取引履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">取引履歴がありません</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'reward' ? 'bg-green-100' :
                      tx.type === 'tip' ? 'bg-blue-100' :
                      tx.type === 'purchase' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      {tx.type === 'reward' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {tx.type === 'tip' && <Gift className="h-4 w-4 text-blue-600" />}
                      {tx.type === 'purchase' && <ShoppingBag className="h-4 w-4 text-purple-600" />}
                      {tx.type === 'donation' && <Heart className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {tx.type === 'reward' && '報酬'}
                        {tx.type === 'tip' && 'チップ'}
                        {tx.type === 'purchase' && '購入'}
                        {tx.type === 'donation' && '寄付'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      tx.from_wallet_id === wallet.id ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {tx.from_wallet_id === wallet.id ? '-' : '+'}
                      {formatWKP(tx.amount)}
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {tx.status === 'completed' ? '完了' : '処理中'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
