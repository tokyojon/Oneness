import { getSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }

    const { personality_profile } = await request.json();

    if (!personality_profile) {
      return NextResponse.json(
        { error: '性格プロフィールデータが必要です' },
        { status: 400 }
      );
    }

    // Update user profile with personality data
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        personality_profile: personality_profile,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Personality profile update error:', error);
      return NextResponse.json(
        { error: '性格プロフィールの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '性格プロフィールを更新しました',
      profile: data
    });

  } catch (error) {
    console.error('Personality profile API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('personality_profile')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Personality profile fetch error:', error);
      return NextResponse.json(
        { error: '性格プロフィールの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      personality_profile: data?.personality_profile || {}
    });

  } catch (error) {
    console.error('Personality profile API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
