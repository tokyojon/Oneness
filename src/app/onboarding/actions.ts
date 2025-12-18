'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const fullName = formData.get('fullName') as string
    const bio = formData.get('bio') as string

    if (!fullName) {
        return { error: 'Full name is required' }
    }

<<<<<<< HEAD
    // Upsert profile
=======
>>>>>>> ae6cab7 (init)
    const { error } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: user.id,
            display_name: fullName,
            bio: bio,
            updated_at: new Date().toISOString(),
        })
<<<<<<< HEAD
    // Note: If conflict, we update. 
    // IMPORTANT: If 'user_profiles' RLS is set up for 'INSERT', upsert works.
=======
>>>>>>> ae6cab7 (init)

    if (error) {
        console.error('Profile update error:', error)
        return { error: 'Failed to update profile' }
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding/avatar')
}

export async function saveAvatar(avatarUrl: string, prompt: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('user_profiles')
        .update({
            avatar_url: avatarUrl,
<<<<<<< HEAD
            // avatar_prompt: prompt, // Column may not exist in user_profiles based on SQL, ignoring for now or just ignoring error if strict map off
=======
>>>>>>> ae6cab7 (init)
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

    if (error) {
        return { error: 'Failed to save avatar' }
    }

    revalidatePath('/', 'layout')
<<<<<<< HEAD
    // We don't redirect here because this might be called via client side fetch or similar, 
    // but if called as server action we can redirect.
    // Actually, better to let client handle redirect if it calls this via a wrapper.
    // But standard server action can redirect.
=======
>>>>>>> ae6cab7 (init)
    redirect('/dashboard')
}

export async function skipAvatar() {
    redirect('/dashboard')
}
