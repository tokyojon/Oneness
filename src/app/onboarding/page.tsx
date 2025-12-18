'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from './actions' // We'll import the server action
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Loader2, User, FileText, ArrowRight } from 'lucide-react'

export default function OnboardingProfilePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        // Call server action
        const result = await updateProfile(formData)

        // updateProfile redirects on success, so if we get here with result, it's an error or we need to handle it
        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#faf9f6] dark:bg-[#1a1614]">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg px-6"
            >
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8">

                    <div className="flex flex-col items-center mb-8">
                        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Tell Us About Yourself</h1>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">Let the kingdom know who you are</p>
                    </div>

                    <form action={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-stone-600 dark:text-stone-300 font-medium ml-1">Full Name</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 h-5 w-5 text-stone-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    className="pl-10 h-11 bg-white/50 dark:bg-white/5 border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-stone-600 dark:text-stone-300 font-medium ml-1">Bio (Optional)</Label>
                            <div className="relative group">
                                <FileText className="absolute left-3 top-3 h-5 w-5 text-stone-400 group-focus-within:text-primary transition-colors" />
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    placeholder="Share a little about yourself..."
                                    className="pl-10 min-h-[120px] bg-white/50 dark:bg-white/5 border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all resize-none py-3"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-600 hover:from-cyan-600 hover:to-primary text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 font-semibold text-base"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Continue <ArrowRight className="w-4 h-4 opacity-80" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Progress Indicator */}
                    <div className="mt-8 flex justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
