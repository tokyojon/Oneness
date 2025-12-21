'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { loadStripe } from "@stripe/stripe-js"

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

interface BuyOpFormProps {
    user: {
        op_balance: number;
    };
}

const JPY_PER_OP = 100.0;

const formSchema = z.object({
    op_amount: z.coerce.number().positive("購入額は正でなければなりません。").min(100, "最低100 OPから購入できます。"),
});

export default function BuyOpForm({ user }: BuyOpFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            op_amount: undefined,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            // Get current user
            const userResponse = await fetch('/api/auth/me');
            if (!userResponse.ok) {
                throw new Error('Authentication required');
            }
            const userData = await userResponse.json();

            const response = await fetch('/api/payments/create-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    op_amount: values.op_amount,
                    user_id: userData.user.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.checkoutUrl;
        } catch (error) {
            toast({
                title: "エラー",
                description: error instanceof Error ? error.message : "購入処理に失敗しました。",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }
    const opAmount = form.watch('op_amount') || 0;
    const baseJpyAmount = opAmount * JPY_PER_OP;
    const fee = baseJpyAmount * 0.05; // 5% fee added to purchase
    const totalJpyAmount = baseJpyAmount + fee;

    return (
        <Card>
            <CardHeader>
                <CardTitle>OPを購入</CardTitle>
                <CardDescription>現在のOP保有量: {user.op_balance.toLocaleString()} OP</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="op_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>購入希望OP額</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="例: 5000" 
                                            {...field} 
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2 text-sm border-t pt-4">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">現在のレート:</span>
                                <span>1 OP = {JPY_PER_OP} JPY</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">基本金額:</span>
                                <span>{baseJpyAmount.toLocaleString()} JPY</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">手数料 (5%):</span>
                                <span>{fee.toLocaleString()} JPY</span>
                            </div>
                             <div className="flex justify-between text-lg font-bold text-primary pt-2">
                                <span>お支払い金額:</span>
                                <span>
                                    {totalJpyAmount.toLocaleString()} JPY
                                </span>
                            </div>
                        </div>
                        <FormDescription>
                           クレジットカードまたは銀行振込でお支払いいただけます。
                        </FormDescription>

                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <LoadingSpinner /> : '購入手続きへ進む'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
