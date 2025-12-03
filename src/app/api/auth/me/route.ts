import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    console.log('Auth me: Starting...');
    console.log('Auth me: Request headers cookie:', request.headers.get('cookie'));

    // Try both cookie reading methods for Next.js 15 compatibility
    let accessToken: string | undefined, refreshToken: string | undefined;

    try {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      console.log('Auth me: All cookies from cookieStore:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' })));

      accessToken = cookieStore.get('access_token')?.value;
      refreshToken = cookieStore.get('refresh_token')?.value;
      console.log('Auth me: Using cookies() API');
    } catch (cookieError) {
      console.log('Auth me: cookies() failed, trying request.headers.cookie:', cookieError);
      // Fallback to parsing from request headers
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) {
            cookies[name] = value;
          }
        });
        accessToken = cookies['access_token'];
        refreshToken = cookies['refresh_token'];
        console.log('Auth me: Parsed from headers');
      }
    }

    console.log('Auth me: Final token check:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    });

    if (!accessToken) {
      console.log('Auth me: No access token found');
      return NextResponse.json(
        { error: 'No access token' },
        { status: 401 }
      );
    }

    // Create a Supabase client with the user's tokens
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    // Get the user from the token
    const { data: user, error: userError } = await userSupabase.auth.getUser();

    if (userError || !user.user) {
      // Try to refresh the token
      if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (refreshError || !refreshData.session) {
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          );
        }

        // Get refreshed user data
        const refreshedSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${refreshData.session.access_token}`,
              },
            },
          }
        );

        const { data: refreshedUserData, error: refreshedError } = await refreshedSupabase.auth.getUser();

        if (refreshedError || !refreshedUserData.user) {
          return NextResponse.json(
            { error: 'Invalid token after refresh' },
            { status: 401 }
          );
        }

        // Get refreshed user profile
        const refreshedUser = await getUserData(refreshedSupabase, refreshedUserData.user.id, refreshedUserData.user.email);

        // Update cookies with new tokens using NextResponse
        const response = NextResponse.json({
          user: refreshedUser
        });

        response.cookies.set('access_token', refreshData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 3600
        });

        response.cookies.set('refresh_token', refreshData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 3600
        });

        console.log('Auth me: Refreshed tokens and updated cookies');
        return response;
      }

      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user data
    const userData = await getUserData(userSupabase, user.user.id, user.user.email);
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserData(supabaseClient: any, userId: string, email: string | undefined) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

  const [profile, pointsData, avatarState, monthlyRedemptions] = await Promise.all([
    supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then((result: any) => ({ data: result.data, error: result.error })),

    supabaseClient
      .from('points_ledger')
      .select('amount, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then((result: any) => ({ data: result.data, error: result.error })),

    supabaseClient
      .from('ai_avatar_state')
      .select('state')
      .eq('user_id', userId)
      .single()
      .then((result: any) => ({ data: result.data, error: result.error })),

    // Calculate monthly redemptions
    supabaseClient
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'exchange')
      .gte('created_at', startOfMonth.toISOString())
      .lt('created_at', endOfMonth.toISOString())
      .then((result: any) => ({ data: result.data, error: result.error }))
  ]);

  const totalPoints = pointsData.data?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;
  const monthlyRedeemedOp = monthlyRedemptions.data?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;

  return {
    id: userId,
    email: email || '',
    profile: profile.data || null,
    points: {
      total: totalPoints,
      monthly_redeemed_op: monthlyRedeemedOp
    },
    avatarState: avatarState.data?.state || null
  };
}
