'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const response = await fetch('https://edfixzjpvsqpebzehsqy.supabase.co/functions/v1/record-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          display_name: formData.username,
          metadata: {
            password: formData.password,
            kyc_status: "pending",
            role: "user",
            welcome_bonus: 100
          },
          source: "web"
        }),
      });

      if (response.ok) {
        router.push('/login?message=registration-success');
      } else {
        const error = await response.json();
        console.error('Registration failed:', error);
      }
    } catch (error) {
      console.error('Registration error:', error);
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
                  <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-bold leading-tight text-center pb-3">ようこそ、新しい世界へ</h1>
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
                      <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal pb-2">ユーザー名</p>
                      <input 
                        type="text" 
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="あなたのユーザー名" 
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-green-600/50 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-600 h-14 placeholder:text-slate-500 dark:placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-colors"
                        required
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
                        placeholder="8文字以上" 
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-green-600/50 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-600 h-14 placeholder:text-slate-500 dark:placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-colors"
                        required
                        minLength={8}
                      />
                    </label>
                    
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex mt-2 min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-4 bg-green-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      <span className="truncate">
                        {isLoading ? '登録中...' : 'メールアドレスで登録'}
                      </span>
                    </button>
                  </form>
                </div>
              </main>
              
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4"> 
                  登録することにより、<a className="font-medium text-green-600/80 hover:text-green-600" href="#">利用規約</a>と<a className="font-medium text-green-600/80 hover:text-green-600" href="#">プライバシーポリシー</a>に同意したことになります。 
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400"> 
                  すでにアカウントをお持ちですか？ <Link href="/login" className="font-bold text-green-600 hover:underline">ログイン</Link> 
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="flex w-full shrink-0 flex-col items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-700 px-4 py-6 sm:flex-row md:px-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">© 2024 Oneness Kingdom. All rights reserved.</p>
            <nav className="flex gap-4 sm:ml-auto sm:gap-6">
              <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100" href="#">利用規約</a>
              <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100" href="#">プライバシーポリシー</a>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
