-- Updated Supabase Migration Script for Supabase Auth Integration
-- Run this in your Supabase project dashboard: SQL Editor

-- User profiles table (references auth.users instead of custom users table)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  rank VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Points ledger table
CREATE TABLE IF NOT EXISTS points_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id UUID,
  amount INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON points_ledger(user_id);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('offer', 'request')),
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  provider_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interactions_listing ON interactions(listing_id);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id BIGSERIAL PRIMARY KEY,
  interaction_id UUID NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  evaluator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evaluations_target ON evaluations(target_user_id);

-- Realtime tables
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_avatar_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_avatar_state ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles table
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for other tables as needed
CREATE POLICY "Users can view own data" ON points_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON points_ledger FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Listings are viewable by everyone" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Interactions are viewable by participants" ON interactions FOR SELECT USING (auth.uid() = provider_user_id OR auth.uid() = receiver_user_id);
CREATE POLICY "Users can insert own interactions" ON interactions FOR INSERT WITH CHECK (auth.uid() = provider_user_id OR auth.uid() = receiver_user_id);

CREATE POLICY "Messages are viewable by participants" ON messages FOR SELECT USING (
  auth.uid() IN (
    SELECT provider_user_id FROM interactions WHERE interactions.id = messages.interaction_id
    UNION
    SELECT receiver_user_id FROM interactions WHERE interactions.id = messages.interaction_id
  )
);

CREATE POLICY "Users can view own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON user_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own avatar state" ON ai_avatar_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own avatar state" ON ai_avatar_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own avatar state" ON ai_avatar_state FOR UPDATE USING (auth.uid() = user_id);
