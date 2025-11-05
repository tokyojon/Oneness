'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bell, Clapperboard, Compass, Home, Send, User } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

const userProfile = {
    name: "愛 平和 (Ai Heiwa)",
    username: "ai_heiwa",
    avatarUrl: "https://picsum.photos/seed/user1/100/100",
    op_balance: 12500,
};

const SidebarLink = ({ href, icon: Icon, label, active = false }: { href: string, icon: React.ElementType, label: string, active?: boolean }) => (
    <Link href={href} className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-lg hover:bg-muted transition-colors",
        active ? "font-bold" : "text-muted-foreground"
    )}>
        <Icon className="h-6 w-6" />
        <span>{label}</span>
    </Link>
);


const LeftSidebar = () => (
    <aside className="hidden md:block sticky top-24 self-start space-y-4 w-[240px]">
        <Link href="/dashboard/profile" className="flex items-center gap-3 p-2">
             <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold">{userProfile.name}</p>
                <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
            </div>
        </Link>
        <p className="px-2 text-lg font-semibold">{userProfile.op_balance.toLocaleString()} <span className="text-sm font-normal text-primary">OP</span></p>

        <nav className="space-y-1">
            <SidebarLink href="/dashboard" icon={Home} label="ホーム" active />
            <SidebarLink href="/dashboard/discover" icon={Compass} label="発見" />
            <SidebarLink href="/dashboard/reels" icon={Clapperboard} label="リール" />
            <SidebarLink href="/exchange" icon={Send} label="OPを交換" />
            <SidebarLink href="/dashboard/notifications" icon={Bell} label="お知らせ" />
            <SidebarLink href="/dashboard/profile" icon={User} label="プロフィール" />
        </nav>
    </aside>
);

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            router.replace('/');
        }
    }, [router]);

    return (
        <div className="bg-background text-foreground min-h-screen">
             <div className="container mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_320px] gap-8 py-8">
                <LeftSidebar />
                <main>
                    {children}
                </main>
             </div>
        </div>
    )
}
