'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Heart, Users, Target, TrendingUp, Gift } from 'lucide-react';
import { 
  donateWKP, 
  formatWKP, 
  formatPrice, 
  calculateJPYValue,
  priceService 
} from '@/lib/wkp-token';
import { useAuth } from '@/hooks/use-auth';

interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  organizer: {
    name: string;
    avatar: string;
    id: string;
  };
  category: 'community' | 'charity' | 'project' | 'emergency';
  endDate: string;
  supporters: number;
}

interface DonationPanelProps {
  className?: string;
}

export function DonationPanel({ className }: DonationPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaign | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(100);
  const [isDonating, setIsDonating] = useState(false);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        } else {
          console.error('Failed to fetch campaigns');
          // Fallback to empty array
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    const unsubscribe = priceService.subscribe((data) => {
      setCurrentPrice(data.price);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleDonate = async () => {
    if (!user || !selectedCampaign || !donationAmount) return;

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: '無効な金額',
        description: '有効な寄付金額を入力してください。'
      });
      return;
    }

    const userBalance = user?.points?.total || 0;
    if (amount > userBalance) {
      toast({
        variant: 'destructive',
        title: '残高不足',
        description: `残高: ${formatWKP(userBalance)}`
      });
      return;
    }

    setIsDonating(true);
    try {
      // Process donation via API
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          amount: amount
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: '寄付ありがとうございます！',
          description: `${selectedCampaign.title}に${formatWKP(amount)}を寄付しました。`
        });
        
        // Refresh campaigns to update amounts
        const campaignsResponse = await fetch('/api/campaigns');
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData.campaigns || []);
        }
        
        setDonationAmount('');
        setSelectedCampaign(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Donation failed');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast({
        variant: 'destructive',
        title: '寄付エラー',
        description: error instanceof Error ? error.message : '寄付の処理に失敗しました。'
      });
    } finally {
      setIsDonating(false);
    }
  };

  const getCategoryColor = (category: DonationCampaign['category']) => {
    switch (category) {
      case 'community': return 'bg-green-100 text-green-800';
      case 'charity': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: DonationCampaign['category']) => {
    switch (category) {
      case 'community': return 'コミュニティ';
      case 'charity': return 'チャリティ';
      case 'project': return 'プロジェクト';
      case 'emergency': return '緊急支援';
      default: return 'その他';
    }
  };

  const presetAmounts = [100, 500, 1000, 2500, 5000];

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">寄付機能を利用するにはログインが必要です</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            寄付キャンペーン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCampaign?.id === campaign.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={campaign.organizer.avatar} alt={campaign.organizer.name} />
                    <AvatarFallback>{campaign.organizer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <Badge className={getCategoryColor(campaign.category)}>
                        {getCategoryLabel(campaign.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.supporters} 人の支援者
                      </span>
                      <span>終了: {new Date(campaign.endDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>進捗</span>
                        <span>{formatWKP(campaign.currentAmount)} / {formatWKP(campaign.targetAmount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(campaign.currentAmount / campaign.targetAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Donation Form */}
      {selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              寄付する
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedCampaign.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedCampaign.organizer.name}</p>
            </div>

            {/* Preset Amounts */}
            <div className="space-y-2">
              <label className="text-sm font-medium">金額を選択</label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDonationAmount(amount.toString())}
                    className="text-xs"
                  >
                    {formatWKP(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">カスタム金額</label>
              <Input
                type="number"
                placeholder="寄付金額を入力"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                min="1"
                step="1"
              />
              {donationAmount && !isNaN(parseFloat(donationAmount)) && (
                <div className="text-xs text-muted-foreground">
                  約 {formatPrice(calculateJPYValue(parseFloat(donationAmount), currentPrice), 'JPY')}
                </div>
              )}
            </div>

            <Separator />

            {/* User Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">あなたの残高:</span>
              <Badge variant="outline">
                {formatWKP(user?.points?.total || 0)}
              </Badge>
            </div>

            {/* Donate Button */}
            <Button
              onClick={handleDonate}
              disabled={!donationAmount || isDonating}
              className="w-full"
              size="lg"
            >
              {isDonating ? '処理中...' : `寄付する ${donationAmount ? formatWKP(parseFloat(donationAmount)) : ''}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
