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
import { AlertCircle } from "lucide-react"
import { cn, fileToDataUri } from "@/lib/utils"
import WebcamCapture from "./webcam-capture"
import { AIEnhancedRegistrationOutput } from "@/ai/flows/ai-enhanced-registration";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    day: z.string().min(1, { message: "Day is required." }),
    month: z.string().min(1, { message: "Month is required." }),
    year: z.string().min(1, { message: "Year is required." }),
}).refine(data => {
    const { day, month, year } = data;
    const date = new Date(`${year}-${month}-${day}`);
    return date.getDate() === parseInt(day) && (date.getMonth() + 1) === parseInt(month);
}, {
    message: "Invalid date.",
    path: ["day"], // Or you can point to a common field
});

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
    { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" }
];
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));


export default function RegisterForm() {
    const { toast } = useToast();
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
                title: "Missing Information",
                description: "Please provide both a photo and a document for verification.",
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
                    title: "Registration Successful",
                    description: result.message,
                });
                setStep(3); // Go to success step
                if (result.aiResult) {
                    setAiResult(result.aiResult);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Registration Failed",
                    description: result.message,
                });
                if(result.aiResult){
                    setAiResult(result.aiResult);
                }
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred while processing your documents.",
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
                        <h2 className="text-2xl font-headline font-semibold">Welcome to the Kingdom!</h2>
                        <p className="text-muted-foreground">Your registration is complete. We are delighted to have you with us.</p>
                        {aiResult && (
                             <Alert variant={aiResult.isLegitimate ? "default" : "destructive"}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{aiResult.isLegitimate ? "Verification Details" : "Verification Issue"}</AlertTitle>
                                <AlertDescription>
                                    <p className="font-semibold">AI Assessment:</p>
                                    <p>{aiResult.reason}</p>
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={() => window.location.href = '/login'}>Proceed to Login</Button>
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
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Love Harmony" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Date of birth</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                                <FormField
                                    control={form.control}
                                    name="day"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Day" />
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
                                <FormField
                                    control={form.control}
                                    name="month"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Month" />
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
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Year" />
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
                            </div>
                            <FormDescription>
                                Users under 18 have restricted permissions.
                            </FormDescription>
                        </FormItem>
                        <Button type="button" onClick={handleNextStep} className="w-full">
                            Next: Verification
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium font-headline">AI Identity Verification</h3>
                            <p className="text-sm text-muted-foreground">To prevent fraud, we need a live photo and an ID document.</p>
                        </div>
                        <FormItem>
                            <FormLabel>1. Live Photo</FormLabel>
                            <WebcamCapture onCapture={setPhotoDataUri} />
                        </FormItem>
                        <FormItem>
                            <FormLabel>2. ID Document</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => e.target.files && setDocumentFile(e.target.files[0])} />
                            </FormControl>
                            <FormDescription>Upload a clear photo of your driver's license, passport, or national ID card.</FormDescription>
                        </FormItem>
                        
                        {aiResult && !aiResult.isLegitimate && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Verification Issue</AlertTitle>
                                <AlertDescription>{aiResult.reason}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                                Back
                            </Button>
                            <Button type="submit" className="w-full" disabled={isLoading || !photoDataUri || !documentFile}>
                                {isLoading ? <LoadingSpinner /> : 'Complete Registration'}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </Form>
    );
}
