import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Array of prompts with hints and tips on peace, love, and harmony
const teamPrompts = [
  {
    title: "Creating a Peaceful and Harmonious Neighborhood",
    content: "To create a peaceful and harmonious neighborhood, start by fostering open communication among residents. Organize community meetings where everyone can share concerns and ideas. Encourage acts of kindness, like helping neighbors with groceries or organizing block parties. Respect differences and promote inclusivity by celebrating diverse cultures and backgrounds. Maintain common spaces clean and safe, and collaborate on local initiatives that benefit everyone."
  },
  // Add more prompts here as needed, or generate dynamically
  {
    title: "Cultivating Love in Daily Interactions",
    content: "Cultivating love in daily interactions begins with empathy. Listen actively to others without judgment, offer support during challenging times, and express gratitude regularly. Small gestures like a smile, a thank-you note, or helping a neighbor can build stronger bonds. Practice forgiveness and understanding to resolve conflicts peacefully."
  },
  {
    title: "Harmonizing Community Efforts",
    content: "Harmonizing community efforts involves aligning goals for the greater good. Identify shared values and work together on projects that unite people, such as community gardens or local clean-ups. Encourage participation from all ages and backgrounds to ensure inclusivity. Celebrate achievements collectively to reinforce positive change."
  },
  // Add more as needed
];

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    console.log('Generating team post...');

    // Select a prompt - for now, cycle through or randomize
    const promptIndex = Math.floor(Math.random() * teamPrompts.length);
    const selectedPrompt = teamPrompts[promptIndex];

    // Get or create the Oneness Kingdom Team user profile
    // Assuming we have a special user ID for the team, or create one
    // For simplicity, use a fixed user ID or query for it
    const teamUserId = '00000000-0000-0000-0000-000000000000'; // Placeholder, replace with actual team user ID

    // Check if team user exists, if not, create
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', teamUserId)
      .single();

    if (!existingProfile) {
      // Create team profile
      await supabase
        .from('user_profiles')
        .insert({
          user_id: teamUserId,
          display_name: 'Oneness Kingdom Team',
          avatar_url: 'https://picsum.photos/seed/team/200/200', // Or use a specific team avatar
          bio: 'Official account sharing hints and tips on peace, love, and harmony.'
        });
    }

    // Create the post
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: teamUserId,
        content: `${selectedPrompt.title}\n\n${selectedPrompt.content}`,
        likes: 0,
        comments: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Post creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    console.log('Team post created:', newPost.id);

    return NextResponse.json({
      success: true,
      post: newPost,
      message: 'Team post created successfully'
    });

  } catch (error) {
    console.error('Generate team post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
