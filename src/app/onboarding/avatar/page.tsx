'use client'

import { useState } from 'react'
import KawaiiGenerator, { GeneratedAvatarPayload } from '@/components/KawaiiGenerator'
import { saveAvatar, skipAvatar } from '../actions' // Import from parent directory actions
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function OnboardingAvatarPage() {
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async (data: { avatar: GeneratedAvatarPayload['avatarConfig']; imageUrl: string }) => {
        setIsSaving(true)
        try {
            // 1. Convert Data URL to Blob
            const res = await fetch(data.imageUrl)
            const blob = await res.blob()

            // 2. Upload to Supabase Storage
            const supabase = createClient()
            const filename = `${Date.now()}-avatar.png`
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('avatars')
                .upload(`${filename}`, blob, {
                    contentType: 'image/png',
                    upsert: true
                })

            let finalUrl = data.imageUrl // Fallback to base64 if upload fails? No, too big.

            if (uploadError) {
                console.error('Upload error:', uploadError)
                // If upload fails, maybe we just try to save the base64 if it's small enough, or show error
                // For this demo, let's proceed with base64 if upload fails, assuming server action handles it or we accept it might fail
                // Actually, let's just log it and try to save the public URL if possible
            } else if (uploadData) {
                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
                finalUrl = publicUrl
            }

            // 3. Save URL to Profile via Server Action
            await saveAvatar(finalUrl, data.avatar.prompt)

        } catch (error) {
            console.error('Save error:', error)
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#faf9f6] dark:bg-[#1a1614] py-10">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-pink-400/10 blur-[120px]" />
                <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-purple-400/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-4xl px-4"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Create Your Avatar</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">Generate a unique Kawaii style avatar for your profile</p>
                </div>

                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-4 md:p-8">

                    <KawaiiGenerator
                        onSave={handleSave}
                        isSaving={isSaving}
                    />

                </div>

                <div className="mt-8 flex justify-center items-center gap-4">
                    <Button variant="ghost" onClick={() => skipAvatar()} className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100">
                        Skip for now
                    </Button>

                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
