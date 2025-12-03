'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { login } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setMessage('すべての項目を入力してください。');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to sign in user...');

      // Sign in user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        setMessage('ログインエラー: ' + signInError.message);
        setIsError(true);
        return;
      }

      console.log('Sign in successful:', signInData);
      setMessage('ログインに成功しました！');
      setIsError(false);

      // Set user data in localStorage for the auth system
      if (signInData.user) {
        login(signInData.user);
      }

      // Set auth token in localStorage for dashboard API calls
      if (signInData.session?.access_token) {
        localStorage.setItem('auth_token', signInData.session.access_token);
      }

      // Set auth tokens via API callback (server-side cookies)
      if (signInData.session) {
        console.log('Login: Setting auth cookies via callback...');
        try {
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              access_token: signInData.session.access_token,
              refresh_token: signInData.session.refresh_token,
            }),
          });

          console.log('Login: Callback response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Login: Callback failed:', errorData);
            throw new Error('Failed to set auth cookies');
          }

          const result = await response.json();
          console.log('Login: Callback success:', result);
        } catch (error) {
          console.error('Login: Auth callback error:', error);
          setMessage('認証クッキーの設定に失敗しました');
          setIsError(true);
          return;
        }
      }

      // Redirect to dashboard after successful login and cookie setup
      setTimeout(() => {
        console.log('Login: Redirecting to dashboard...');
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('予期せぬエラーが発生しました');
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

      if (error) {
        console.error('Google login error:', error);
        setMessage('Googleログインエラー: ' + error.message);
        setIsError(true);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('予期せぬエラーが発生しました');
      setIsError(true);
    }
  };


  return (
    <div className="min-h-screen bg-[#f8f7f6] dark:bg-[#221810] text-[#181411] dark:text-gray-200 font-sans">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          {/* Main Content */}
          <main className="flex flex-1 justify-center py-10 sm:py-20 px-4">
            <div className="flex flex-col w-full max-w-md items-center gap-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-8 h-8 text-[#ec6d13]">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">ログイン</h1>
              </div>

              <div className="w-full flex flex-col gap-4">
                <label className="flex flex-col w-full">
                  <p className="text-base font-medium leading-normal pb-2">メールアドレスまたはユーザー名</p>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="メールアドレスまたはユーザー名を入力"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181411] focus:outline-0 focus:ring-2 focus:ring-[#ec6d13]/50 border border-[#e6e0db] dark:border-gray-700 bg-white dark:bg-[#221810] dark:text-gray-200 h-14 placeholder:text-[#897261] p-[15px] text-base font-normal leading-normal"
                    required
                  />
                </label>

                <label className="flex flex-col w-full">
                  <p className="text-base font-medium leading-normal pb-2">パスワード</p>
                  <div className="flex w-full flex-1 items-stretch rounded-xl">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="パスワードを入力"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181411] focus:outline-0 focus:ring-2 focus:ring-[#ec6d13]/50 border border-[#e6e0db] dark:border-gray-700 bg-white dark:bg-[#221810] dark:text-gray-200 h-14 placeholder:text-[#897261] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#897261] dark:text-gray-400 flex border border-[#e6e0db] dark:border-gray-700 bg-white dark:bg-[#221810] items-center justify-center pr-[15px] rounded-r-xl border-l-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </label>
              </div>

              <div className="w-full flex flex-col items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-[#ec6d13] text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
                >
                  <span className="truncate">
                    {isLoading ? 'ログイン中...' : 'ログイン'}
                  </span>
                </button>
                <a className="text-sm font-medium text-[#ec6d13] hover:underline" href="#">パスワードをお忘れですか？</a>
              </div>

              <div className="flex w-full items-center gap-4">
                <hr className="flex-grow border-t border-[#e6e0db] dark:border-gray-700" />
                <span className="text-sm text-[#897261] dark:text-gray-400">または</span>
                <hr className="flex-grow border-t border-[#e6e0db] dark:border-gray-700" />
              </div>

              <div className="w-full flex flex-col gap-4">
                <button
                  onClick={handleGoogleLogin}
                  className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl h-14 px-4 bg-white dark:bg-gray-800 border border-[#e6e0db] dark:border-gray-700 text-[#181411] dark:text-gray-200 text-base font-bold leading-normal"
                >
                  <img alt="Google logo" className="h-6 w-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg-aXh64jogBJKQpvMMibhkyMT3q4q1XmVRrFfeaEkStu_Cxp-OUAUKazAwkI5KxNyXLBsowLmiqw4H2VE_LFNeBdd88plMYFht0j5g4qPyMlkv2HwAdO8swy_PLMFjuXh89GZaV7z2n8ADUkmEuhpTsRpvQEejd40Yv4vkbL5IcVD3F1N9keePDlAC-lQ4bBvyG7HOYc7aK50HLC8ZQXqQWHUb2IArV-SSoiIBghwxhR-RHArUubqMkz4129Wf8KNZ7QFuiuu2Ws" />
                  <span className="truncate">Googleで続ける</span>
                </button>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`px-4 py-3 mt-4 text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </div>
              )}

              <p className="text-sm text-center">
                <span className="text-[#897261] dark:text-gray-400">アカウントをお持ちでないですか？</span>
                <Link href="/register" className="font-bold text-[#ec6d13] hover:underline"> アカウントを作成</Link>
              </p>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-[#f4f2f0] dark:border-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-[#897261] dark:text-gray-400">© 2024 Oneness Kingdom. All rights reserved.</p>
                <div className="flex items-center gap-6 text-sm font-medium">
                  <a className="hover:text-[#ec6d13]" href="#">About</a>
                  <a className="hover:text-[#ec6d13]" href="#">Terms of Service</a>
                  <a className="hover:text-[#ec6d13]" href="#">Privacy Policy</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
