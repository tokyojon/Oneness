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
  document: z.instanceof(File).refine(file => file.size > 0, "A document is required."),
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
                title: "Verification Failed",
                description: response.message || "Could not process the document.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred.",
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
                        <FormLabel>ID Document</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                        </FormControl>
                        <FormDescription>Upload a clear photo of your ID.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : 'Verify Age'}
                </Button>
            </form>
        </Form>
        {result && (
            <Alert variant={result.isVerified ? "default" : "destructive"}>
                {result.isVerified ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.isVerified ? "Verification Successful" : "Verification Unsuccessful"}</AlertTitle>
                <AlertDescription>
                    <p>
                        {result.isVerified ? "This document appears to belong to an adult." : "This document does not seem to belong to an adult."}
                    </p>
                    {result.age && <p>Estimated Age: <strong>{result.age}</strong></p>}
                </AlertDescription>
            </Alert>
        )}
    </div>
  )
}
