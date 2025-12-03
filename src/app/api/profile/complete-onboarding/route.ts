import { getSupabaseServerClient } from '@/lib/supabase-server';

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

    // Mark onboarding as completed
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Onboarding completion error:', error);
      return NextResponse.json(
        { error: 'オンボーディング完了の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'オンボーディングが完了しました',
      profile: data
    });

  } catch (error) {
    console.error('Onboarding completion API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
