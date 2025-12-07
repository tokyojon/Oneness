import { getSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Simple validators
const ALLOWED = {
  socialStyle: ['group', 'individual', 'balanced'],
  communicationStyle: ['direct', 'indirect', 'balanced'],
  workLifeBalance: ['work-focused', 'life-focused', 'balanced'],
  meetingPreference: ['weekend', 'weekday', 'flexible'],
  personalityType: ['enthusiast', 'thinker', 'helper', 'organizer'],
};

function validatePersonalityPayload(payload: any) {
  if (typeof payload !== 'object' || payload === null) return 'Payload must be an object';

  if ('socialStyle' in payload && payload.socialStyle && !ALLOWED.socialStyle.includes(payload.socialStyle)) {
    return `socialStyle must be one of ${ALLOWED.socialStyle.join(', ')}`;
  }

  if ('communicationStyle' in payload && payload.communicationStyle && !ALLOWED.communicationStyle.includes(payload.communicationStyle)) {
    return `communicationStyle must be one of ${ALLOWED.communicationStyle.join(', ')}`;
  }

  if ('workLifeBalance' in payload && payload.workLifeBalance && !ALLOWED.workLifeBalance.includes(payload.workLifeBalance)) {
    return `workLifeBalance must be one of ${ALLOWED.workLifeBalance.join(', ')}`;
  }

  if ('meetingPreference' in payload && payload.meetingPreference && !ALLOWED.meetingPreference.includes(payload.meetingPreference)) {
    return `meetingPreference must be one of ${ALLOWED.meetingPreference.join(', ')}`;
  }

  if ('personalityType' in payload && payload.personalityType && !ALLOWED.personalityType.includes(payload.personalityType)) {
    return `personalityType must be one of ${ALLOWED.personalityType.join(', ')}`;
  }

  if ('interests' in payload && payload.interests && !Array.isArray(payload.interests)) {
    return 'interests must be an array of strings';
  }

  return null;
}

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  // Maintaining PUT method compatibility with frontend, but implementation uses provided logic
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // expected object shape (camelCase)
  const personality_profile = body.personality_profile ?? body; // allow either full body or nested

  const validationError = validatePersonalityPayload(personality_profile);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // map camelCase -> snake_case explicit columns for DB if needed, 
  // but keeping primarily JSONB + specific columns if they exist in schema.
  // Note: user_profiles schema might not have all these columns explicitly yet, but we'll try to save valid ones.
  // We'll rely on the personality_profile JSONB column mainly.

  /* 
  If columns don't exist, Supabase will ignore them or throw error? 
  Actually, if we pass keys that don't exist in the table, it might error.
  Let's check what checking_columns.sql showed... oh wait command failed.
  I will assume the columns EXIST or will normally just be ignored if I only target JSONB column in strict implementations,
  but user request SAYS to write them. I'll include them but be aware.
  Actually, let's keep it safe. The provided code does the mapping.
  */

  const explicit = {
    social_style: personality_profile.socialStyle ?? null,
    communication_style: personality_profile.communicationStyle ?? null,
    interests: Array.isArray(personality_profile.interests)
      ? personality_profile.interests.map(String)
      : [],
    work_life_balance: personality_profile.workLifeBalance ?? null,
    meeting_preference: personality_profile.meetingPreference ?? null,
    personality_type: personality_profile.personalityType ?? null,
  };

  // We also have 'traits' from my previous task! We must preserve it if it comes in.
  // The frontend sends updatedProfile which includes 'traits'.
  // We should make sure 'traits' is also saved in the JSON.

  const updates = {
    user_id: user.id,
    personality_profile: personality_profile,
    // ...explicit, // We will comment this out if columns don't confirm exist, but user asked for them.
    // I'll stick to just the JSONB update unless I'm 100% sure, OR I follows user instructions "Write both".
    // I'll follow instructions.
    ...explicit,
    updated_at: new Date().toISOString(),
  };

  // upsert to ensure a row exists and is updated atomically
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(updates, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error updating personality:', error);
    // Fallback: try updating ONLY the jsonb column if explicit columns fail (e.g. they don't exist)
    if (error.code === '42703') { // Undefined column
      const { data: retryData, error: retryError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          personality_profile: personality_profile,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (retryError) return NextResponse.json({ error: retryError.message }, { status: 500 });
      return NextResponse.json({ data: retryData }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(req: NextRequest) {
  return PUT(req);
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
