'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_URL = 'https://edfixzjpvsqpebzehsqy.functions.supabase.co/create-user-profile';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
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

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name || !email || !password) {
      setMessage('すべての項目を入力してください。');
      setIsError(true);
      return;
    }

    if (name.length < 2) {
      setMessage('お名前は2文字以上で入力してください。');
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage('パスワードは6文字以上で入力してください。');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to sign up user...');

      // Sign up user
      const { data: signData, error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });

      if (signError) {
        console.error('Sign up error:', signError);
        setMessage('登録エラー: ' + signError.message);
        setIsError(true);
        return;
      }

      console.log('Sign up successful:', signData);

      // If email confirmation required, signData.user may be null
      const user = signData?.user;
      const session = signData?.session;

      if (!user) {
        setMessage('登録を受け付けました。メールアドレスの確認をお願いします。');
        setIsError(false);
        return;
      }

      // Obtain the user's access token (JWT)
      const token = session?.access_token || (await supabase.auth.getSession()).data.session?.access_token;

      if (!token) {
        setMessage('登録されましたが、プロフィール作成用の認証トークンを取得できませんでした。メール確認後にサインインしてください。');
        setIsError(false);
        return;
      }

      console.log('Calling edge function to create profile...');

      // Call Edge Function to create profile using user's JWT
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ user_id: user.id, display_name: name })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Profile creation failed:', err);
        setMessage('登録されましたが、プロフィール作成に失敗しました: ' + (err.error || res.statusText));
        setIsError(true);
        return;
      }

      console.log('Profile created successfully');
      setMessage('登録とプロフィール作成が完了しました。サインインしています。');
      setIsError(false);

      // Save auth token for dashboard access
      if (token) {
        localStorage.setItem('auth_token', token);
      }

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('予期せぬエラーが発生しました');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          {/* Main Content */}
          <div className="flex flex-1 justify-center py-5 sm:px-6 lg:px-8 pt-24">
            <div className="flex flex-col w-full max-w-md flex-1">
              <main className="flex-grow pt-8">
                <div className="px-4 sm:px-6">
                  <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-bold leading-tight text-center pb-3">Create account</h1>
                </div>

                <div className="flex justify-center mt-6">
                  <div className="flex w-full gap-3 flex-wrap px-4 py-3 max-w-sm justify-center">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold leading-normal tracking-[0.015em] grow gap-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.8 12.2c0-.7-.1-1.5-.2-2.2H12v4.1h5.5c-.2 1.4-.9 2.5-2.1 3.3v2.7h3.5c2-1.9 3.2-4.6 3.2-7.9Z" fill="#4285F4"></path>
                        <path d="M12 22c2.7 0 5-1 6.6-2.6l-3.5-2.7c-.9.6-2.1 1-3.2 1-2.4 0-4.5-1.6-5.2-3.8H3.2v2.8C5 20.1 8.3 22 12 22Z" fill="#34A853"></path>
                        <path d="M6.8 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V8.1H3.2C2.4 9.7 2 11.2 2 12.5s.4 2.8 1.2 4.4l3.6-2.6Z" fill="#FBBC05"></path>
                        <path d="M12 6.8c1.5 0 2.8.5 3.8 1.5l3.1-3.1C17 .8 14.7 0 12 0 8.3 0 5 1.9 3.2 4.7l3.6 2.8c.7-2.2 2.8-3.7 5.2-3.7Z" fill="#EA4335"></path>
                      </svg>
                      <span className="truncate">Googleで登録</span>
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">または</p>

                <div className="flex justify-center">
                  <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 px-4 py-3 max-w-sm">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal pb-2">お名前</p>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="お名前を入力してください"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-green-600/50 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-600 h-14 placeholder:text-slate-500 dark:placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-colors"
                        required
                        minLength={2}
                      />
                    </label>

                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal pb-2">メールアドレス</p>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-green-600/50 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-600 h-14 placeholder:text-slate-500 dark:placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-colors"
                        required
                      />
                    </label>

                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal pb-2">パスワード</p>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="6文字以上"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-green-600/50 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-600 h-14 placeholder:text-slate-500 dark:placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-colors"
                        required
                        minLength={6}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex mt-2 min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-4 bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      <span className="truncate">
                        {isLoading ? '登録中...' : '登録する'}
                      </span>
                    </button>
                  </form>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`px-4 py-3 mt-4 text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                  </div>
                )}
              </main>

              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  By registering, you agree to our <a className="font-medium text-blue-600/80 hover:text-blue-600" href="#">Terms of Service</a> and <a className="font-medium text-blue-600/80 hover:text-blue-600" href="#">Privacy Policy</a>.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign in</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="flex w-full shrink-0 flex-col items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-700 px-4 py-6 sm:flex-row md:px-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">© 2024 Oneness Kingdom. All rights reserved.</p>
            <nav className="flex gap-4 sm:ml-auto sm:gap-6">
              <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100" href="#">Terms of Service</a>
              <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100" href="#">Privacy Policy</a>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
