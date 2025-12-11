'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const EDGE_FUNCTION_URL = 'https://edfixzjpvsqpebzehsqy.functions.supabase.co/create-user-profile';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "すべての項目を入力してください。",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "パスワードエラー",
        description: "パスワードは6文字以上で入力してください。",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting to register user via API...');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.user) {
        toast({
          title: "登録成功",
          description: "アカウントが作成されました。ダッシュボードへ移動します。",
        });

        // Redirect
        router.push('/dashboard');
      } else {
        toast({
          title: "確認メールを送信しました",
          description: "メールを確認して登録を完了してください。",
        });
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "登録エラー",
        description: error.message || "予期せぬエラーが発生しました。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Googleログインエラー",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f6] dark:bg-[#221810] text-[#181411] dark:text-gray-200 font-sans flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 text-[#ec6d13] mb-4">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-black tracking-tight">アカウント作成</h2>
            <p className="mt-2 text-sm text-[#897261] dark:text-gray-400">
              ワンネスキングダムへようこそ
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/50 py-8 px-4 shadow-[0_0_4px_rgba(0,0,0,0.05)] rounded-xl sm:px-10 border border-[#e6e0db] dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#181411] dark:text-gray-200">
                  お名前
                </label>
                <div className="mt-1">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="山田 太郎"
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#181411] dark:text-gray-200">
                  メールアドレス
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#181411] dark:text-gray-200">
                  パスワード
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#ec6d13] hover:bg-[#d45f0f] text-white font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? '登録中...' : '登録する'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e6e0db] dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-[#897261]">
                    または
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignup}
                  className="w-full h-12 border-[#e6e0db] dark:border-gray-700 gap-2"
                >
                  <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12.0003 20.45c4.6667 0 8.5-3.83 8.5-8.5 0-4.67-3.8333-8.5-8.5-8.5-4.6667 0-8.50002 3.83-8.50002 8.5 0 4.67 3.83332 8.5 8.50002 8.5Z" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" fill="none" />
                    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" fill="white" />
                    <path d="M11.99 12.01L12.01 11.99" stroke="#E6E0DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Googleで登録
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-[#897261] dark:text-gray-400">
            すでにアカウントをお持ちですか？{' '}
            <Link href="/login" className="font-bold text-[#ec6d13] hover:text-[#d45f0f]">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
