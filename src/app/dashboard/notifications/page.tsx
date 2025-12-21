'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/lib/icons";

interface Notification {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/notifications', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                } else {
                    console.error('Failed to fetch notifications');
                    setNotifications([]);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const unreadNotifications = notifications.filter(n => !n.read);
    const earlierNotifications = notifications.filter(n => n.read);

    if (loading) {
        return (
            <div className="container mx-auto max-w-2xl py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">お知らせ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner className="h-8 w-8 animate-spin" />
                            <span className="ml-2 text-muted-foreground">読み込み中...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">お知らせ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {unreadNotifications.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">未読</h3>
                                {unreadNotifications.map(notification => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </div>
                        )}
                        {earlierNotifications.length > 0 && (
                             <div className="space-y-4">
                                <h3 className="text-lg font-semibold">既読</h3>
                                {earlierNotifications.map(notification => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
    return (
        <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
            <Avatar className="h-10 w-10">
                <AvatarFallback>N</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-sm">
                <p>{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
            </div>
            {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 flex-shrink-0" />}
        </div>
    );
};
