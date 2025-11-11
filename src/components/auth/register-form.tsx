
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "登録が完了しました",
          description: data.message,
        });
        // Automatically log in the user after registration
        // For now, we'll just set the login flag since we don't have full session data
        // In a real app, you'd want to log the user in properly with the API
        localStorage.setItem('isLoggedIn', 'true');
        setIsSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
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
    
  return (
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
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
              アカウント作成中...
            </>
          ) : (
            "アカウントを作成"
          )}
        </Button>
      </form>
    </Form>
  );
}
