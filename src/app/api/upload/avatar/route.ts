import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    // Get the user from the session using Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Create a Supabase client with the user's JWT token
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const avatarConfig = formData.get('avatar_config') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit for avatars)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;

    // Define filesystem path
    const uploadDir = path.join(process.cwd(), 'public', 'avatars');
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Public URL path
    const publicUrl = `/avatars/${fileName}`;

    // Update user's profile with new avatar URL and config
    const { error: updateError } = await userSupabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        avatar_url: publicUrl,
        avatar_config: avatarConfig ? JSON.parse(avatarConfig) : null,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl, // Ensure this matches what AvatarSetupModal expects (it expects 'url' or 'avatarUrl'?) 
      // AvatarSetupModal uses: result.url || data.imageUrl
      message: 'アバターが正常にアップロードされました'
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
