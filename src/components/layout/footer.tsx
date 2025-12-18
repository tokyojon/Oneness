import Link from 'next/link';
import { OnenessKingdomLogo } from '@/lib/icons';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <OnenessKingdomLogo className="w-10 h-10" />
            <div>
              <p className="text-xl font-bold font-headline">ワンネスキングダム</p>
              <p className="text-sm text-muted-foreground">愛と平和と調和の世界を築く。</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="hover:text-primary transition-colors">プライバシーポリシー</Link>
            <Link href="#" className="hover:text-primary transition-colors">利用規約</Link>
            <Link href="#" className="hover:text-primary transition-colors">お問い合わせ</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-4">
          <p>&copy; {new Date().getFullYear()} ワンネスキングダム. 無断複写・転載を禁じます。</p>
        </div>
      </div>
    </footer>
  );
}
