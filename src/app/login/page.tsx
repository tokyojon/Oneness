'use client';

import dynamic from 'next/dynamic';
import { OnenessKingdomLogo } from "@/lib/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

const LoginForm = dynamic(() => import("@/components/auth/login-form"), { ssr: false });

export default function LoginPage() {
    const loginImage = PlaceHolderImages.find(p => p.id === 'login-image');

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <Link href="/" className="flex justify-center items-center gap-2 mb-4">
                            <OnenessKingdomLogo className="h-10 w-10" />
                        </Link>
                        <h1 className="text-3xl font-bold font-headline">おかえりなさい</h1>
                        <p className="text-balance text-muted-foreground">
                            アカウントにアクセスするには資格情報を入力してください
                        </p>
                    </div>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm">
                        アカウントをお持ちでないですか？{" "}
                        <Link href="/register" className="underline hover:text-primary">
                            こちらで登録
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative">
                {loginImage && (
                    <Image
                        src={loginImage.imageUrl}
                        alt={loginImage.description}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={loginImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
        </div>
    );
}
