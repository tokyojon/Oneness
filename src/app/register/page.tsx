'use client';

import dynamic from 'next/dynamic';
import { OnenessKingdomLogo } from "@/lib/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

const RegisterForm = dynamic(() => import("@/components/auth/register-form"), { ssr: false });

export default function RegisterPage() {
    const registerImage = PlaceHolderImages.find(p => p.id === 'register-image');

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-md gap-6">
                    <div className="grid gap-2 text-center">
                        <Link href="/" className="flex justify-center items-center gap-2 mb-4">
                            <OnenessKingdomLogo className="h-10 w-10" />
                        </Link>
                        <h1 className="text-3xl font-bold font-headline">王国に参加する</h1>
                        <p className="text-balance text-muted-foreground">
                            アカウントを作成して、調和への旅を始めましょう。
                        </p>
                    </div>
                    <RegisterForm />
                    <div className="mt-4 text-center text-sm">
                        すでにアカウントをお持ちですか？{" "}
                        <Link href="/login" className="underline hover:text-primary">
                            こちらでログイン
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative">
                {registerImage && (
                    <Image
                        src={registerImage.imageUrl}
                        alt={registerImage.description}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={registerImage.imageHint}
                    />
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
        </div>
    );
}
