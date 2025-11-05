'use client';

import dynamic from 'next/dynamic';
import { OnenessKingdomLogo } from "@/lib/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

const AgeVerifier = dynamic(() => import("@/components/verify/age-verifier"), { ssr: false });

export default function VerifyAgePage() {
    const verifyImage = PlaceHolderImages.find(p => p.id === 'verify-image');

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-md gap-6">
                    <div className="grid gap-2 text-center">
                        <Link href="/" className="flex justify-center items-center gap-2 mb-4">
                            <OnenessKingdomLogo className="h-10 w-10" />
                        </Link>
                        <h1 className="text-3xl font-bold font-headline">自動年齢確認</h1>
                        <p className="text-balance text-muted-foreground">
                            政府発行の書類をアップロードして、AIを使用して自動的に年齢を確認します。
                        </p>
                    </div>
                    <AgeVerifier />
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative">
                {verifyImage && (
                    <Image
                        src={verifyImage.imageUrl}
                        alt={verifyImage.description}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={verifyImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
        </div>
    );
}
