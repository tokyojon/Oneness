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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn, fileToDataUri } from "@/lib/utils"
import { format } from "date-fns"
import WebcamCapture from "./webcam-capture"
import { AIEnhancedRegistrationOutput } from "@/ai/flows/ai-enhanced-registration";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent } from "../ui/card";


const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    dob: z.date({ required_error: "A date of birth is required." }),
});

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
            
            const registrationData = {
                ...values,
                dob: values.dob.toISOString(),
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
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dob"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of birth</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    <FormDescription>
                                        Users under 18 have restricted permissions.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
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
