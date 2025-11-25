'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner, OnenessKingdomLogo } from '@/lib/icons';
import MobileNavigation from '@/components/layout/mobile-navigation';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: 'メール送信完了',
          description: 'パスワードリセット用のリンクをメールで送信しました。',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'エラー',
          description: error.message || 'メールの送信に失敗しました。',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: 'エラー',
        description: '通信エラーが発生しました。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        {/* Unified Mobile Navigation */}
        <MobileNavigation 
          variant="auth" 
          stepIndicator="メール送信完了"
          showLogo={true}
        />

        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
          <div className="mx-auto grid w-full max-w-md gap-6">
            <div className="grid gap-2 text-center">
              <div className="flex justify-center items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <OnenessKingdomLogo className="w-5 h-5" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-stone-800">メールをご確認ください</h1>
              <p className="text-stone-500">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      {/* Unified Mobile Navigation */}
      <MobileNavigation 
        variant="auth" 
        stepIndicator="パスワードリセット"
        showLogo={true}
      />

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <OnenessKingdomLogo className="w-5 h-5" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-stone-800">パスワードをリセット</h1>
            <p className="text-stone-500">
              メールアドレスを入力すると、パスワードリセット用のリンクを送信します。
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
