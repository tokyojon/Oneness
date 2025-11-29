'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
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
      const response = await fetch('https://edfixzjpvsqpebzehsqy.supabase.co/functions/v1/admin-register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          display_name: formData.displayName,
          profileData: undefined,
          kyc_status: "pending",
          role: "user",
          welcome_bonus: 100,
          avatarData: undefined
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
    <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden flex flex-col">
      
      {/* --- Background Ambience --- */}
      {/* Soft glowing orbs to create the 'Kingdom' atmosphere */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      {/* --- Header --- */}
      <header className="relative z-10 px-6 pt-6 pb-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-black/5 text-stone-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-sm font-bold text-stone-400 tracking-widest">STEP 1 / 3</div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 px-6 flex flex-col justify-center relative z-10 pb-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <div className="inline-block p-3 bg-white/40 backdrop-blur-md rounded-2xl mb-4 shadow-sm">
             <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center">
               <Sparkles size={20} className="text-white" />
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-800 mb-2">旅の始まり</h1>
          <p className="text-stone-500 text-sm">アカウントを作成して、調和への第一歩を踏み出しましょう。</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-2xl shadow-sky-100/50"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 ml-1">表示名</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-stone-400 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="例: ヒカル" 
                  className="w-full pl-11 pr-4 py-4 bg-white rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all shadow-sm"
                  required
                />
              </div>
              <p className="text-[10px] text-stone-400 text-right">コミュニティ内で表示される名前です</p>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 ml-1">メールアドレス</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-stone-400 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="hello@example.com" 
                  className="w-full pl-11 pr-4 py-4 bg-white rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 ml-1">パスワード</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-stone-400 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="6文字以上" 
                  className="w-full pl-11 pr-12 py-4 bg-white rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all shadow-sm"
                  required
                  minLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 disabled:from-stone-300 disabled:to-stone-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  次へ: アバター作成
                  <Sparkles size={18} className="text-sky-100 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>

          </form>
        </motion.div>

        {/* --- Footer --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-stone-500">
            すでにアカウントをお持ちですか？{' '}
            <Link href="/login" className="text-sky-600 font-bold hover:underline">
              こちらでログイン
            </Link>
          </p>
        </motion.div>

      </main>
    </div>
  );
}
