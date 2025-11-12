'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OnenessKingdomLogo } from '@/lib/icons';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Search, MessageSquare, Bell, Wallet } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { logoutAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const { isLoggedIn, user } = useAuth();
  const isDashboard = pathname.startsWith('/dashboard');

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      // Clear client-side authentication data
      logout();
      console.log('Client-side logout completed');
      
      // Call server action for any server-side cleanup
      const result = await logoutAction();
      console.log('Server action result:', result);
      
      if (result.success) {
        toast({
          title: 'ログアウト成功',
          description: result.message,
        });
        // Force a page refresh to update navbar state
        router.push('/');
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'ログアウトエラー',
          description: 'ログアウトに失敗しました。',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'ログアウトエラー',
        description: 'ログアウト中にエラーが発生しました。',
      });
    }
  };

  if (isDashboard || isLoggedIn) {
    return (
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg font-headline">
            <OnenessKingdomLogo className="w-8 h-8" />
            <span className="hidden sm:inline">ワンネスキングダム</span>
          </Link>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="検索..." className="pl-10" />
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
              <Link href="/dashboard/wallet">
                <Wallet className="h-6 w-6" />
                <span className="sr-only">ウォレット</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
              <Link href="/dashboard/notifications">
                <MessageSquare className="h-6 w-6" />
                <span className="sr-only">メッセージ</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
              <Link href="/dashboard/notifications">
                <Bell className="h-6 w-6" />
                <span className="sr-only">お知らせ</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100"} alt="User" />
                    <AvatarFallback>{user?.profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.profile?.display_name || 'ユーザー'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                    {user?.points && (
                      <p className="text-xs leading-none text-primary font-semibold">
                        🪙 {user.points.total} OP
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/wallet">🪙 ウォレット</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/profile">プロフィール</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/settings">設定</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>ログアウト</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </nav>
        </div>
      </header>
    );
  }

  // Original Header for landing pages
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
            <Link href="/exchange">両替</Link>
          </Button>
          <Button variant="ghost" asChild className={cn(isTransparent && "hover:bg-white/10")}>
            <Link href="/login">ログイン</Link>
          </Button>
          <Button asChild className={cn(isTransparent ? "bg-white/90 text-black hover:bg-white" : "bg-primary text-primary-foreground")}>
            <Link href="/register">登録</Link>
          </Button>
          </nav>
      </div>
    </header>
  );
}
