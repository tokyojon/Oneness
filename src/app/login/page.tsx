'use client';

import dynamic from 'next/dynamic';
import { OnenessKingdomLogo } from "@/lib/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import MobileNavigation from '@/components/layout/mobile-navigation';

const LoginForm = dynamic(() => import("@/components/auth/login-form"), { ssr: false });

export default function LoginPage() {
    const loginImage = PlaceHolderImages.find(p => p.id === 'login-image');

    return (
        <div className="min-h-screen bg-[#F2EBE0] font-sans text-stone-800 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

            {/* Unified Mobile Navigation */}
            <MobileNavigation 
                variant="auth" 
                stepIndicator="ログイン"
                showLogo={true}
            />

            <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
                <div className="mx-auto grid w-full max-w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <OnenessKingdomLogo className="w-5 h-5" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold font-headline text-stone-800">おかえりなさい</h1>
                        <p className="text-balance text-stone-500">
                            アカウントにアクセスするには資格情報を入力してください
                        </p>
                    </div>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm">
                        アカウントをお持ちでないですか？{" "}
                        <Link href="/register" className="text-sky-600 font-bold hover:underline">
                            こちらで登録
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
