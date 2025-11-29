'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [router]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark antialiased pt-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0" 
             style={{ 
               backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQfxzIK5BKSB1LfXRWxCdyNt3CnQ4fuhSuE3qMlUGVeJIRMSEeOsYLzyRMzo7XFRDA7uFwHsFhjAPF1Lo0eEB3JsTf3mQsfxB82F6M3-HgFk7KgQ3RIdXRDNQ-bnOaCuHfijYpC1pV0e6xkHEo4-0S2L_xjvprZ8neqi3QkZBrGWdl3kMpA5clU1fOJh9pannAyjuaglwQiKyff_p5YRKuV7P4ZrMDpa8SktuyZEFsVomFKYpZoluHgCBzNBH0HqeqAlCdiHb80EM')" 
             }} />
        <div className="hero-gradient absolute bottom-0 left-0 w-full h-1/2 z-10"></div>
        <div className="relative z-20 px-4 pt-16 md:pt-24">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            ワンネスキングダムへようこそ
          </h2>
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            私たちの王国に参加する
          </p>
          <Button 
            className="mt-8 px-8 py-3 font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all transform bg-warm-primary text-white"
            asChild
          >
            <Link href="/register">今すぐ参加する</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24" id="features">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">私たちの世界：特徴と価値観</h2>
            <p className="text-lg text-text-light/80 dark:text-text-dark/80 max-w-3xl mx-auto">
              Oneness Kingdomは、ユニークな特徴と核となる価値観に基づいて構築されています。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start text-left">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-warm-primary/20">
                <span className="material-icons-outlined text-warm-primary" style={{ fontSize: '48px' }}>volunteer_activism</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-light dark:text-text-dark">恵みの経済</h3>
              <p className="text-base text-text-light/80 dark:text-text-dark/80 leading-relaxed">
                「恵みの経済」が機能する、繁栄と分かち合いの風景。
              </p>
            </div>
            <div className="p-8 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start text-left">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-warm-primary/20">
                <span className="material-icons-outlined text-warm-primary" style={{ fontSize: '48px' }}>school</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-light dark:text-text-dark">学びの環境</h3>
              <p className="text-base text-text-light/80 dark:text-text-dark/80 leading-relaxed">
                「教育と自己実現」を促進する学習環境。
              </p>
            </div>
            <div className="p-8 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start text-left">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-warm-primary/20">
                <span className="material-icons-outlined text-warm-primary" style={{ fontSize: '48px' }}>celebration</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-light dark:text-text-dark">多文化共生</h3>
              <p className="text-base text-text-light/80 dark:text-text-dark/80 leading-relaxed">
                活気に満ちた「多文化共生と祝祭」の瞬間。
              </p>
            </div>
            <div className="p-8 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-transparent flex flex-col items-start text-left bg-warm-primary/5">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-warm-primary/20">
                <span className="material-icons-outlined text-warm-primary" style={{ fontSize: '48px' }}>hub</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-warm-primary">ワンネス</h3>
              <p className="text-base text-text-light/80 dark:text-text-dark/80 leading-relaxed">
                私たちは、すべてが相互に関連していると信じています。私たちの行動は、コミュニティと地球全体に影響を与えます。
              </p>
            </div>
            <div className="p-8 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-transparent flex flex-col items-start text-left bg-warm-primary/5">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-warm-primary/20">
                <span className="material-icons-outlined text-warm-primary" style={{ fontSize: '48px' }}>verified_user</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-warm-primary">主権</h3>
              <p className="text-base text-text-light/80 dark:text-text-dark/80 leading-relaxed">
                個人のエンパワーメントと自己責任を尊重します。各メンバーは、自分の現実と私たちの共有世界の共同創造者です。
              </p>
            </div>
            <div className="p-8 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-transparent flex flex-col items-start text-left bg-warm-primary/5">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-warm-primary/20">
                <span className="material-icons-outlined text-warm-primary" style={{ fontSize: '48px' }}>handshake</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-warm-primary">リスペクト</h3>
              <p className="text-base text-text-light/80 dark:text-text-dark/80 leading-relaxed">
                私たちは、すべての声が重要である、敬意を持った対話の文化を育みます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 md:py-24 bg-warm-primary/5" id="journey">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">私たちの使命</h2>
            <p className="text-lg md:text-xl text-text-light/90 dark:text-text-dark/90 leading-relaxed">
              新しいパラダイムの共同創造者として、個人が主権を持ち、繁栄する世界を育むこと。私たちは、意識的なテクノロジー、恵みの経済、そして深い相互のつながりを通じて、これを達成します。
            </p>
          </div>
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-warm-primary">あなたの旅を始めましょう</h3>
            <p className="text-md text-text-light/80 dark:text-text-dark/80 max-w-2xl mx-auto">
              簡単な3つのステップで、Oneness Kingdomのメンバーになりましょう。
            </p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
            <div className="absolute top-8 left-0 w-full h-px" style={{ backgroundColor: '#D4A37320' }} hidden={true}></div>
            <div className="relative flex flex-col items-center text-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background-light dark:bg-background-dark text-2xl font-bold mb-6 shadow z-10 border-4 border-background-light dark:border-background-dark">
                <span className="material-icons-outlined text-terracotta" style={{ fontSize: '80px' }}>edit_note</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full text-white text-lg font-bold mb-4 -mt-10 relative z-20 bg-terracotta">1</div>
              <h4 className="text-xl font-semibold mb-2">アカウントを登録</h4>
              <p className="text-text-light/80 dark:text-text-dark/80">数分でプロフィールを作成し、あなたのユニークな旅を始めましょう。</p>
            </div>
            <div className="relative flex flex-col items-center text-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background-light dark:bg-background-dark text-2xl font-bold mb-6 shadow z-10 border-4 border-background-light dark:border-background-dark">
                <span className="material-icons-outlined text-olive" style={{ fontSize: '80px' }}>document_scanner</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full text-white text-lg font-bold mb-4 -mt-10 relative z-20 bg-olive">2</div>
              <h4 className="text-xl font-semibold mb-2">AIによる認証</h4>
              <p className="text-text-light/80 dark:text-text-dark/80">私たちの多様なプロジェクト、サークル、そしてメンバーを発見してください。</p>
            </div>
            <div className="relative flex flex-col items-center text-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background-light dark:bg-background-dark text-2xl font-bold mb-6 shadow z-10 border-4 border-background-light dark:border-background-dark">
                <span className="material-icons-outlined text-warm-primary" style={{ fontSize: '80px' }}>groups</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full text-white text-lg font-bold mb-4 -mt-10 relative z-20 bg-warm-primary">3</div>
              <h4 className="text-xl font-semibold mb-2">コミュニティに参加</h4>
              <p className="text-text-light/80 dark:text-text-dark/80">ディスカッションに参加し、イベントに参加し、あなたの才能を貢献してください。</p>
            </div>
          </div>
          <div className="text-center mt-20">
            <Button 
              className="px-10 py-4 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all transform bg-warm-primary text-white"
              asChild
            >
              <Link href="/register">今すぐ登録</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* OP System Section */}
      <section className="py-16 md:py-24 bg-warm-primary/10" id="op-system">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">OP System</h2>
            <p className="text-lg text-text-light/80 dark:text-text-dark/80">
              私たちのプラットフォームは、協力と個人の成長を促進するために設計された独自のオペレーティングシステムで動作しています。それは、私たちのコミュニティのバックボーンであり、私たちの価値観が行動に移される場所です。
            </p>
          </div>
          <div className="space-y-4">
            {[
              { id: 'basic', title: '基本情報', content: 'Oneness Point (OP) は、Oneness Kingdom 内の貢献と活動を評価するためのポイントシステムです。' },
              { 
                id: 'axes', 
                title: '7つの軸', 
                content: [
                  '経済：貢献と活動に応じたOPの獲得と利用',
                  '教育：学びと成長を通じたOPの獲得',
                  '健康：心身の健康活動への参加によるOPの獲得',
                  '環境：地球環境への貢献活動によるOPの獲得',
                  '社会：コミュニティへの貢献と協力によるOPの獲得',
                  '文化：芸術、創造活動、イベントへの参加によるOPの獲得',
                  '精神性：自己探求と精神的成長への貢献によるOPの獲得'
                ]
              },
              {
                id: 'activity',
                title: '基本活動ポイント',
                content: [
                  'ログイン：1日1回、10 OP',
                  '記事投稿：1投稿あたり、50 OP',
                  'コメント：1コメントあたり、5 OP',
                  'いいね：1いいねあたり、1 OP'
                ]
              },
              {
                id: 'family',
                title: '家族制度ポイント',
                content: [
                  '家族への貢献活動：内容に応じて変動',
                  '家族イベントへの参加：イベントごとに設定'
                ]
              },
              {
                id: 'community',
                title: 'コミュニティ制度',
                content: [
                  'プロジェクトへの参加・貢献：貢献度に応じて変動',
                  'イベントの主催・参加：イベントごとに設定'
                ]
              },
              {
                id: 'social',
                title: '社会貢献制度',
                content: [
                  'ボランティア活動：内容に応じて変動',
                  '寄付活動：寄付額に応じてOPを付与'
                ]
              },
              {
                id: 'title',
                title: '称号制度',
                content: '特定の条件をクリアすることで称号が付与され、ボーナスOPが獲得できます。例：キングダムビルダー、マスターヒーラー、アースキーパーなど'
              },
              {
                id: 'crypto',
                title: '仮想通貨交換ルール',
                content: [
                  'OPは、特定の条件下でOneness Kingdomが発行する仮想通貨と交換可能です。',
                  '交換レートは、コミュニティの成長と経済状況に応じて変動します。',
                  '詳細は後日発表されます。'
                ]
              }
            ].map((section) => (
              <div key={section.id} className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex justify-between items-center p-6 cursor-pointer w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="text-xl font-bold text-warm-primary">{section.title}</h3>
                  <span 
                    className="material-icons-outlined transition-transform duration-200"
                    style={{ 
                      color: '#D4A373',
                      transform: openSection === section.id ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  >
                    add
                  </span>
                </button>
                {openSection === section.id && (
                  <div className="p-6 pt-0 text-text-light/80 dark:text-text-dark/80">
                    {Array.isArray(section.content) ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {section.content.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{section.content}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-warm-primary">Oneness Kingdom</h3>
              <p className="text-text-light/60 dark:text-text-dark/60 mt-1">A new paradigm for a thriving world.</p>
            </div>
            <div className="flex space-x-6">
              <a className="text-text-light/80 dark:text-text-dark/80 hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="text-text-light/80 dark:text-text-dark/80 hover:text-primary transition-colors" href="#">Terms & Conditions</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-text-light/60 dark:text-text-dark/60">
            <p>© 2024 Oneness Kingdom. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(to top, rgba(254, 251, 246, 1) 0%, rgba(254, 251, 246, 0) 100%);
        }
        .dark .hero-gradient {
          background: linear-gradient(to top, rgba(28, 28, 28, 1) 0%, rgba(28, 28, 28, 0) 100%);
        }
      `}</style>
    </div>
  );
}
