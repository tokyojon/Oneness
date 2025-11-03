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
import { registerAction } from "@/app/actions";
import { LoadingSpinner } from "@/lib/icons";
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn, fileToDataUri } from "@/lib/utils"
import WebcamCapture from "./webcam-capture"
import { AIEnhancedRegistrationOutput } from "@/ai/flows/ai-enhanced-registration";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useRouter } from "next/navigation"


const formSchema = z.object({
    name: z.string().min(2, { message: "名前は2文字以上である必要があります。" }),
    email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
    password: z.string().min(8, { message: "パスワードは8文字以上である必要があります。" }),
    day: z.string().min(1, { message: "日が必要です。" }),
    month: z.string().min(1, { message: "月が必要です。" }),
    year: z.string().min(1, { message: "年が必要です。" }),
}).refine(data => {
    const { day, month, year } = data;
    const date = new Date(`${year}-${month}-${day}`);
    return date.getDate() === parseInt(day) && (date.getMonth() + 1) === parseInt(month);
}, {
    message: "無効な日付です。",
    path: ["day"], // Or you can point to a common field
});

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const months = [
    { value: "01", label: "1月" }, { value: "02", label: "2月" }, { value: "03", label: "3月" },
    { value: "04", label: "4月" }, { value: "05", label: "5月" }, { value: "06", label: "6月" },
    { value: "07", label: "7月" }, { value: "08", label: "8月" }, { value: "09", label: "9月" },
    { value: "10", label: "10月" }, { value: "11", label: "11月" }, { value: "12", label: "12月" }
];
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));


export default function RegisterForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [aiResult, setAiResult] = useState<AIEnhancedRegistrationOutput | null>(null);

    const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            day: "",
            month: "",
            year: "",
        },
    });

    const handleNextStep = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            setStep(2);
        }
    };
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!photoDataUri || !documentFile) {
            toast({
                variant: "destructive",
                title: "情報が不足しています",
                description: "認証のために写真と書類の両方を提供してください。",
            });
            return;
        }

        setIsLoading(true);
        setAiResult(null);

        try {
            const documentDataUri = await fileToDataUri(documentFile);
            
            const { day, month, year, ...restOfValues } = values;
            const dob = new Date(`${year}-${month}-${day}`).toISOString();

            const registrationData = {
                ...restOfValues,
                dob: dob,
                photoDataUri,
                documentDataUri
            };

            const result = await registerAction(registrationData);

            if (result.success) {
                toast({
                    title: "登録成功",
                    description: result.message,
                });
                if(result.redirect) {
                    router.push(result.redirect);
                } else {
                    setStep(3); // Go to success step
                }
                if (result.aiResult) {
                    setAiResult(result.aiResult);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "登録失敗",
                    description: result.message,
                });
                if(result.aiResult){
                    setAiResult(result.aiResult);
                }
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "エラー",
                description: "書類の処理中に予期せぬエラーが発生しました。",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (step === 3) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-headline font-semibold">王国へようこそ！</h2>
                        <div className="flex justify-center">
                          <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <p className="text-muted-foreground">登録が完了しました。ご参加いただき、誠にありがとうございます。</p>
                        {aiResult && (
                             <Alert variant={aiResult.isLegitimate ? "default" : "destructive"}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{aiResult.isLegitimate ? "認証詳細" : "認証の問題"}</AlertTitle>
                                <AlertDescription>
                                    <p className="font-semibold">AI評価：</p>
                                    <p>{aiResult.reason}</p>
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={() => router.push('/dashboard')}>ダッシュボードへ</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                    <>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>氏名</FormLabel>
                                    <FormControl><Input placeholder="愛 平和" {...field} /></FormControl>
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
                                    <FormControl><Input placeholder="citizen@oneness.kingdom" {...field} /></FormControl>
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
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>生年月日</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="年" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="month"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValuechange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="月" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {months.map(month => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="day"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="日" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {days.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormDescription>
                                18歳未満のユーザーは権限が制限されます。
                            </FormDescription>
                        </FormItem>
                        <Button type="button" onClick={handleNextStep} className="w-full">
                            次へ：確認
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium font-headline">AI本人確認</h3>
                            <p className="text-sm text-muted-foreground">詐欺防止のため、ライブ写真と身分証明書が必要です。</p>
                        </div>
                        <FormItem>
                            <FormLabel>1. ライブ写真</FormLabel>
                            <WebcamCapture onCapture={setPhotoDataUri} />
                        </FormItem>
                        <FormItem>
                            <FormLabel>2. 身分証明書</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => e.target.files && setDocumentFile(e.target.files[0])} />
                            </FormControl>
                            <FormDescription>運転免許証、パスポート、または国民IDカードの鮮明な写真をアップロードしてください。</FormDescription>
                        </FormItem>
                        
                        {aiResult && !aiResult.isLegitimate && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>認証の問題</AlertTitle>
                                <AlertDescription>{aiResult.reason}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                                戻る
                            </Button>
                            <Button type="submit" className="w-full" disabled={isLoading || !photoDataUri || !documentFile}>
                                {isLoading ? <LoadingSpinner /> : '登録を完了する'}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </Form>
    );
}
