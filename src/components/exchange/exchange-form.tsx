'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { LoadingSpinner } from "@/lib/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";

interface ExchangeFormProps {
    user: {
        op_balance: number;
        monthly_redeemed_op: number;
    };
    exchangeRates: {
        op_to_jpy: number;
        op_to_usdt: number;
        op_to_jpyc: number;
        op_to_tec: number;
    }
}

export default function ExchangeForm({ user, exchangeRates }: ExchangeFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState(0);

    const monthlyLimit = (user.op_balance + user.monthly_redeemed_op) / 3;
    const availableToRedeemThisMonth = monthlyLimit - user.monthly_redeemed_op;

    const formSchema = z.object({
        op_amount: z.coerce.number().positive("申請額は正でなければなりません。")
            .max(user.op_balance * 0.95, "手数料を考慮すると、OP残高が不足しています。")
            .max(availableToRedeemThisMonth, `今月の換金上限（${Math.floor(availableToRedeemThisMonth)} OP）を超えています。`),
        target_currency: z.enum(["JPY", "USDT", "JPYC", "TEC"], { required_error: "通貨を選択してください。" }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            op_amount: undefined,
            target_currency: undefined,
        },
    });

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const opAmount = parseFloat(e.target.value) || 0;
        const currency = form.getValues("target_currency");
        calculatePayout(opAmount, currency);
        form.setValue("op_amount", opAmount, { shouldValidate: true });
    };

    const handleCurrencyChange = (currency: "JPY" | "USDT" | "JPYC" | "TEC") => {
        const opAmount = form.getValues("op_amount") || 0;
        calculatePayout(opAmount, currency);
        form.setValue("target_currency", currency, { shouldValidate: true });
    };

    const calculatePayout = (opAmount: number, currency: "JPY" | "USDT" | "JPYC" | "TEC" | undefined) => {
        if (!currency || !opAmount) {
            setPayoutAmount(0);
            return;
        }
        const rate = exchangeRates[`op_to_${currency.toLowerCase()}` as keyof typeof exchangeRates];
        const baseAmount = opAmount * rate;
        const feeAmount = baseAmount * 0.05;
        const finalAmount = baseAmount - feeAmount;
        setPayoutAmount(finalAmount);
    };


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            // Get current user (you'll need to get this from auth context)
            const userResponse = await fetch('/api/auth/me'); // Assuming you have an auth endpoint
            const userData = await userResponse.json();

            const response = await fetch('/api/payments/create-exchange', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    op_amount: values.op_amount,
                    target_currency: values.target_currency,
                    user_id: userData.user.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create exchange request');
            }

            toast({
                title: "換金申請が送信されました",
                description: `${values.op_amount} OPの換金申請が保留中です。管理者の承認をお待ちください。`,
            });

            // Refresh user data to show updated balance
            window.location.reload();
        } catch (error) {
            toast({
                title: "エラー",
                description: error instanceof Error ? error.message : "換金申請に失敗しました。",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            form.reset();
            setPayoutAmount(0);
        }
    }
    
    const opAmount = form.watch('op_amount') || 0;
    const currency = form.watch('target_currency');
    const basePayoutAmount = currency ? opAmount * exchangeRates[`op_to_${currency.toLowerCase()}` as keyof typeof exchangeRates] : 0;
    const fee = basePayoutAmount * 0.05; // 5% fee deducted from payout
    const finalPayoutAmount = basePayoutAmount - fee;
    const totalDeducted = opAmount; // Only the OP amount is deducted from balance
    const payoutDecimalDigits = currency === 'JPY' ? 0 : 2;

    return (
        <Card>
            <CardHeader>
                <CardTitle>新規換金申請</CardTitle>
                <CardDescription>現在のOP保有量: {user.op_balance.toLocaleString()} OP</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-muted p-3 rounded-lg">
                                <h4 className="font-semibold text-muted-foreground">月間換金上限</h4>
                                <p className="text-xl font-bold">{Math.floor(monthlyLimit).toLocaleString()} OP</p>
                            </div>
                             <div className="bg-muted p-3 rounded-lg">
                                <h4 className="font-semibold text-muted-foreground">今月の換金可能額</h4>
                                <p className="text-xl font-bold">{Math.floor(availableToRedeemThisMonth).toLocaleString()} OP</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="op_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>換金希望OP額</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="例: 1000" 
                                                {...field} 
                                                onChange={handleAmountChange} 
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="target_currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>交換先通貨</FormLabel>
                                        <Select onValueChange={(value: "JPY" | "USDT" | "JPYC" | "TEC") => handleCurrencyChange(value)} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="通貨を選択..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="JPY">JPY (円)</SelectItem>
                                                <SelectItem value="USDT">USDT (Tether)</SelectItem>
                                                <SelectItem value="JPYC">JPYC</SelectItem>
                                                <SelectItem value="TEC">TEC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">換金予定額:</span>
                                <span>{basePayoutAmount.toLocaleString(undefined, { 
                                    minimumFractionDigits: payoutDecimalDigits,
                                    maximumFractionDigits: payoutDecimalDigits,
                                })} {currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">手数料 (5%):</span>
                                <span>-{fee.toLocaleString(undefined, { minimumFractionDigits: payoutDecimalDigits, maximumFractionDigits: payoutDecimalDigits })} {currency}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-muted-foreground">差し引かれるOP総額:</span>
                                <span>{totalDeducted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} OP</span>
                            </div>
                             <div className="flex justify-between text-lg font-bold text-primary pt-2">
                                <span>受取予定額:</span>
                                <span>
                                    {finalPayoutAmount.toLocaleString(undefined, { 
                                        minimumFractionDigits: payoutDecimalDigits,
                                        maximumFractionDigits: payoutDecimalDigits,
                                    })} {currency}
                                </span>
                            </div>
                        </div>
                        <FormDescription>
                           管理者の承認後、ご登録の口座へ7営業日以内に着金します。
                        </FormDescription>

                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <LoadingSpinner /> : '換金申請を送信'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}