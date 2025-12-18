import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AuthCallback() {
  try {
    const cookieStore = await cookies();
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      console.error('Auth callback error:', error);
      redirect('/login?error=auth_failed');
    }

    // Check if user profile exists, create if not
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.session.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const displayName = data.session.user.user_metadata?.full_name ||
                         data.session.user.user_metadata?.name ||
                         data.session.user.email?.split('@')[0] ||
                         'User';

      const { error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.session.user.id,
          display_name: displayName,
          banner_url: '/default_banner.png',
          rank: 'member'
        });

      if (createProfileError) {
        console.error('Profile creation error:', createProfileError);
        redirect('/login?error=profile_creation_failed');
      }

      // Initialize points ledger with welcome bonus
      const { error: pointsError } = await supabase
        .from('points_ledger')
        .insert({
          user_id: data.session.user.id,
          amount: 100,
          type: 'welcome_bonus'
        });

      if (pointsError) {
        console.error('Points initialization error:', pointsError);
        // Don't fail for points error
      }

      // Initialize AI avatar state
      const { error: avatarError } = await supabase
        .from('ai_avatar_state')
        .insert({
          user_id: data.session.user.id,
          state: {
            preferences: {},
            last_interaction: null,
            mood: 'neutral'
          }
        });

      if (avatarError) {
        console.error('Avatar state initialization error:', avatarError);
        // Don't fail for avatar error
      }
    }

    // Set HTTP-only cookies for the session
    cookieStore.set('access_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });
    cookieStore.set('refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 3600 // 30 days
    });

    redirect('/dashboard');
  } catch (error) {
    console.error('Callback handling error:', error);
    redirect('/login?error=unexpected_error');
  }
}
