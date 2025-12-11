'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "メールアドレスとパスワードを入力してください。",
      });
      setMessage('すべての項目を入力してください。');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to sign in user via API...');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Sign in successful:', data);
      setMessage('ログインに成功しました！');
      setIsError(false);

      // Update local storage for legacy compatibility if needed
      if (data.user) {
        login(data.user);
      }
      // Note: access_token is now in httpOnly cookie, so we don't set it in localStorage
      // However, some components might still look for it. For now, we rely on cookies.
      // If client-side components need it, we might need to change strategy.
      // But adhering to "Remove Direct Supabase Interaction" implies we shouldn't use the token on client.

      toast({
        title: "ログイン成功",
        description: "ダッシュボードへ移動します...",
      });

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (err: any) {
      console.error('Login error:', err);
      toast({
        variant: "destructive",
        title: "ログインエラー",
        description: err.message || "メールアドレスまたはパスワードが正しくありません。",
      });
      setMessage(err.message || 'ログインエラー');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err);
      toast({
        variant: "destructive",
        title: "Googleログインエラー",
        description: err.message,
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
            <h1 className="text-3xl font-black tracking-tight">ログイン</h1>
            <p className="mt-2 text-sm text-[#897261] dark:text-gray-400">
              アカウントにアクセス
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/50 py-8 px-4 shadow-[0_0_4px_rgba(0,0,0,0.05)] rounded-xl sm:px-10 border border-[#e6e0db] dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-[#181411] dark:text-gray-200 mb-1">
                  メールアドレスまたはユーザー名
                </label>
                <Input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="メールアドレスを入力"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181411] dark:text-gray-200 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="パスワードを入力"
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#ec6d13] hover:bg-[#d45f0f] text-white font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <a className="text-sm font-medium text-[#ec6d13] hover:underline" href="#">パスワードをお忘れですか？</a>
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
                  onClick={handleGoogleLogin}
                  className="w-full h-12 border-[#e6e0db] dark:border-gray-700 gap-2"
                >
                  <img alt="Google" className="h-5 w-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg-aXh64jogBJKQpvMMibhkyMT3q4q1XmVRrFfeaEkStu_Cxp-OUAUKazAwkI5KxNyXLBsowLmiqw4H2VE_LFNeBdd88plMYFht0j5g4qPyMlkv2HwAdO8swy_PLMFjuXh89GZaV7z2n8ADUkmEuhpTsRpvQEejd40Yv4vkbL5IcVD3F1N9keePDlAC-lQ4bBvyG7HOYc7aK50HLC8ZQXqQWHUb2IArV-SSoiIBghwxhR-RHArUubqMkz4129Wf8KNZ7QFuiuu2Ws" />
                  Googleで続ける
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-[#897261] dark:text-gray-400">
            アカウントをお持ちでないですか？{' '}
            <Link href="/register" className="font-bold text-[#ec6d13] hover:text-[#d45f0f]">
              アカウントを作成
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
