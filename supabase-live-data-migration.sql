-- Migration for live data functionality
-- Run this in your Supabase project dashboard: SQL Editor

-- Donation campaigns table
CREATE TABLE IF NOT EXISTS donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(20,8) NOT NULL,
  current_amount DECIMAL(20,8) DEFAULT 0,
  organizer_name VARCHAR(255) NOT NULL,
  organizer_avatar TEXT,
  organizer_id VARCHAR(255),
  category VARCHAR(50) NOT NULL CHECK (category IN ('community', 'charity', 'project', 'emergency')),
  end_date DATE,
  supporters INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES donation_campaigns(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table for social feed
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  image_hint TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Enable Row Level Security
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies for donation campaigns
CREATE POLICY "Campaigns are viewable by everyone" ON donation_campaigns FOR SELECT USING (true);
CREATE POLICY "Users can insert own campaigns" ON donation_campaigns FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Create policies for donations
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own donations" ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for posts
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Create policies for post likes
CREATE POLICY "Post likes are viewable by everyone" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create policies for post comments
CREATE POLICY "Comments are viewable by everyone" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- Create policies for stories
CREATE POLICY "Stories are viewable by everyone" ON stories FOR SELECT USING (true);
CREATE POLICY "Users can insert own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_user ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

-- Function to update campaign current amount
CREATE OR REPLACE FUNCTION update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE donation_campaigns 
    SET current_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM donations 
        WHERE campaign_id = NEW.campaign_id
    ),
    supporters = (
        SELECT COUNT(DISTINCT user_id) 
        FROM donations 
        WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update campaign amount when donation is made
CREATE TRIGGER update_campaign_on_donation
    AFTER INSERT ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_amount();

-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
    DELETE FROM stories WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (remove in production)
INSERT INTO donation_campaigns (id, title, description, target_amount, current_amount, organizer_name, organizer_avatar, organizer_id, category, end_date, supporters, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'コミュニティガーデン整備', '地域の人々が集まる緑豊かな空間を作ります。子供たちからお年寄りまで楽しめる場所です。', 10000, 6500, '地域活性化委員会', 'https://picsum.photos/seed/campaign1/100/100', 'org_1', 'community', '2024-12-31', 45, 'active'),
('550e8400-e29b-41d4-a716-446655440002', '災害支援基金', '自然災害に見舞われた地域への緊急支援物資を提供します。', 50000, 32000, 'ワンネス赤十字', 'https://picsum.photos/seed/campaign2/100/100', 'org_2', 'emergency', '2024-11-30', 128, 'active'),
('550e8400-e29b-41d4-a716-446655440003', '教育支援プロジェクト', '経済的に困難な学生たちに学習機会を提供する奨学金プログラムです。', 25000, 12000, '教育未来基金', 'https://picsum.photos/seed/campaign3/100/100', 'org_3', 'charity', '2024-12-15', 67, 'active')
ON CONFLICT (id) DO NOTHING;
