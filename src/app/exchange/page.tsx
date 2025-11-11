'use client';

import dynamic from 'next/dynamic';
import { OnenessKingdomLogo } from "@/lib/icons";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WKPWalletComponent } from "@/components/wallet/wkp-wallet";
import { DonationPanel } from "@/components/wallet/donation-panel";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/lib/icons";
import { useEffect, useState } from "react";

const ExchangeForm = dynamic(() => import("@/components/exchange/exchange-form"), { ssr: false });
const TransactionHistory = dynamic(() => import("@/components/exchange/transaction-history"), { ssr: false });
const BuyOpForm = dynamic(() => import("@/components/exchange/buy-op-form"), { ssr: false });

interface Transaction {
    id: string;
    type: 'exchange' | 'purchase' | 'exchange_rejection';
    date: Date;
    op_amount: number;
    currency: string;
    amount: number;
    status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
}

export default function ExchangePage() {
    const { user, loading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    // Get user data from auth hook
    const userData = {
        op_balance: user?.points?.total || 0,
        monthly_redeemed_op: 0, // This would need to be calculated from database
    }
    
    const exchangeRates = {
        op_to_jpy: 1.5,
        op_to_usdt: 0.01,
        op_to_btc: 0.00000015
    }

    // Fetch user transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    console.error('No auth token found');
                    setTransactions([]);
                    setTransactionsLoading(false);
                    return;
                }

                const response = await fetch('/api/transactions', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Transactions data:', data);
                    setTransactions(data.transactions || []);
                } else {
                    console.error('Failed to fetch transactions:', response.status, response.statusText);
                    setTransactions([]);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setTransactions([]);
            } finally {
                setTransactionsLoading(false);
            }
        };

        if (user) {
            fetchTransactions();
        } else {
            setTransactionsLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <LoadingSpinner className="h-8 w-8 mx-auto animate-spin" />
                        <p className="text-muted-foreground">読み込み中...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto grid w-full max-w-6xl gap-8">
                <div className="grid gap-2 text-center">
                    <Link href="/" className="flex justify-center items-center gap-2 mb-4">
                        <OnenessKingdomLogo className="h-10 w-10" />
                    </Link>
                    <h1 className="text-3xl font-bold font-headline">WKP 交換・寄付センター</h1>
                    <p className="text-balance text-muted-foreground">
                        WKPを交換、寄付、またはチップを送信します。
                    </p>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            現在のOP残高: <span className="font-semibold text-primary">🪙 {userData.op_balance.toLocaleString()} OP</span>
                        </p>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Exchange */}
                    <div className="space-y-6">
                        <Tabs defaultValue="exchange">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="exchange">WKPを換金</TabsTrigger>
                                <TabsTrigger value="buy">WKPを購入</TabsTrigger>
                            </TabsList>
                            <TabsContent value="exchange">
                                <ExchangeForm user={userData} exchangeRates={exchangeRates} />
                            </TabsContent>
                            <TabsContent value="buy">
                                <BuyOpForm user={userData} />
                            </TabsContent>
                        </Tabs>
                        
                        <TransactionHistory 
                            transactions={transactions} 
                            loading={transactionsLoading}
                        />
                    </div>
                    
                    {/* Right Column - Wallet & Donations */}
                    <div className="space-y-6">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            <WKPWalletComponent />
                            <DonationPanel />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
