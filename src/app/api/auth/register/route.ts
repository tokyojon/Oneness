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

    // Create user profile and associated data
    try {
      console.log('Register: Creating user profile for user ID:', authData.user.id);
      // Insert user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          display_name: displayName,
          banner_url: '/default_banner.png',
          rank: 'member'
        });

      if (profileError) {
        console.error('Register: Profile creation error:', profileError);
        throw profileError;
      }
      console.log('Register: Profile created successfully');

      // Initialize points ledger with welcome bonus
      console.log('Register: Initializing points ledger');
      const { error: pointsError } = await supabase
        .from('points_ledger')
        .insert({
          user_id: authData.user.id,
          amount: 100, // Welcome bonus points
          type: 'welcome_bonus'
        });

      if (pointsError) {
        console.error('Register: Points initialization error:', pointsError);
        // Don't fail registration for points error
      } else {
        console.log('Register: Points initialized');
      }

      // Initialize AI avatar state
      console.log('Register: Initializing AI avatar state');
      const { error: avatarError } = await supabase
        .from('ai_avatar_state')
        .insert({
          user_id: authData.user.id,
          state: {
            preferences: {},
            last_interaction: null,
            mood: 'neutral'
          }
        });

      if (avatarError) {
        console.error('Register: Avatar state initialization error:', avatarError);
        // Don't fail registration for avatar error
      } else {
        console.log('Register: Avatar state initialized');
      }

    } catch (profileErr) {
      console.error('Register: User data creation error:', profileErr);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
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
