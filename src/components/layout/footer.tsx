'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return null;

  return (
    <footer className="py-12 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-warm-primary">Oneness Kingdom (UAE)</h3>
            <p className="text-text-light/60 dark:text-text-dark/60 mt-1">A new paradigm for a thriving world.</p>
          </div>
          <div className="flex space-x-6">
            <Link className="text-text-light/80 dark:text-text-dark/80 hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-text-light/80 dark:text-text-dark/80 hover:text-primary transition-colors" href="/terms">Terms & Conditions</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-text-light/60 dark:text-text-dark/60">
          <p>© {new Date().getFullYear()} Oneness Kingdom (UAE). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
