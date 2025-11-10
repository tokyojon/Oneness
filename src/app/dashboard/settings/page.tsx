import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";


const userProfile = {
    name: "愛 平和 (Ai Heiwa)",
    username: "ai_heiwa",
    email: "citizen@oneness.kingdom",
    avatarUrl: "https://picsum.photos/seed/user1/200/200",
    bio: "愛と平和と調和のメタソーシャルプラットフォーム、ワンネスキングダムの市民。貢献とつながりを大切にしています。 #ワンネス #平和 #貢献",
};

export default function SettingsPage() {
    return (
        <div className="container mx-auto max-w-4xl py-8">
            <h1 className="text-2xl font-headline mb-6">設定</h1>
            <div className="grid gap-8 md:grid-cols-[180px_1fr]">
                <nav className="grid gap-1 text-muted-foreground">
                    <Link href="#profile" className="font-semibold text-primary">プロフィール編集</Link>
                    <Link href="#account" className="hover:text-foreground">アカウント</Link>
                    <Link href="#notifications" className="hover:text-foreground">通知</Link>
                    <Link href="#privacy" className="hover:text-foreground">プライバシー</Link>
                </nav>
                <div className="grid gap-6">

                    {/* Profile Section */}
                    <Card id="profile">
                        <CardHeader>
                            <CardTitle>プロフィール編集</CardTitle>
                            <CardDescription>公開プロフィール情報を更新します。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={userProfile.avatarUrl} />
                                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">画像を変更</Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">氏名</Label>
                                <Input id="name" defaultValue={userProfile.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">ユーザーネーム</Label>
                                <Input id="username" defaultValue={userProfile.username} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">自己紹介</Label>
                                <Textarea id="bio" defaultValue={userProfile.bio} rows={4} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>プロフィールを保存</Button>
                        </CardFooter>
                    </Card>

                     {/* Account Section */}
                    <Card id="account">
                        <CardHeader>
                            <CardTitle>アカウント</CardTitle>
                            <CardDescription>アカウント設定を管理します。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input id="email" type="email" defaultValue={userProfile.email} />
                            </div>
                             <Separator />
                             <div>
                                <h3 className="font-semibold mb-2">パスワードの変更</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">現在のパスワード</Label>
                                    <Input id="current-password" type="password" autoComplete="current-password" />
                                </div>
                                <div className="space-y-2 mt-2">
                                    <Label htmlFor="new-password">新しいパスワード</Label>
                                    <Input id="new-password" type="password" autoComplete="new-password" />
                                </div>
                             </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button>アカウント情報を保存</Button>
                            <Button variant="destructive">アカウントを削除</Button>
                        </CardFooter>
                    </Card>

                    {/* Notifications Section */}
                    <Card id="notifications">
                        <CardHeader>
                            <CardTitle>通知</CardTitle>
                            <CardDescription>通知の受け取り方法を選択してください。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-base">メール通知</Label>
                                    <p className="text-sm text-muted-foreground">
                                        重要な更新やダイジェストをメールで受け取ります。
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-base">プッシュ通知</Label>
                                    <p className="text-sm text-muted-foreground">
                                        「いいね」やコメントなどに関するリアルタイム通知。
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>通知設定を保存</Button>
                        </CardFooter>
                    </Card>

                </div>
            </div>
        </div>
    );
}