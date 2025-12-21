'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, Heart, Sparkles } from 'lucide-react';
import { 
  sendTip, 
  formatWKP, 
  calculateJPYValue,
  priceService 
} from '@/lib/wkp-token';
import { useAuth } from '@/hooks/use-auth';

interface TipButtonProps {
  recipientId: string;
  recipientName: string;
  postId: string;
  className?: string;
}

export function TipButton({ recipientId, recipientName, postId, className }: TipButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(100);
  const [isSending, setIsSending] = useState(false);

  // Subscribe to price updates
  useState(() => {
    const unsubscribe = priceService.subscribe((data) => {
      setCurrentPrice(data.price);
    });
    return unsubscribe;
  });

  const handleSendTip = async () => {
    if (!user || !amount) return;

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      toast({
        variant: 'destructive',
        title: '無効な金額',
        description: '有効なチップ金額を入力してください。'
      });
      return;
    }

    const userBalance = user?.points?.total || 0;
    if (tipAmount > userBalance) {
      toast({
        variant: 'destructive',
        title: '残高不足',
        description: `残高: ${formatWKP(userBalance)}`
      });
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/posts/${postId}/tip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: tipAmount,
          recipientId: recipientId 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'チップを送信しました！',
          description: `${recipientName}さんに${formatWKP(tipAmount)}を送信しました。`
        });
        
        setIsOpen(false);
        setAmount('');
        
        // Optionally refresh user data to update balance
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send tip');
      }
    } catch (error) {
      console.error('Tip sending error:', error);
      toast({
        variant: 'destructive',
        title: '送信エラー',
        description: 'チップの送信に失敗しました。'
      });
    } finally {
      setIsSending(false);
    }
  };

  const presetAmounts = [10, 50, 100, 500, 1000];

  if (!user) {
    return null; // Don't show tip button for non-logged-in users
  }

  if (isOpen) {
    return (
      <Card className="w-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5" />
            チップを送信
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{recipientName}</span>さんにチップを送信
            </p>
          </div>

          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => setAmount(preset.toString())}
                className="text-xs"
              >
                {formatWKP(preset)}
              </Button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">金額 (WKP)</label>
            <Input
              type="number"
              placeholder="カスタム金額"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
            />
            {amount && !isNaN(parseFloat(amount)) && (
              <div className="text-xs text-muted-foreground">
                約 {formatPrice(calculateJPYValue(parseFloat(amount), currentPrice), 'JPY')}
              </div>
            )}
          </div>

          {/* User Balance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">残高:</span>
            <Badge variant="outline">
              {formatWKP(user?.points?.total || 0)}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSendTip}
              disabled={!amount || isSending}
              className="flex-1"
            >
              {isSending ? '送信中...' : '送信'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsOpen(true)}
      className={`text-muted-foreground hover:text-primary ${className}`}
    >
      <Gift className="h-4 w-4 mr-1" />
      チップ
    </Button>
  );
}

// Format price utility
function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}
