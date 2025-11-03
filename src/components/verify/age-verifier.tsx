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
import { verifyAgeAction } from "@/app/actions";
import { LoadingSpinner } from "@/lib/icons";
import { cn, fileToDataUri } from "@/lib/utils"
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AgeVerificationOutput } from "@/ai/flows/automated-age-verification";

const formSchema = z.object({
  document: z.instanceof(File).refine(file => file.size > 0, "書類が必要です。"),
});

export default function AgeVerifier() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AgeVerificationOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
        const documentDataUri = await fileToDataUri(values.document);
        const response = await verifyAgeAction({ documentDataUri });

        if (response.success && response.data) {
            setResult(response.data);
        } else {
            toast({
                variant: "destructive",
                title: "確認失敗",
                description: response.message || "書類を処理できませんでした。",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "エラー",
            description: "予期せぬエラーが発生しました。",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>身分証明書</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                        </FormControl>
                        <FormDescription>身分証明書の鮮明な写真をアップロードしてください。</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : '年齢を確認'}
                </Button>
            </form>
        </Form>
        {result && (
            <Alert variant={result.isVerified ? "default" : "destructive"}>
                {result.isVerified ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.isVerified ? "確認成功" : "確認失敗"}</AlertTitle>
                <AlertDescription>
                    <p>
                        {result.isVerified ? "この書類は成人のもののようです。" : "この書類は成人のものではないようです。"}
                    </p>
                    {result.age && <p>推定年齢: <strong>{result.age}</strong></p>}
                </AlertDescription>
            </Alert>
        )}
    </div>
  )
}
