
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

      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">🪙 ワンネスポイント制度</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              愛・平和・調和・貢献を基準に、会員が提供・共有・成長を通してポイント（価値）を循環させる仕組みです。
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">基本理念</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">💱 基本情報</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>通貨名:</strong> ワンネスポイント（WP）</li>
                      <li>• <strong>換算レート:</strong> 1 WP = 100円</li>
                      <li>• <strong>会員登録:</strong> 無料</li>
                      <li>• <strong>最終目標:</strong> 「王様の王様」= 真のワンネス達成者</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">✨ 7つの軸</h3>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div className="bg-amber-100 p-2 rounded">愛</div>
                      <div className="bg-blue-100 p-2 rounded">知恵</div>
                      <div className="bg-green-100 p-2 rounded">公正</div>
                      <div className="bg-red-100 p-2 rounded">力</div>
                      <div className="bg-purple-100 p-2 rounded">超能力</div>
                      <div className="bg-pink-100 p-2 rounded">治療</div>
                      <div className="bg-indigo-100 p-2 rounded col-span-2 text-center">審判</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">🎯 基本活動ポイント</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <PointItem action="提供登録（AI審査通過）" points="+1 WP" />
                    <PointItem action="紹介成功" points="+1 WP" />
                    <PointItem action="会員同士が繋がる" points="+1 WP" />
                    <PointItem action="寄付を行う" points="+1 WP" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">❤️ 家族制度ポイント</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <PointItem action="夫・妻になる" points="+10 WP" />
                    <PointItem action="夫婦になる" points="+200 WP" variant="highlight" />
                    <PointItem action="子供になる" points="+10 WP" />
                    <PointItem action="兄弟・姉妹になる" points="+10 WP" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">🌟 コミュニティ制度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <PointItem action="コミュニティ世話役" points="+10 WP" />
                    <PointItem action="コミュニティ参加" points="+10 WP" />
                    <PointItem action="コミュニティに寄付" points="+10 WP〜" />
                    <PointItem action="コミュニティ招待" points="+1 WP" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">🏆 社会貢献制度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <PointItem action="教育者になる" points="+200 WP" variant="highlight" />
                    <PointItem action="生産者になる" points="+200 WP" variant="highlight" />
                    <PointItem action="仲介役" points="+200 WP" variant="highlight" />
                    <PointItem action="平和維持セキュリティ役" points="+200 WP" variant="highlight" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-xl bg-gradient-to-br from-amber-100 to-yellow-100">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">👑 称号制度</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  貢献度と累計ポイントにより称号を自動認定します。各7軸（愛・知恵・公正・力・超能力・治療・審判）に対して3段階の称号があります。
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <TitleCard title="賢者" requirement="1,000 WP" description="各軸の賢者として認定" />
                  <TitleCard title="君" requirement="10,000 WP" description="各軸の君として認定" />
                  <TitleCard title="王様" requirement="100,000 WP" description="各軸の王様として認定" />
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-amber-300">
                  <p className="font-semibold text-center text-lg">
                    🌟 最高称号: 王様の王様 - 1,000,000 WP 🌟
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">💱 仮想通貨交換ルール</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>交換上限:</strong> 月1回、保有WPの最大33％まで</li>
                  <li>• <strong>対象者:</strong> 7軸いずれかの称号者（賢者以上）</li>
                  <li>• <strong>交換可能通貨:</strong> ビットコイン等（王国指定）</li>
                </ul>
              </CardContent>
            </Card>
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

const PointItem = ({ action, points, variant }: { action: string; points: string; variant?: 'highlight' }) => (
  <div className={`flex justify-between items-center p-3 rounded-lg ${variant === 'highlight' ? 'bg-amber-100 border-2 border-amber-300' : 'bg-secondary'}`}>
    <span className="text-sm">{action}</span>
    <span className={`font-semibold ${variant === 'highlight' ? 'text-amber-700' : 'text-primary'}`}>{points}</span>
  </div>
);

const TitleCard = ({ title, requirement, description }: { title: string; requirement: string; description: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border-2 border-amber-200">
    <h4 className="font-headline text-xl font-bold mb-2">{title}</h4>
    <p className="text-primary font-semibold mb-1">{requirement}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
