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

        // This is where a payment gateway integration would be called.
        console.log("Purchase request:", values);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
            title: "購入が完了しました",
            description: `${values.op_amount} OPがアカウントに追加されました。`,
        });
        
        setIsLoading(false);
        form.reset();
    }
    
    const opAmount = form.watch('op_amount') || 0;
    const jpyAmount = opAmount * JPY_PER_OP;

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
                             <div className="flex justify-between text-lg font-bold text-primary pt-2">
                                <span>お支払い金額:</span>
                                <span>
                                    {jpyAmount.toLocaleString()} JPY
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
