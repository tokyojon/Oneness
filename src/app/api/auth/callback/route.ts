import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('Auth callback: Starting...');
    const { access_token, refresh_token } = await request.json();

    console.log('Auth callback: Tokens received:', { 
      hasAccessToken: !!access_token, 
      hasRefreshToken: !!refresh_token 
    });

    if (!access_token || !refresh_token) {
      console.log('Auth callback: Missing tokens');
      return NextResponse.json(
        { error: 'Missing tokens' },
        { status: 400 }
      );
    }

    // Verify the tokens with Supabase
    console.log('Auth callback: Verifying tokens with Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      console.log('Auth callback: Invalid tokens', error);
      return NextResponse.json(
        { error: 'Invalid tokens' },
        { status: 401 }
      );
    }

    console.log('Auth callback: Tokens verified for user:', user.id);

    const cookieStore = await cookies();

    // Set httpOnly cookies with more compatible settings
    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });
    
    cookieStore.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      path: '/',
      maxAge: 60 * 60 * 24 * 30, 
    });

    console.log('Auth callback: Cookies set successfully');
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
