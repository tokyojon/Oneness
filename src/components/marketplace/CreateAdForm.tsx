'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { LoadingSpinner } from "@/lib/icons";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(5, { message: "タイトルは最低5文字以上である必要があります。" }),
  description: z.string().min(20, { message: "説明は最低20文字以上である必要があります。" }),
  price: z.string().min(1, { message: "価格を入力してください。" }),
  category: z.string().min(1, { message: "カテゴリを選択してください。" }),
  condition: z.string().min(1, { message: "商品の状態を選択してください。" }),
  location: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

const categories = [
  "工芸品",
  "食品",
  "アクセサリー",
  "生活用品",
  "アート",
  "本",
  "サービス"
];

const conditions = [
  "新品",
  "未使用に近い",
  "非常に良い",
  "良い",
  "可",
  "手作り"
];

interface CreateAdFormProps {
  onSuccess?: () => void;
  editData?: any; // For editing existing ads
}

export default function CreateAdForm({ onSuccess, editData }: CreateAdFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editData ? {
      title: editData.title || "",
      description: editData.description || "",
      price: editData.price?.toString() || "",
      category: editData.category || "",
      condition: editData.condition || "良い",
      location: editData.location || "",
      image_url: editData.image_url || "",
    } : {
      title: "",
      description: "",
      price: "",
      category: "",
      condition: "良い",
      location: "",
      image_url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "認証エラー",
          description: "ログインしてください。",
        });
        router.push('/login');
        return;
      }

      const url = editData ? `/api/marketplace/${editData.id}` : '/api/marketplace';
      const method = editData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          price: parseFloat(values.price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: editData ? "商品を更新しました" : "商品を出品しました",
          description: editData ? "商品情報が更新されました。" : "マーケットプレイスに商品が追加されました。",
        });
        form.reset();
        onSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: editData ? "更新に失敗しました" : "出品に失敗しました",
          description: data.error || 'エラーが発生しました',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: editData ? "更新中に予期せぬエラーが発生しました。" : "出品中に予期せぬエラーが発生しました。",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? "商品を編集する" : "商品を出品する"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="商品のタイトルを入力してください" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品説明</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="商品の詳細な説明を入力してください"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>価格 (円)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>商品の状態</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="状態を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions.map(condition => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>場所 (任意)</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 東京都渋谷区" {...field} />
                    </FormControl>
                    <FormDescription>
                      商品の引き渡し場所や発送元
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>画像URL (任意)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    商品の画像URLを入力してください
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                  出品中...
                </>
              ) : (
                "商品を出品する"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
