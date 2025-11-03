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
              <p className="text-xl font-bold font-headline">Oneness Kingdom</p>
              <p className="text-sm text-muted-foreground">Building a world of love, peace, and harmony.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-4">
          <p>&copy; {new Date().getFullYear()} Oneness Kingdom. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
