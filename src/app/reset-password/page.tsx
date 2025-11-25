'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { LoadingSpinner, OnenessKingdomLogo } from '@/lib/icons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import MobileNavigation from '@/components/layout/mobile-navigation';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string().min(6, '確認用パスワードは6文字以上で入力してください'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "無効なリセットリンクです。",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: 'パスワードリセット完了',
          description: 'パスワードが正常に更新されました。',
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setIsError(true);
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "パスワードのリセットに失敗しました。",
        });
      }
    } catch (error) {
      setIsError(true);
      toast({
        variant: "destructive",
        title: "Error",
        description: "通信エラーが発生しました。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        {/* Unified Mobile Navigation */}
        <MobileNavigation 
          variant="auth" 
          stepIndicator="エラー"
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
              <h1 className="text-3xl font-bold text-stone-800">無効なリセットリンク</h1>
              <p className="text-stone-500">
                このパスワードリセットリンクは無効または期限切れです。
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/forgot-password">Request new reset link</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        {/* Unified Mobile Navigation */}
        <MobileNavigation 
          variant="auth" 
          stepIndicator="エラー"
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
              <h1 className="text-3xl font-bold text-stone-800">無効なリセットリンク</h1>
              <p className="text-stone-500">
                このパスワードリセットリンクは無効または期限切れです。
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/forgot-password">Request new reset link</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        {/* Unified Mobile Navigation */}
        <MobileNavigation 
          variant="auth" 
          stepIndicator="完了"
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
              <h1 className="text-3xl font-bold text-stone-800">パスワードリセット完了</h1>
              <p className="text-stone-500">
                パスワードが更新されました。ログインページにリダイレクト中...
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Sign in now</Link>
                  </Button>
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
        stepIndicator="新しいパスワード"
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
            <h1 className="text-3xl font-bold text-stone-800">新しいパスワードを設定</h1>
            <p className="text-stone-500">
              新しいパスワードを入力してください。
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      "Update password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        {/* Unified Mobile Navigation */}
        <MobileNavigation 
          variant="auth" 
          stepIndicator="読み込み中"
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
              <LoadingSpinner className="w-8 h-8 mx-auto animate-spin" />
              <p className="text-stone-500">読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
