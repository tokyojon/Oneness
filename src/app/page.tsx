'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  User, Heart, Globe, Shield, Zap, ArrowRight, 
  Sparkles, Menu, X, ChevronRight, PlayCircle, Star 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Reusable Animation Components ---

const FadeInUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
    
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
    
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : "hidden"}
      whileInView={prefersReducedMotion ? {} : "visible"}
      viewport={{ once: true, margin: "-100px" }}
      variants={prefersReducedMotion ? {} : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2 }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StaggerItem = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
    
  return (
    <motion.div
      variants={prefersReducedMotion ? {} : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- UI Components ---

const GlassCard = ({ children, className = "", hoverEffect = true }: { children: React.ReactNode, className?: string, hoverEffect?: boolean }) => (
  <div className={`
    bg-white/60 backdrop-blur-xl border border-white/50 
    rounded-3xl shadow-xl shadow-stone-200/40 p-6 sm:p-8
    transition-all duration-500
    ${hoverEffect ? 'hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-100' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const FeatureIcon = ({ icon: Icon }: { icon: any }) => (
  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-sky-100 to-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner text-sky-500 ring-1 ring-sky-100">
    <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
  </div>
);

const SectionTitle = ({ subtitle, title }: { subtitle: string, title: string }) => (
  <div className="mb-12 sm:mb-16 text-center max-w-2xl mx-auto">
    <motion.span 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="text-sky-500 font-bold tracking-[0.2em] text-sm uppercase block mb-3"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-800 leading-tight"
    >
      {title}
    </motion.h2>
    <motion.div 
      initial={{ width: 0 }}
      whileInView={{ width: 80 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="h-1 bg-sky-400 mx-auto mt-6 rounded-full"
    />
  </div>
);

// --- Main Page Component ---

export default function OnenessDesktop() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const router = useRouter();
  
  // Parallax background transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    // Check authentication status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/dashboard');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      // Close mobile menu on scroll
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    // Close mobile menu on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (mobileMenuOpen && !(e.target as Element).closest('nav')) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [router, mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F5F0E6] font-sans text-stone-800 overflow-x-hidden selection:bg-sky-200 selection:text-sky-900">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute top-0 right-[-10%] w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-sky-200/30 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
        <motion.div style={{ y: y2 }} className="absolute top-[40%] left-[-10%] w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-orange-100/40 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[250px] sm:w-[375px] md:w-[500px] h-[250px] sm:h-[375px] md:h-[500px] bg-sky-100/30 rounded-full blur-[50px] sm:blur-[65px] md:blur-[80px]" />
      </div>

      {/* --- Glass Navigation --- */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3 px-4 sm:py-4 sm:px-6' : 'py-6 px-4 sm:py-8 sm:px-8 md:py-8 md:px-12'
        }`}
      >
        <div className={`
          mx-auto max-w-7xl rounded-2xl transition-all duration-500 flex justify-between items-center
          ${scrolled 
            ? 'bg-white/70 backdrop-blur-md shadow-lg border border-white/40 py-3 px-4 sm:py-3 sm:px-6' 
            : 'bg-transparent py-2 px-0'
          }
        `}>
          {/* Logo area */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-lg leading-none tracking-tight text-stone-800">Oneness</span>
              <span className="text-xs font-bold text-sky-500 tracking-widest uppercase">Kingdom</span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-stone-600 hover:text-stone-800 transition-colors p-3"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {['特徴', 'ミッション', 'OP制度', 'コミュニティ'].map((item) => (
              <a key={item} href="#" className="text-stone-600 font-medium hover:text-sky-600 transition-colors text-sm tracking-wide relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Group */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <button className="text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors">
                ログイン
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-stone-800 hover:bg-black text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-stone-400/20 hover:shadow-stone-400/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                登録する
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/90 backdrop-blur-md border-t border-white/40 rounded-b-2xl"
            >
              <div className="py-4 px-6 space-y-3">
                {['特徴', 'ミッション', 'OP制度', 'コミュニティ'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-stone-600 font-medium hover:text-sky-600 transition-colors py-3 text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full text-left text-stone-600 font-medium py-3 text-base hover:text-sky-600 transition-colors">
                    ログイン
                  </button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full bg-stone-800 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-stone-400/20 hover:shadow-stone-400/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    登録する
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-12 sm:pb-16 lg:pb-24 xl:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Hero Content */}
          <div className="space-y-6 sm:space-y-8">
            <FadeInUp>
              <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm text-sky-600 font-bold text-xs uppercase tracking-wider shadow-sm mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                Welcome to the Future
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-800 leading-[1.1] tracking-tight mb-4 sm:mb-6">
                ワンネス<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-400">
                  キングダム
                </span>へ
                <br />ようこそ
              </h1>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-lg">
                愛と貢献が循環する、新しいデジタル国家。<br />
                AIとブロックチェーン技術が織りなす、<br />
                かつてない透明性と調和の世界へ。
              </p>
            </FadeInUp>

            <FadeInUp delay={0.2} className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <button className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white px-6 py-4 sm:px-8 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all transform hover:-translate-y-1 w-full sm:w-auto">
                  王国に参加する
                </button>
              </Link>
              <button className="bg-white hover:bg-stone-50 text-stone-700 px-6 py-4 sm:px-8 rounded-2xl font-bold text-base sm:text-lg shadow-md hover:shadow-lg border border-stone-100 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto">
                <PlayCircle size={20} className="text-sky-400" />
                ビジョンを見る
              </button>
            </FadeInUp>

            <FadeInUp delay={0.4} className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 border-t border-stone-200/50">
              <div className="flex items-center gap-3">
                <p className="text-2xl sm:text-3xl font-bold text-stone-800">10k+</p>
                <p className="text-stone-500 text-xs uppercase tracking-wider">Citizens</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl sm:text-3xl font-bold text-stone-800">50k+</p>
                <p className="text-stone-500 text-xs uppercase tracking-wider">Connections</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl sm:text-3xl font-bold text-stone-800">∞ </p>
                <p className="text-stone-500 text-xs uppercase tracking-wider">Possibilities</p>
              </div>
            </FadeInUp>
          </div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-orange-200/20 rounded-[2rem] sm:rounded-[3rem] blur-xl transform translate-x-2 sm:translate-x-4 translate-y-2 sm:translate-y-4" />
             <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-[4px] sm:border-[6px] border-white/40">
                {/* Hero Image */}
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=800&fit=crop&crop=center&auto=format&q=80" 
                  alt="Oneness Kingdom Utopia" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-[2s]"
                  loading="lazy"
                />
                
                {/* Floating Glass Badge */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-2 sm:gap-3 max-w-[200px] sm:max-w-xs"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-bold uppercase">Latest Activity</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-800">Hiro contributed 50 OP to Peace Project</p>
                  </div>
                </motion.div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24 xl:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle subtitle="Features" title="ワンネスキングダムの特徴" />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <StaggerItem>
              <GlassCard className="h-full">
                <FeatureIcon icon={Heart} />
                <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">貢献とつながり</h3>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm sm:text-base">
                  あなたの愛、学び、貢献の行動は、コミュニティ内で価値として視覚化され、循環します。
                </p>
                <ul className="space-y-3">
                  {['行動がポイントに変換', '貢献の可視化', '持続可能な循環'].map(item => (
                    <li key={item} className="flex items-center text-sm text-stone-500">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </StaggerItem>

            <StaggerItem>
              <GlassCard className="h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-sky-100 rounded-bl-[80px] sm:rounded-bl-[100px] -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 transition-transform group-hover:scale-110" />
                <FeatureIcon icon={Globe} />
                <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">ヒューマン<br/>ネットワーク</h3>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm sm:text-base">
                  フォロー、評価、推薦を通じて有意義な関係を築き、デジタルな家族の絆さえも形成します。
                </p>
                <ul className="space-y-3">
                  {['AI支援マッチング', '信頼スコア推薦', 'グローバルな絆'].map(item => (
                    <li key={item} className="flex items-center text-sm text-stone-500">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </StaggerItem>

            <StaggerItem>
              <GlassCard className="h-full">
                <FeatureIcon icon={Shield} />
                <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4">AIを活用した<br/>コミュニティ</h3>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm sm:text-base">
                  私たちのプラットフォームは、公正なマッチング、推薦、そして安全のためにAIを使用しています。
                </p>
                <ul className="space-y-3">
                  {['不正行為の自動検出', 'パーソナライズ推薦', 'ガイドライン執行'].map(item => (
                    <li key={item} className="flex items-center text-sm text-stone-500">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- Economy Section (Dark Theme Transition) --- */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24 xl:py-32 bg-stone-900 text-white overflow-hidden px-4 sm:px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-sky-900/40 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] sm:w-[450px] md:w-[600px] h-[350px] sm:h-[450px] md:h-[600px] bg-indigo-900/40 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <FadeInUp>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-yellow-400 font-bold text-xs uppercase tracking-wider mb-6">
                <Zap size={14} fill="currentColor" /> Economy
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
                OP制度：<br/>価値の新しい形
              </h2>
              <p className="text-stone-300 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-md">
                愛・平和・調和・貢献を基準に、会員が提供・共有・成長を通してポイント（価値）を循環させる仕組みです。
              </p>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                   <span className="text-stone-400 text-sm sm:text-base">通貨名</span>
                   <span className="text-lg sm:text-xl font-bold font-mono">OP (One Point)</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                   <span className="text-stone-400 text-sm sm:text-base">換算レート</span>
                   <span className="text-lg sm:text-xl font-bold font-mono text-sky-400">1 OP = 100円</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                   <span className="text-stone-400 text-sm sm:text-base">会員登録</span>
                   <span className="text-lg sm:text-xl font-bold font-mono text-green-400">Free / 無料</span>
                </div>
              </div>
            </FadeInUp>

            <div className="relative">
              {/* Decorative Card Stack */}
              <motion.div 
                initial={{ rotate: 6, opacity: 0 }}
                whileInView={{ rotate: 6, opacity: 0.5 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl sm:rounded-3xl transform translate-x-2 sm:translate-x-4 translate-y-2 sm:translate-y-4"
              />
              <GlassCard className="relative bg-stone-800/90 border-stone-700 shadow-2xl hover:translate-y-0">
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                   <div>
                     <p className="text-stone-400 text-sm font-bold uppercase tracking-wider">Total Balance</p>
                     <p className="text-4xl sm:text-5xl font-mono font-bold text-white mt-2">1,250 <span className="text-base sm:text-lg text-yellow-400">OP</span></p>
                   </div>
                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400">
                     <Zap className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                   </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-bold text-stone-300 text-sm uppercase tracking-wide mb-2">Activities</h4>
                  {[
                    { label: '提供登録 (AI審査通過)', val: '+1 OP' },
                    { label: '紹介成功', val: '+1 OP' },
                    { label: 'コミュニティ貢献', val: '+5 OP' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 sm:py-3 border-b border-stone-700 last:border-0">
                      <span className="text-xs sm:text-sm text-stone-300">{item.label}</span>
                      <span className="font-mono font-bold text-sky-400 text-sm sm:text-base">{item.val}</span>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 sm:mt-8 bg-white text-stone-900 font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors text-sm sm:text-base">
                  ウォレットを見る
                </button>
              </GlassCard>
            </div>

          </div>
        </div>
      </section>

      {/* --- How to Start (Horizontal Process) --- */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24 xl:py-32 px-4 sm:px-6">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <SectionTitle subtitle="Start Journey" title="ワンネスキングダムの始め方" />

           <div className="relative mt-16 sm:mt-20">
             {/* Connecting Line */}
             <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-stone-200 via-sky-200 to-stone-200 -translate-y-1/2 hidden md:block" />

             <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
                {[
                  { id: 1, title: 'アカウント登録', desc: 'メールアドレスで簡単登録。プロフィールを設定して初期ポイントを受け取りましょう。' },
                  { id: 2, title: 'AIによる認証', desc: '高度なAI強化認証プロセスで、あなたの身元と安全を保護します。' },
                  { id: 3, title: 'コミュニティ参加', desc: '貢献し、つながり、王国の成長に参加しましょう。' }
                ].map((step, i) => (
                  <StaggerItem key={step.id}>
                    <div className="text-center group cursor-default">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center text-xl sm:text-2xl font-bold text-sky-500 mb-4 sm:mb-6 relative z-10 transition-transform group-hover:scale-110 group-hover:border-sky-100">
                        {step.id}
                      </div>
                      <div className="bg-white/40 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/60 hover:bg-white/80 transition-colors">
                        <h4 className="text-lg sm:text-xl font-bold text-stone-800 mb-3">{step.title}</h4>
                        <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
             </StaggerContainer>
           </div>
           
           <div className="mt-12 sm:mt-16 text-center">
             <Link href="/register">
               <button className="bg-stone-800 text-white px-8 py-4 sm:px-10 sm:py-4 rounded-full font-bold shadow-2xl hover:shadow-stone-500/30 transition-all hover:-translate-y-1 inline-flex items-center gap-2 text-base sm:text-lg">
                 今すぐ始める
                 <ArrowRight size={18} />
               </button>
             </Link>
           </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-stone-100 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="font-bold text-base sm:text-lg">Oneness</span>
             </div>
             <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
               テクノロジーとスピリチュアリティの融合を信じるグローバルチームによって設立されました。
             </p>
          </div>
          
          <div>
            <h4 className="font-bold text-stone-800 mb-4 sm:mb-6 text-sm sm:text-base">プラットフォーム</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-stone-500">
              <li><a href="#" className="hover:text-sky-500 transition-colors">ホーム</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">特徴</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">OP制度</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">ロードマップ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-stone-800 mb-4 sm:mb-6 text-sm sm:text-base">リソース</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-stone-500">
              <li><a href="#" className="hover:text-sky-500 transition-colors">ヘルプセンター</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">コミュニティガイドライン</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">プライバシーポリシー</a></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-stone-800 mb-4 sm:mb-6 text-sm sm:text-base">ニュースレター</h4>
             <div className="flex gap-2">
               <input type="email" placeholder="Email address" className="bg-stone-100 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-200" />
               <button className="bg-stone-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold">送信</button>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-stone-100 pt-4 sm:pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400">
           <p>© 2024 Oneness Kingdom. All rights reserved.</p>
           <div className="flex gap-4 sm:gap-6 mt-4 md:mt-0">
             <span className="cursor-pointer hover:text-sky-500 transition-colors">Twitter</span>
             <span className="cursor-pointer hover:text-sky-500 transition-colors">Discord</span>
             <span className="cursor-pointer hover:text-sky-500 transition-colors">Instagram</span>
           </div>
        </div>
      </footer>
    </div>
  );
}