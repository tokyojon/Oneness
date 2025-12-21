'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { LoadingSpinner } from "@/lib/icons";
import { OnenessKingdomLogo } from "@/lib/icons";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      console.log('Submitting password reset request for:', values.email);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();
      console.log('Reset password response:', data);

      if (response.ok) {
        toast({
          title: "リセットメールを送信しました",
          description: `${values.email}にパスワードリセット用のメールを送信しました。メールをご確認ください。`,
        });
        setIsSuccess(true);
      } else {
        toast({
          variant: "destructive",
          title: "送信に失敗しました",
          description: data.error || 'エラーが発生しました。メールアドレスを確認してもう一度お試しください。',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予期せぬエラーが発生しました。しばらくしてからもう一度お試しください。",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex justify-center items-center gap-2 mb-4">
              <OnenessKingdomLogo className="h-10 w-10" />
            </Link>
            <h1 className="text-3xl font-bold font-headline">メールをご確認ください</h1>
            <p className="text-balance text-muted-foreground">
              パスワードリセット用のリンクをメールで送信しました。
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    メール内のリンクをクリックしてパスワードをリセットしてください。
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ※ メールが届かない場合は、迷惑メールフォルダもご確認ください。
                  </p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">ログインに戻る</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="grid gap-2 text-center">
          <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <OnenessKingdomLogo className="h-10 w-10" />
          </Link>
          <h1 className="text-3xl font-bold font-headline">Reset your password</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                Back to login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
