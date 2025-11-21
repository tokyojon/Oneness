
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { LoadingSpinner } from "@/lib/icons";
import { CheckCircle } from "lucide-react"
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"
import KawaiiGenerator, { GeneratedAvatarPayload } from "../KawaiiGenerator"
import Profiler from "../Profiler"
import Link from "next/link"

const formSchema = z.object({
  displayName: z.string().min(2, { message: "表示名は最低2文字以上である必要があります。" }),
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(6, { message: "パスワードは最低6文字以上である必要があります。" }),
});

export default function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Basic Info, 1: Avatar, 2: Profile, 3: Success
  const [avatarData, setAvatarData] = useState<GeneratedAvatarPayload | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });
  
  async function handleOAuthLogin(provider: 'google' | 'apple') {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to OAuth provider
        window.location.href = data.url;
      } else {
        toast({
          variant: "destructive",
          title: "OAuthエラー",
          description: data.error || `${provider === 'google' ? 'Google' : 'Apple'}での認証に失敗しました。`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: `${provider === 'google' ? 'Google' : 'Apple'}認証中に予期せぬエラーが発生しました。`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleBasicInfoSubmit = (values: z.infer<typeof formSchema>) => {
    // Store basic info and move to avatar step
    setCurrentStep(1);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleBasicInfoSubmit(values);
  };

  const handleAvatarGenerated = (payload: GeneratedAvatarPayload) => {
    setAvatarData(payload);
    setCurrentStep(2);
  };

  const handleProfileComplete = (profile: any) => {
    setProfileData(profile);
    // Now submit all the data
    submitRegistration();
  };

  async function submitRegistration() {
    setIsLoading(true);

    try {
      const values = form.getValues();

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: values.displayName,
          email: values.email,
          password: values.password,
          profileData,
          avatarData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "登録が完了しました",
          description: data.message,
        });

        if (data.autoSignInFailed) {
          // Auto sign-in failed, show message to login manually
          toast({
            title: "ログインが必要です",
            description: "アカウントが作成されました。ログインしてください。",
            variant: "default",
          });
          // Redirect to login page
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          // Store user data using auth utility and login properly
          login(data.user);
          setIsSuccess(true);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } else {
        toast({
          variant: "destructive",
          title: "登録に失敗しました",
          description: data.error || 'エラーが発生しました',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "登録中に予期せぬエラーが発生しました。",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-headline font-semibold">王国へようこそ！</h2>
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <p className="text-muted-foreground">登録が完了しました。ダッシュボードにリダイレクト中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Show different content based on current step
  if (currentStep === 0) {
    // Basic Info Step
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-headline font-semibold mb-2">王国への招待</h2>
            <p className="text-muted-foreground">まずは基本情報を入力してください</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表示名</FormLabel>
                    <FormControl>
                      <Input placeholder="表示名を入力してください" {...field} />
                    </FormControl>
                    <FormDescription>
                      コミュニティ内で表示される名前です
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="メールアドレスを入力してください" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="パスワードを作成してください" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormDescription>
                      最低6文字以上である必要があります。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                次へ: アバター作成 ✨
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 1) {
    // Avatar Generation Step
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-headline font-semibold">アバターを作成しましょう</h2>
          <p className="text-muted-foreground text-sm">アバターを生成すると自動的に次のステップに進みます。</p>
        </div>

        <KawaiiGenerator onAvatarGenerated={handleAvatarGenerated} />

        <p className="text-center text-sm text-muted-foreground">
          生成ツールが表示されない場合は
          {' '}
          <Link
            href="/kawaii-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            こちら
          </Link>
          {' '}をクリックして別ウィンドウで開いてください。
        </p>

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setCurrentStep(0)}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    // Profile Creation Step
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-headline font-semibold mb-2">プロフィールを完成させましょう</h2>
          <p className="text-muted-foreground">あなたの興味や価値観を教えてください</p>
        </div>

        <Profiler onProfileComplete={handleProfileComplete} isSubmitting={isLoading} />

        <div className="flex justify-center">
          <Button onClick={() => setCurrentStep(1)} variant="outline" disabled={isLoading}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  // Default fallback
  return null;
}
