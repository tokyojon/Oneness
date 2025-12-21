import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { FloatingVoiceChat } from '@/components/voice-chat/FloatingVoiceChat';
import { LanguageProvider } from '@/components/providers/LanguageProvider';

export const metadata: Metadata = {
  title: 'ワンネスキングダム',
  description:
    '愛、平和、調和を基盤としたメタソーシャルプラットフォームであり、貢献とつながりに基づく新しい国際コミュニティを創造します。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            {/* The footer is removed from the main layout for dashboard view */}
          </div>
          <Toaster />
          <FloatingVoiceChat position="bottom-right" size="medium" />
        </LanguageProvider>
      </body>
    </html>
  );
}
