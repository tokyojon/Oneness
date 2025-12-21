import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const existingGuestUserId = typeof body?.guestUserId === 'string' ? body.guestUserId : null;

    if (existingGuestUserId) {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(existingGuestUserId);
      if (!error && data?.user) {
        return NextResponse.json({ guestUserId: data.user.id });
      }
    }

    const email = `guest_${crypto.randomUUID()}@oneness.local`;
    const password = crypto.randomUUID();

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: 'ゲスト',
      },
    });

    if (createError || !created.user) {
      return NextResponse.json(
        { error: 'Failed to create guest user', details: createError?.message },
        { status: 500 }
      );
    }

    const userId = created.user.id;

    await supabaseAdmin.from('users').upsert({
      id: userId,
      email,
      password_hash: '',
      kyc_status: 'pending',
      updated_at: new Date().toISOString(),
    });

    await supabaseAdmin.from('user_profiles').upsert({
      user_id: userId,
      display_name: 'ゲスト',
      banner_url: '/default_banner.png',
      rank: 'member',
      updated_at: new Date().toISOString(),
    });

    await supabaseAdmin.from('points_ledger').insert({
      user_id: userId,
      amount: 100,
      type: 'welcome_bonus',
    });

    await supabaseAdmin.from('ai_avatar_state').insert({
      user_id: userId,
      state: {
        preferences: {},
        last_interaction: null,
        mood: 'neutral',
      },
    });

    return NextResponse.json({ guestUserId: userId });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to init guest user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
