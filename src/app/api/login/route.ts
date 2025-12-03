import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { getSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    // Use Supabase Auth for authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Get user profile data from users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, display_name, email, created_at')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      // If user profile doesn't exist, use auth data
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: authData.user.id,
          name: authData.user.user_metadata?.display_name || authData.user.email?.split('@')[0],
          email: authData.user.email,
          createdAt: authData.user.created_at,
        },
      });
    }

    // Set HTTP-only cookies for the session
    const cookieStore = await cookies();
    cookieStore.set('access_token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });
    cookieStore.set('refresh_token', authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 3600 // 30 days
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: userProfile.id,
        name: userProfile.display_name,
        email: userProfile.email,
        createdAt: userProfile.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
