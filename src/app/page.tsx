'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [router]);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const feature1Image = PlaceHolderImages.find(p => p.id === 'feature-1');
  const feature2Image = PlaceHolderImages.find(p => p.id === 'feature-2');
  const feature3Image = PlaceHolderImages.find(p => p.id === 'feature-3');
  const feature4Image = PlaceHolderImages.find(p => p.id === 'feature-4');

  const tabVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.16, 1, 0.3, 1] 
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full h-[50vh] md:h-[60vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
          />
        )}
      </section>

      {/* Hero Text Content */}
      <section className="w-full bg-background py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
            ワンネスキングダムへようこそ
          </h1>
          <Button 
            asChild 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105"
          >
            <Link href="/register">私たちの王国に参加する</Link>
          </Button>
        </div>
      </section>

      {/* Enhanced Tabbed Content */}
      <section className="w-full py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="features">特徴</TabsTrigger>
              <TabsTrigger value="how-it-works">使い方</TabsTrigger>
              <TabsTrigger value="about">私たちについて</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <TabsContent value="features" className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                      title="貢献とつながり"
                      description="あなたの愛、学び、貢献の行動は、私たちのコミュニティ内で価値として視覚化され、循環します。"
                      image={feature1Image}
                      details={[
                        "• 行動がポイントに変換され、王国経済に参加",
                        "• 貢献が可視化され、コミュニティから評価",
                        "• 持続可能な価値循環システム"
                      ]}
                    />
                    <FeatureCard
                      title="ヒューマンネットワークの構築"
                      description="フォロー、評価、推薦を通じて有意義な関係を築き、デジタルな家族の絆さえも形成します。"
                      image={feature2Image}
                      details={[
                        "• AI支援のマッチングシステム",
                        "• 信頼スコアに基づく推薦",
                        "• グローバルなつながり"
                      ]}
                    />
                    <FeatureCard
                      title="AIを活用したコミュニティ"
                      description="私たちのプラットフォームは、公正なマッチング、推薦、そして私たちの王国の安全と調和を確保するためにAIを使用しています。"
                      image={feature3Image}
                      details={[
                        "• 不正行為の自動検出",
                        "• パーソナライズされた推薦",
                        "• コミュニティガイドラインの自動執行"
                      ]}
                    />
                    <FeatureCard
                      title="ポイントシステム"
                      description="貢献が報われる透明な経済システム"
                      image={feature4Image || feature1Image}
                      details={[
                        "• 行動がポイントに変換",
                        "• チップや寄付に利用",
                        "• コミュニティ内で交換可能"
                      ]}
                    />
                  </div>
                  
                  <div className="max-w-4xl mx-auto bg-muted/50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">ワンネス王国の価値観</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-background p-4 rounded">
                        <h4 className="font-medium mb-2">愛</h4>
                        <p className="text-sm text-muted-foreground">すべての行動の基盤となる無条件の愛</p>
                      </div>
                      <div className="bg-background p-4 rounded">
                        <h4 className="font-medium mb-2">平和</h4>
                        <p className="text-sm text-muted-foreground">対話と理解を通じた調和の促進</p>
                      </div>
                      <div className="bg-background p-4 rounded">
                        <h4 className="font-medium mb-2">持続可能性</h4>
                        <p className="text-sm text-muted-foreground">長期的な繁栄を考慮したシステム設計</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="how-it-works" className="space-y-12">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <Step
                      step="1"
                      title="アカウントを登録"
                      description="あなたのプロフィールを作成し、ワンネスへの旅を始めましょう。"
                      details={[
                        "メールアドレスで簡単登録",
                        "プロフィール設定",
                        "初期ポイント付与"
                      ]}
                    />
                    <Step
                      step="2"
                      title="AIによる認証"
                      description="高度なAI強化認証プロセスであなたの身元を保護します。"
                      details={[
                        "顔認証による本人確認",
                        "行動パターン分析",
                        "継続的な信頼度評価"
                      ]}
                    />
                    <Step
                      step="3"
                      title="コミュニティに参加"
                      description="貢献し、つながり、私たちの王国の成長に参加しましょう。"
                      details={[
                        "投稿と交流",
                        "ポイント獲得",
                        "経済活動への参加"
                      ]}
                    />
                  </div>
                  
                  <div className="max-w-2xl mx-auto bg-muted/50 p-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold mb-4">始める準備はできましたか？</h3>
                    <Button asChild size="lg" className="mx-auto">
                      <Link href="/register">今すぐ登録</Link>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="space-y-12">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">愛と貢献のメタソーシャルプラットフォーム</h2>
                    <div className="space-y-6">
                      <p className="text-lg text-muted-foreground">
                        私たちは、価値が経済力や軍事力ではなく、愛とつながりによって定義される新しい国際コミュニティ国家を構築しています。
                      </p>
                      
                      <div className="bg-muted/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">私たちの使命</h3>
                        <ul className="space-y-3 list-disc pl-5">
                          <li>デジタル空間に調和のとれた王国を創造する</li>
                          <li>個人の貢献を可視化し、正当に評価する</li>
                          <li>AIを活用した公平なコミュニティ運営</li>
                          <li>国境を越えた真のつながりを促進</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-muted/50 p-6 rounded-lg">
                          <h3 className="text-xl font-semibold mb-4">創設者</h3>
                          <p className="text-muted-foreground">
                            ワンネスキングダムは、テクノロジーとスピリチュアリティの融合を信じるグローバルチームによって設立されました。
                          </p>
                        </div>
                        <div className="bg-muted/50 p-6 rounded-lg">
                          <h3 className="text-xl font-semibold mb-4">技術基盤</h3>
                          <p className="text-muted-foreground">
                            ブロックチェーン、AI、クラウド技術を組み合わせ、透明性と安全性を確保しています。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

const FeatureCard = ({ title, description, image, details }: { title: string; description: string; image?: { imageUrl: string; description: string; imageHint: string }; details?: string[] }) => (
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
      {details && (
        <ul className="space-y-2 list-disc pl-5 mt-4">
          {details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

const Step = ({ step, title, description, details }: { step: string; title: string; description: string; details?: string[] }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-4 border-background shadow-lg">
      {step}
    </div>
    <h3 className="text-xl font-headline font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
    {details && (
      <ul className="space-y-2 list-disc pl-5 mt-4">
        {details.map((detail, index) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>
    )}
  </div>
);
