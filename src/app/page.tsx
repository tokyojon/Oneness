
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simulate checking if the user is logged in.
    // In a real app, you'd use a proper auth state manager.
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [router]);


  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const feature1Image = PlaceHolderImages.find(p => p.id === 'feature-1');
  const feature2Image = PlaceHolderImages.find(p => p.id === 'feature-2');
  const feature3Image = PlaceHolderImages.find(p => p.id === 'feature-3');

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
            ワンネスキングダムへようこそ
          </h1>
          <p className="text-lg md:text-2xl text-primary-foreground/90 mb-8">
            貢献、つながり、愛、平和、そして調和に基づく新しいソーシャルモデル。
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105">
            <Link href="/register">私たちの王国に参加する</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">愛と貢献のメタソーシャルプラットフォーム</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              私たちは、価値が経済力や軍事力ではなく、愛とつながりによって定義される新しい国際コミュニティ国家を構築しています。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="貢献とつながり"
              description="あなたの愛、学び、貢献の行動は、私たちのコミュニティ内で価値として視覚化され、循環します。"
              image={feature1Image}
            />
            <FeatureCard
              title="ヒューマンネットワークの構築"
              description="フォロー、評価、推薦を通じて有意義な関係を築き、デジタルな家族の絆さえも形成します。"
              image={feature2Image}
            />
            <FeatureCard
              title="AIを活用したコミュニティ"
              description="私たちのプラットフォームは、公正なマッチング、推薦、そして私たちの王国の安全と調和を確保するためにAIを使用しています。"
              image={feature3Image}
            />
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">市民になる方法</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ワンネスキングダムでの旅を始めるには、これらの簡単な手順に従ってください。
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Step
              step="1"
              title="アカウントを登録"
              description="あなたのプロフィールを作成し、ワンネスへの旅を始めましょう。"
            />
            <Step
              step="2"
              title="AIによる認証"
              description="高度なAI強化認証プロセスであなたの身元を保護します。"
            />
            <Step
              step="3"
              title="貢献し、繁栄する"
              description="コミュニティと関わり、あなたの才能を分かち合い、王国の中で成長してください。"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">世界を変える準備はできていますか？</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                愛、平和、調和の基盤の上に築かれた社会を創造することに専念する世界的な運動に参加してください。あなたの旅は今始まります。
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105">
                <Link href="/register">あなたの旅を始める</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}

const FeatureCard = ({ title, description, image }: { title: string; description: string; image?: { imageUrl: string; description: string; imageHint: string } }) => (
  <Card className="text-center bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2">
    <CardHeader className="items-center">
      {image && (
        <div className="relative w-full h-40 mb-4 rounded-t-lg overflow-hidden">
          <Image src={image.imageUrl} alt={image.description} layout="fill" objectFit="cover" data-ai-hint={image.imageHint} />
        </div>
      )}
      <CardTitle className="font-headline text-2xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Step = ({ step, title, description }: { step: string; title: string; description: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-4 border-background shadow-lg">
      {step}
    </div>
    <h3 className="text-xl font-headline font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
