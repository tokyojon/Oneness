'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState, Suspense } from "react";

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
import { LoadingSpinner } from "@/lib/icons";
import { OnenessKingdomLogo } from "@/lib/icons";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import MobileNavigation from '@/components/layout/mobile-navigation';

const formSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Check if we have the reset token in the URL hash (Supabase uses #)
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setIsError(true);
    }
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Supabase handles the token from the URL hash automatically
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Reset failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully reset.",
        });
        setIsSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
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
