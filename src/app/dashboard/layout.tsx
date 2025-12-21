'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bell, Clapperboard, Compass, Home, Send, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
=======
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/lib/icons";
import AvatarSetupModal from "@/components/dashboard/AvatarSetupModal";

const SidebarLink = ({ href, icon: Icon, label, active = false }: { href: string, icon: React.ElementType, label: string, active?: boolean }) => (
    <Link href={href} className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-lg hover:bg-muted transition-colors",
        active ? "font-bold" : "text-muted-foreground"
    )}>
        <Icon className="h-6 w-6" />
        <span>{label}</span>
    </Link>
);

const LeftSidebar = () => {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data.profile);
                } else {
                    // Fallback to localStorage data
                    setUserProfile({
                        name: user?.profile?.display_name || 'ユーザー',
                        username: user?.email?.split('@')[0] || 'user',
                        avatarUrl: user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100",
                        op_balance: user?.points?.total || 0,
                    });
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                // Fallback to localStorage data
                setUserProfile({
                    name: user?.profile?.display_name || 'ユーザー',
                    username: user?.email?.split('@')[0] || 'user',
                    avatarUrl: user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100",
                    op_balance: user?.points?.total || 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);

    if (loading) {
        return (
            <aside className="hidden md:block sticky top-24 self-start space-y-4 w-[240px]">
                <div className="flex items-center gap-3 p-2">
                    <LoadingSpinner className="h-12 w-12 animate-spin" />
                    <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden md:block sticky top-24 self-start space-y-4 w-[240px]">
            <Link href="/dashboard/profile" className="flex items-center gap-3 p-2">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name} />
                    <AvatarFallback>{userProfile?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold">{userProfile?.name || 'ユーザー'}</p>
                    <p className="text-sm text-muted-foreground">@{userProfile?.username || 'user'}</p>
                </div>
            </Link>
            <p className="px-2 text-lg font-semibold">{(userProfile?.op_balance || 0).toLocaleString()} <span className="text-sm font-normal text-primary">OP</span></p>

            <nav className="space-y-1">
                <SidebarLink href="/dashboard" icon={Home} label="ホーム" active />
                <SidebarLink href="/dashboard/discover" icon={Compass} label="発見" />
                <SidebarLink href="/dashboard/reels" icon={Clapperboard} label="リール" />
                <SidebarLink href="/dashboard/marketplace" icon={ShoppingBag} label="マーケット" />
                <SidebarLink href="/exchange" icon={Send} label="OPを交換" />
                <SidebarLink href="/dashboard/notifications" icon={Bell} label="お知らせ" />
                <SidebarLink href="/dashboard/profile" icon={User} label="プロフィール" />
            </nav>
        </aside>
    );
};

const RightSidebar = () => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // In a real implementation, this would fetch from API
                // For now, we'll use empty array
                setSuggestions([]);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    if (loading) {
        return (
            <aside className="hidden lg:block sticky top-24 self-start space-y-6 w-[320px]">
                <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden lg:block sticky top-24 self-start space-y-6 w-[320px]">
            <Card>
                <CardHeader><h3 className="font-bold">フォローするかも</h3></CardHeader>
                <CardContent className="space-y-4">
                    {suggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">現在おすすめはありません</p>
                    ) : (
                        suggestions.map((sug: any) => (
                            <div key={sug.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link href="/dashboard/profile">
                                        <Avatar>
                                            <AvatarImage src={sug.avatarUrl} alt={sug.name} />
                                            <AvatarFallback>{sug.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div>
                                        <Link href="/dashboard/profile"><p className="font-semibold hover:underline">{sug.name}</p></Link>
                                        <p className="text-sm text-muted-foreground">@{sug.username}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">フォロー</Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </aside>
    );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { isLoggedIn, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not loading and not logged in, redirect to login
        if (!loading && !isLoggedIn) {
            router.replace('/login');
        }
    }, [isLoggedIn, loading, router]);
=======

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const guestUserId = localStorage.getItem('guest_user_id');
                const response = await fetch('/api/profile', {
                    headers: {
                        'x-guest-user-id': guestUserId || '',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data.profile);
                } else {
                    // Fallback to localStorage data
                    setUserProfile({
                        name: user?.profile?.display_name || 'ユーザー',
                        username: user?.email?.split('@')[0] || 'user',
                        avatarUrl: user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100",
                        op_balance: user?.points?.total || 0,
                    });
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                // Fallback to localStorage data
                setUserProfile({
                    name: user?.profile?.display_name || 'ユーザー',
                    username: user?.email?.split('@')[0] || 'user',
                    avatarUrl: user?.profile?.avatar_url || "https://picsum.photos/seed/user1/100/100",
                    op_balance: user?.points?.total || 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);

    if (loading) {
        return (
            <aside className="hidden md:block sticky top-24 self-start space-y-4 w-[240px]">
                <div className="flex items-center gap-3 p-2">
                    <LoadingSpinner className="h-12 w-12 animate-spin" />
                    <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden md:block sticky top-24 self-start space-y-4 w-[240px]">
            <Link href="/dashboard/profile" className="flex items-center gap-3 p-2">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name} />
                    <AvatarFallback>{userProfile?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold">{userProfile?.name || 'ユーザー'}</p>
                    <p className="text-sm text-muted-foreground">@{userProfile?.username || 'user'}</p>
                </div>
            </Link>
            <p className="px-2 text-lg font-semibold">{(userProfile?.op_balance || 0).toLocaleString()} <span className="text-sm font-normal text-primary">OP</span></p>

            <nav className="space-y-1">
                <SidebarLink href="/dashboard" icon={Home} label="ホーム" active />
                <SidebarLink href="/dashboard/discover" icon={Compass} label="発見" />
                <SidebarLink href="/dashboard/reels" icon={Clapperboard} label="リール" />
                <SidebarLink href="/dashboard/marketplace" icon={ShoppingBag} label="マーケット" />
                <SidebarLink href="/exchange" icon={Send} label="OPを交換" />
                <SidebarLink href="/dashboard/notifications" icon={Bell} label="お知らせ" />
                <SidebarLink href="/dashboard/profile" icon={User} label="プロフィール" />
            </nav>
        </aside>
    );
};

const RightSidebar = () => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // In a real implementation, this would fetch from API
                // For now, we'll use empty array
                setSuggestions([]);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    if (loading) {
        return (
            <aside className="hidden lg:block sticky top-24 self-start space-y-6 w-[320px]">
                <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden lg:block sticky top-24 self-start space-y-6 w-[320px]">
            <Card>
                <CardHeader><h3 className="font-bold">フォローするかも</h3></CardHeader>
                <CardContent className="space-y-4">
                    {suggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">現在おすすめはありません</p>
                    ) : (
                        suggestions.map((sug: any) => (
                            <div key={sug.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link href="/dashboard/profile">
                                        <Avatar>
                                            <AvatarImage src={sug.avatarUrl} alt={sug.name} />
                                            <AvatarFallback>{sug.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div>
                                        <Link href="/dashboard/profile"><p className="font-semibold hover:underline">{sug.name}</p></Link>
                                        <p className="text-sm text-muted-foreground">@{sug.username}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">フォロー</Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </aside>
    );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { loading } = useAuth();
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner className="h-8 w-8" />
            </div>
        );
    }
<<<<<<< HEAD

    // If not logged in, don't render anything (redirect will happen)
    if (!isLoggedIn) {
        return null;
    }
=======
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 py-8">
                <LeftSidebar />
                <main>
                    {children}
                </main>
            </div>
            <AvatarSetupModal />
        </div>
    )
}
