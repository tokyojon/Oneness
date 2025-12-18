
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { LoadingSpinner } from "@/lib/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";

const formSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
  password: z.string().min(1, {
    message: "パスワードを入力してください。",
  }),
})

export default function LoginForm() {
  const { toast } = useToast()
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'ログインしました',
          description: 'ダッシュボードに移動します。',
        });

        login(data.user);
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'ログインに失敗しました',
          description: data.error || 'メールアドレスまたはパスワードをご確認ください。',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: 'ログイン中に予期せぬエラーが発生しました。',
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input placeholder="citizen@oneness.kingdom" {...field} />
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
                <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
            パスワードをお忘れですか？
          </Link>
        </div>


        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              <span>少々お待ちください...</span>
            </span>
          ) : 'ログイン'}
        </Button>
      </form>
    </Form>
  )
}
