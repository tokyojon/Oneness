import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const EDGE_FUNCTION_URL = 'https://edfixzjpvsqpebzehsqy.functions.supabase.co/create-user-profile';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const { user, session } = data;

    if (!user) {
      // Should wait for email confirmation
      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please check your email to confirm.'
      });
    }

    // 2. Create User Profile via Edge Function
    // We try to get a token. If explicit session exists (auto-confirm), use it.
    // If not, we might not be able to call the edge function if it requires user auth.
    // However, since we are on the server with SERVICE_ROLE_KEY, we could potentially bypass auth or impersonate.
    // But the Edge Function likely verifies the JWT 'sub'.
    // If we have a session, we use it.

    if (session?.access_token) {
      const profileRes = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          display_name: name
        })
      });

      if (!profileRes.ok) {
        console.error('Profile creation failed:', await profileRes.text());
        // We continue, as registration itself succeeded
      }
    }

    const response = NextResponse.json({ success: true, user });

    // 3. Set cookies if session exists
    if (session) {
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
    }

    return response;

  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
