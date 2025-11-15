'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPostsSection } from '@/components/LandingPostsSection';

export default function Home() {
  const router = useRouter();

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

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">特徴</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              ワンネスキングダムが提供する価値や体験を、わかりやすくご紹介します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <FeatureCard
              title="貢献とつながり"
              description="あなたの愛、学び、貢献の行動は、私たちのコミュニティ内で価値として視覚化され、循環します。"
              image={feature1Image}
              details={[
                '• 行動がポイントに変換され、王国経済に参加',
                '• 貢献が可視化され、コミュニティから評価',
                '• 持続可能な価値循環システム',
              ]}
            />
            <FeatureCard
              title="ヒューマンネットワークの構築"
              description="フォロー、評価、推薦を通じて有意義な関係を築き、デジタルな家族の絆さえも形成します。"
              image={feature2Image}
              details={[
                '• AI支援のマッチングシステム',
                '• 信頼スコアに基づく推薦',
                '• グローバルなつながり',
              ]}
            />
            <FeatureCard
              title="AIを活用したコミュニティ"
              description="私たちのプラットフォームは、公正なマッチング、推薦、そして私たちの王国の安全と調和を確保するためにAIを使用しています。"
              image={feature3Image}
              details={[
                '• 不正行為の自動検出',
                '• パーソナライズされた推薦',
                '• コミュニティガイドラインの自動執行',
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
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">ワンネスキングダムの始め方</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              シンプルな3つのステップで、あなたの旅がスタートします。
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
            <Step
              step="1"
              title="アカウントを登録"
              description="あなたのプロフィールを作成し、ワンネスへの旅を始めましょう。"
              details={[
                'メールアドレスで簡単登録',
                'プロフィール設定',
                '初期ポイント付与',
              ]}
            />
            <Step
              step="2"
              title="AIによる認証"
              description="高度なAI強化認証プロセスであなたの身元を保護します。"
              details={[
                '顔認証による本人確認',
                '行動パターン分析',
                '継続的な信頼度評価',
              ]}
            />
            <Step
              step="3"
              title="コミュニティに参加"
              description="貢献し、つながり、私たちの王国の成長に参加しましょう。"
              details={[
                '投稿と交流',
                'ポイント獲得',
                '経済活動への参加',
              ]}
            />
          </div>

          <div className="max-w-2xl mx-auto bg-background p-6 rounded-lg text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">始める準備はできましたか？</h3>
            <Button asChild size="lg" className="mx-auto">
              <Link href="/register">今すぐ登録</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">
              愛と貢献のメタソーシャルプラットフォーム
            </h2>
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
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">🪙 OP制度</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              愛・平和・調和・貢献を基準に、会員が提供・共有・成長を通してポイント（価値）を循環させる仕組みです。
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            <div className="rounded-lg border bg-card text-card-foreground shadow-xl">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="font-semibold tracking-tight text-2xl font-headline">基本理念</div>
              </div>
              <div className="p-6 pt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">💱 基本情報</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>通貨名:</strong> OP</li>
                      <li>• <strong>換算レート:</strong> 1 OP = 100円</li>
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
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="font-semibold tracking-tight text-xl font-headline">🎯 基本活動ポイント</div>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">提供登録（AI審査通過）</span>
                      <span className="font-semibold text-primary">+1 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">紹介成功</span>
                      <span className="font-semibold text-primary">+1 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">会員同士が繋がる</span>
                      <span className="font-semibold text-primary">+1 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">寄付を行う</span>
                      <span className="font-semibold text-primary">+1 OP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="font-semibold tracking-tight text-xl font-headline">❤️ 家族制度ポイント</div>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">夫・妻になる</span>
                      <span className="font-semibold text-primary">+10 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100 border-2 border-amber-300">
                      <span className="text-sm">夫婦になる</span>
                      <span className="font-semibold text-amber-700">+200 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">子供になる</span>
                      <span className="font-semibold text-primary">+10 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">兄弟・姉妹になる</span>
                      <span className="font-semibold text-primary">+10 OP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="font-semibold tracking-tight text-xl font-headline">🌟 コミュニティ制度</div>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">コミュニティ世話役</span>
                      <span className="font-semibold text-primary">+10 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">コミュニティ参加</span>
                      <span className="font-semibold text-primary">+10 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">コミュニティに寄付</span>
                      <span className="font-semibold text-primary">+10 OP〜</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                      <span className="text-sm">コミュニティ招待</span>
                      <span className="font-semibold text-primary">+1 OP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="font-semibold tracking-tight text-xl font-headline">🏆 社会貢献制度</div>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100 border-2 border-amber-300">
                      <span className="text-sm">教育者になる</span>
                      <span className="font-semibold text-amber-700">+200 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100 border-2 border-amber-300">
                      <span className="text-sm">生産者になる</span>
                      <span className="font-semibold text-amber-700">+200 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100 border-2 border-amber-300">
                      <span className="text-sm">仲介役</span>
                      <span className="font-semibold text-amber-700">+200 OP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100 border-2 border-amber-300">
                      <span className="text-sm">平和維持セキュリティ役</span>
                      <span className="font-semibold text-amber-700">+200 OP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border text-card-foreground shadow-xl bg-gradient-to-br from-amber-100 to-yellow-100">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="font-semibold tracking-tight text-2xl font-headline">👑 称号制度</div>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground mb-4">
                  貢献度と累計ポイントにより称号を自動認定します。各7軸（愛・知恵・公正・力・超能力・治療・審判）に対して3段階の称号があります。
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-md border-2 border-amber-200">
                    <h4 className="font-headline text-xl font-bold mb-2">賢者</h4>
                    <p className="text-primary font-semibold mb-1">1,000 OP</p>
                    <p className="text-sm text-muted-foreground">各軸の賢者として認定</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border-2 border-amber-200">
                    <h4 className="font-headline text-xl font-bold mb-2">君</h4>
                    <p className="text-primary font-semibold mb-1">10,000 OP</p>
                    <p className="text-sm text-muted-foreground">各軸の君として認定</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border-2 border-amber-200">
                    <h4 className="font-headline text-xl font-bold mb-2">王様</h4>
                    <p className="text-primary font-semibold mb-1">100,000 OP</p>
                    <p className="text-sm text-muted-foreground">各軸の王様として認定</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-amber-300">
                  <p className="font-semibold text-center text-lg">🌟 最高称号: 王様の王様 - 1,000,000 OP 🌟</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-xl">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="font-semibold tracking-tight text-2xl font-headline">💱 仮想通貨交換ルール</div>
              </div>
              <div className="p-6 pt-0">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>交換上限:</strong> 月1回、保有OPの最大33％まで</li>
                  <li>• <strong>対象者:</strong> 7軸いずれかの称号者（賢者以上）</li>
                  <li>• <strong>交換可能通貨:</strong> ビットコイン等（王国指定）</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingPostsSection />
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
