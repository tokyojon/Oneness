'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OnenessKingdomLogo } from '@/lib/icons';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const isTransparent = pathname === '/';

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-colors duration-300",
      isTransparent ? "bg-transparent text-white" : "bg-background/80 text-foreground backdrop-blur-sm border-b"
      )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
          <OnenessKingdomLogo className="w-8 h-8" />
          <span>ワンネスキングダム</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild className={cn(isTransparent && "hover:bg-white/10")}>
            <Link href="/login">ログイン</Link>
          </Button>
          <Button asChild className={cn(isTransparent ? "bg-white/90 text-black hover:bg-white" : "bg-primary text-primary-foreground")}>
            <Link href="/register">登録</Link>
          </Button>
          <Button variant="outline" asChild className={cn(isTransparent && "border-white/80 text-white hover:bg-white/10")}>
            <Link href="/verify-age">年齢確認</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
