import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && session) {
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        response.cookies.set('access_token', session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        response.cookies.set('refresh_token', session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });

        return response;
      }
    } catch (error) {
      console.error('Auth callback GET error:', error);
    }
  }

  // Fallback to login if something fails
  return NextResponse.redirect(new URL('/login', request.url));
}

export async function POST(request: NextRequest) {
  try {
    console.log('Auth callback: Starting...');
    const { access_token, refresh_token } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

    // Create response and set cookies
    const response = NextResponse.json({ success: true, user });

    console.log('Auth callback: Setting cookies...');

    // Set httpOnly cookies using NextResponse
    response.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    console.log('Auth callback: Cookies set successfully');
    console.log('Auth callback: Access token length:', access_token?.length);
    console.log('Auth callback: Refresh token length:', refresh_token?.length);
    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
