import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(255)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName } = registerSchema.parse(body);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile (skip if table doesn't exist yet)
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          display_name: displayName
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail registration if profile creation fails, just log it
        // The user can create their profile later
      }
    } catch (profileErr) {
      console.error('Profile table might not exist yet:', profileErr);
      // Continue with registration even if profile table doesn't exist
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        displayName
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
