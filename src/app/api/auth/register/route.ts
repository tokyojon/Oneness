import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const registerSchema = z.object({
  displayName: z.string().min(2).max(255),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  profileData: z.object({
    displayName: z.string().optional(),
    bio: z.string().optional(),
    interests: z.array(z.string()).optional(),
    personality: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    relationshipStatus: z.string().optional(),
    occupation: z.string().optional(),
    location: z.string().optional(),
    favoriteQuote: z.string().optional(),
    hobbies: z.array(z.string()).optional(),
  }).optional(),
  avatarData: z.object({
    avatar: z.any(),
    imageUrl: z.string(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, profileData, avatarData } = registerSchema.parse(body);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
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

    // Prepare avatar storage if provided
    let avatarUrlToSave: string | null = avatarData?.imageUrl || null;
    const avatarConfigToSave = avatarData?.avatar || null;

    if (avatarData?.imageUrl?.startsWith('data:')) {
      const base64Match = avatarData.imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (base64Match) {
        const [, mimeType, base64Data] = base64Match;
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = mimeType.split('/')[1] || 'png';
        const filePath = `avatars/${authData.user.id}-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-assets')
          .upload(filePath, buffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Register: Avatar upload error:', uploadError);
          throw new Error('Failed to upload avatar image');
        }

        const { data: publicData } = supabase.storage
          .from('profile-assets')
          .getPublicUrl(filePath);

        avatarUrlToSave = publicData.publicUrl;
      } else {
        console.warn('Register: Invalid avatar data URL format received');
      }
    }

    // Create user profile and associated data
    try {
      console.log('Register: Creating user profile for user ID:', authData.user.id);
      // Create user profile with all the collected data
      console.log('Register: Creating user profile for user ID:', authData.user.id);
      const profileDataToInsert = {
        user_id: authData.user.id,
        display_name: profileData?.displayName || displayName,
        banner_url: '/default_banner.png',
        bio: profileData?.bio || null,
        location: profileData?.location || null,
        occupation: profileData?.occupation || null,
        relationship_status: profileData?.relationshipStatus || null,
        favorite_quote: profileData?.favoriteQuote || null,
        interests: profileData?.interests || [],
        personality_traits: profileData?.personality || [],
        goals: profileData?.goals || [],
        values: profileData?.values || [],
        hobbies: profileData?.hobbies || [],
        avatar_url: avatarUrlToSave,
        avatar_config: avatarConfigToSave,
        rank: 'member'
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileDataToInsert);

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

    // Automatically sign in the user after successful registration
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Register: Auto sign-in error:', signInError);
      // Don't fail registration, but log the error
      return NextResponse.json({
        message: 'User registered successfully, but automatic sign-in failed. Please log in manually.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          displayName
        },
        autoSignInFailed: true
      });
    }

    if (!signInData.session) {
      console.error('Register: No session after auto sign-in');
      return NextResponse.json({
        message: 'User registered successfully, but automatic sign-in failed. Please log in manually.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          displayName
        },
        autoSignInFailed: true
      });
    }

    // Set HTTP-only cookies for the session
    const cookieStore = await cookies();
    cookieStore.set('access_token', signInData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });
    cookieStore.set('refresh_token', signInData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 3600 // 30 days
    });

    return NextResponse.json({
      message: 'User registered and signed in successfully',
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
