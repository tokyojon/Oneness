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

    const { error } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: user.id,
            display_name: fullName,
            bio: bio,
            updated_at: new Date().toISOString(),
        })

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
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

    if (error) {
        return { error: 'Failed to save avatar' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function skipAvatar() {
    redirect('/dashboard')
}
