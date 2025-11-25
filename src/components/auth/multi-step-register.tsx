'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Sparkles, Eye, EyeOff, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  displayName: string;
  email: string;
  password: string;
  bio: string;
  interests: string[];
  avatarUrl?: string;
}

export default function MultiStepRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    password: '',
    bio: '',
    interests: [],
    avatarUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const router = useRouter();

  const totalSteps = 3;

  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce state update to prevent keyboard focus loss
    timeoutRef.current = setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }, 100);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = '表示名は必須です';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = '表示名は2文字以上で入力してください';
    } else if (formData.displayName.length > 50) {
      newErrors.displayName = '表示名は50文字以内で入力してください';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    } else if (formData.password.length > 128) {
      newErrors.password = 'パスワードは128文字以内で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = '自己紹介は500文字以内で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      let isValid = false;
      
      if (currentStep === 1) {
        isValid = validateStep1();
      } else if (currentStep === 2) {
        isValid = validateStep2();
      } else {
        isValid = true;
      }
      
      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        toast({
          title: "入力エラー",
          description: "必須項目を確認してください",
          variant: "destructive"
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    setIsLoading(true);
    setErrors({});

    try {
      // Final validation before submission
      if (!validateStep1() || !validateStep2()) {
        console.log('❌ Validation failed');
        toast({
          title: "入力エラー",
          description: "すべての必須項目を正しく入力してください",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Validation passed');

      // Prepare data for Supabase edge function
      const submissionData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        display_name: formData.displayName.trim(),
        profileData: formData.bio || formData.interests.length > 0 ? {
          bio: formData.bio.trim() || undefined,
          interests: formData.interests.length > 0 ? formData.interests : undefined
        } : undefined,
        kyc_status: "pending",
        role: "user",
        welcome_bonus: 100,
        avatarData: undefined
      };

      console.log('📤 Submitting registration data:', submissionData);

      const response = await fetch('https://edfixzjpvsqpebzehsqy.supabase.co/functions/v1/admin-register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(submissionData),
      });

      console.log('📥 Response status:', response.status);
      const responseData = await response.json();
      console.log('📥 Response data:', responseData);

      if (response.ok) {
        console.log('✅ Registration successful');
        toast({
          title: "登録成功！",
          description: "アカウントが正常に作成されました。ログインページに移動します。",
        });
        
        // Redirect after a short delay to let user see the success message
        setTimeout(() => {
          router.push('/login?message=registration-success');
        }, 1500);
      } else {
        console.log('❌ Registration failed');
        // Handle specific error cases
        let errorMessage = "登録に失敗しました。もう一度お試しください。";
        
        if (responseData.error) {
          if (responseData.error.includes('duplicate') || responseData.error.includes('already registered')) {
            errorMessage = "このメールアドレスは既に登録されています。";
          } else if (responseData.error.includes('password')) {
            errorMessage = "パスワードが要件を満たしていません。";
          } else if (responseData.error.includes('email')) {
            errorMessage = "メールアドレスが無効です。";
          } else {
            errorMessage = responseData.error;
          }
        }
        
        toast({
          title: "登録エラー",
          description: errorMessage,
          variant: "destructive"
        });
        
        console.error('Registration failed:', responseData);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      toast({
        title: "ネットワークエラー",
        description: "接続に失敗しました。インターネット接続を確認してください。",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${step < currentStep 
              ? 'bg-sky-500 text-white' 
              : step === currentStep 
                ? 'bg-sky-100 text-sky-600 ring-2 ring-sky-400' 
                : 'bg-stone-200 text-stone-400'
            }
          `}>
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < totalSteps && (
            <div className={`
              w-12 h-0.5 transition-all
              ${step < currentStep ? 'bg-sky-500' : 'bg-stone-200'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const Step1 = () => (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">基本情報</h2>
          <p className="text-stone-500 text-sm">アカウントの基本情報を入力してください</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">表示名</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-stone-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input 
                key="displayName"
                type="text" 
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="例: ヒカル" 
                className={`w-full pl-12 pr-4 py-4 bg-white rounded-xl border text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all ${
                  errors.displayName 
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                    : 'border-stone-200 focus:border-sky-400'
                }`}
                required
                autoComplete="name"
              />
            </div>
            {errors.displayName && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.displayName}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">メールアドレス</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-stone-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input 
                key="email"
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="hello@example.com" 
                className={`w-full pl-12 pr-4 py-4 bg-white rounded-xl border text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all ${
                  errors.email 
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                    : 'border-stone-200 focus:border-sky-400'
                }`}
                required
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">パスワード</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-stone-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input 
                key="password"
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="6文字以上" 
                className={`w-full pl-12 pr-12 py-4 bg-white rounded-xl border text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all ${
                  errors.password 
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                    : 'border-stone-200 focus:border-sky-400'
                }`}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-stone-300" />
              </div>
            </div>
            {errors.password && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            type="submit"
            className="flex-1 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            次へ
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );

  const Step2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">プロフィール</h2>
        <p className="text-stone-500 text-sm">自己紹介と興味を教えてください</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-600">自己紹介</label>
          <textarea 
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="自分について簡単に紹介してください..." 
            className={`w-full px-4 py-4 bg-white rounded-xl border text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all resize-none ${
              errors.bio 
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                : 'border-stone-200 focus:border-sky-400'
            }`}
            rows={4}
          />
          {errors.bio && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.bio}
            </div>
          )}
          <p className="text-xs text-stone-400 text-right">
            {formData.bio.length}/500文字
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-600">興味のある分野</label>
          <div className="grid grid-cols-2 gap-2">
            {['テクノロジー', 'アート', '音楽', 'スポーツ', '読書', '旅行', '料理', 'ゲーム'].map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    interests: prev.interests.includes(interest)
                      ? prev.interests.filter(i => i !== interest)
                      : [...prev.interests, interest]
                  }));
                }}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${formData.interests.includes(interest)
                    ? 'bg-sky-100 text-sky-600 border-2 border-sky-300'
                    : 'bg-white text-stone-600 border-2 border-stone-200 hover:border-stone-300'
                  }
                `}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleBack}
          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          戻る
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          次へ
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  const Step3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">確認</h2>
          <p className="text-stone-500 text-sm">入力内容を確認してください</p>
        </div>

        <div className="bg-white/50 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-600 mb-2">基本情報</h3>
            <div className="space-y-1">
              <p className="text-stone-800"><span className="font-medium">表示名:</span> {formData.displayName}</p>
              <p className="text-stone-800"><span className="font-medium">メール:</span> {formData.email}</p>
            </div>
          </div>

          {formData.bio && (
            <div>
              <h3 className="text-sm font-bold text-stone-600 mb-2">自己紹介</h3>
              <p className="text-stone-800">{formData.bio}</p>
            </div>
          )}

          {formData.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-stone-600 mb-2">興味</h3>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <span key={interest} className="px-2 py-1 bg-sky-100 text-sky-600 rounded-lg text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-sky-50 rounded-xl p-4">
          <p className="text-sm text-sky-700">
            <strong>注意:</strong> アバター設定は登録後にダッシュボードで行えます。
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={handleBack}
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            戻る
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            onClick={() => console.log('🔘 Submit button clicked')}
            className="flex-1 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 disabled:from-stone-300 disabled:to-stone-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登録中...
              </>
            ) : (
              <>
                アカウントを作成
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 px-6 pt-6 pb-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-3 rounded-full hover:bg-black/5 text-stone-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-sm font-bold text-stone-400 tracking-widest">
          STEP {currentStep} / {totalSteps}
        </div>
        <div className="w-12" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 flex flex-col justify-center relative z-10 pb-10 pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <div className="inline-block p-3 bg-white/40 backdrop-blur-md rounded-2xl mb-4 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
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
          <StepIndicator />
          
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1 />}
            {currentStep === 2 && <Step2 />}
            {currentStep === 3 && <Step3 />}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
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
