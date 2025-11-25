'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Menu, X, ArrowLeft, Sparkles, ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MobileNavigationProps {
  variant?: 'main' | 'auth';
  stepIndicator?: string;
  onBackClick?: () => void;
  showLogo?: boolean;
}

export default function MobileNavigation({ 
  variant = 'main', 
  stepIndicator,
  onBackClick,
  showLogo = true 
}: MobileNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
  }, [mobileMenuOpen]);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  if (variant === 'auth') {
    return (
      <header className="relative z-50 px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button 
            onClick={handleBackClick}
            className="p-3 rounded-full hover:bg-black/5 text-stone-600 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {stepIndicator && (
            <div className="text-xs sm:text-sm font-bold text-stone-400 tracking-widest">
              {stepIndicator}
            </div>
          )}
          
          {showLogo && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          )}
          
          {!stepIndicator && !showLogo && <div className="w-12" />}
        </div>
      </header>
    );
  }

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3 px-4 sm:py-4 sm:px-6' : 'py-6 px-4 sm:py-8 sm:px-8'
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
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
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
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
