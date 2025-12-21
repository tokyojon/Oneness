-- Marketplace Tables SQL Reset Script for Release Preparation
-- Run this in your Supabase SQL editor
-- This will drop all marketplace tables and recreate them empty

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS direct_messages CASCADE;
DROP TABLE IF EXISTS marketplace_ad_clicks CASCADE;
DROP TABLE IF EXISTS marketplace_ad_views CASCADE;
DROP TABLE IF EXISTS marketplace_offers CASCADE;
DROP TABLE IF EXISTS marketplace_ad_comments CASCADE;
DROP TABLE IF EXISTS marketplace_ad_likes CASCADE;
DROP TABLE IF EXISTS marketplace_ads CASCADE;

-- Marketplace Ads table
CREATE TABLE IF NOT EXISTS marketplace_ads (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category TEXT NOT NULL,
    condition TEXT DEFAULT 'used',
    location TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Ad Likes table
CREATE TABLE IF NOT EXISTS marketplace_ad_likes (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES marketplace_ads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ad_id, user_id)
);

-- Marketplace Ad Comments table
CREATE TABLE IF NOT EXISTS marketplace_ad_comments (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES marketplace_ads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Offers table
CREATE TABLE IF NOT EXISTS marketplace_offers (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES marketplace_ads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Ad Views table (for analytics)
CREATE TABLE IF NOT EXISTS marketplace_ad_views (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES marketplace_ads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- null for anonymous views
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Ad Clicks table (for analytics)
CREATE TABLE IF NOT EXISTS marketplace_ad_clicks (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES marketplace_ads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    click_type TEXT NOT NULL, -- 'contact', 'purchase', etc.
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Direct Messages table
CREATE TABLE IF NOT EXISTS direct_messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ad_id INTEGER REFERENCES marketplace_ads(id) ON DELETE SET NULL, -- null for general messages
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_ads_user_id ON marketplace_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_ads_category ON marketplace_ads(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_ads_status ON marketplace_ads(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_ads_created_at ON marketplace_ads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_ad_likes_ad_id ON marketplace_ad_likes(ad_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_ad_likes_user_id ON marketplace_ad_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_ad_comments_ad_id ON marketplace_ad_comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_ad_comments_user_id ON marketplace_ad_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_offers_ad_id ON marketplace_offers(ad_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_user_id ON marketplace_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_status ON marketplace_offers(status);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_id ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_ad_id ON direct_messages(ad_id);

-- Enable Row Level Security
ALTER TABLE marketplace_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_ad_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_ad_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_ads
CREATE POLICY "Users can view active ads" ON marketplace_ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create their own ads" ON marketplace_ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads" ON marketplace_ads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads" ON marketplace_ads
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for marketplace_ad_likes
CREATE POLICY "Users can view all likes" ON marketplace_ad_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON marketplace_ad_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON marketplace_ad_likes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for marketplace_ad_comments
CREATE POLICY "Users can view all comments" ON marketplace_ad_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" ON marketplace_ad_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON marketplace_ad_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON marketplace_ad_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for marketplace_offers
CREATE POLICY "Users can view offers on their own ads" ON marketplace_offers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM marketplace_ads WHERE id = ad_id
        )
    );

CREATE POLICY "Users can view their own offers" ON marketplace_offers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create offers" ON marketplace_offers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ad owners can update offer status" ON marketplace_offers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM marketplace_ads WHERE id = ad_id
        )
    );

-- RLS Policies for direct_messages
CREATE POLICY "Users can view messages they sent or received" ON direct_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON direct_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received" ON direct_messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Insert sample data (optional)
-- This will create one sample marketplace ad
-- Note: Replace 'user-uuid-here' with an actual user ID from your auth.users table

-- INSERT INTO marketplace_ads (
--     user_id,
--     title,
--     description,
--     price,
--     category,
--     condition,
--     location,
--     image_url,
--     status,
--     views,
--     likes,
--     comments,
--     created_at
-- ) VALUES (
--     '8fb5071b-9748-43c0-8503-4a02521eeddf', -- Replace with actual user UUID
--     '手作り陶器マグカップ',
--     '愛情を込めて作られたオリジナル陶器マグカップ。毎朝のコーヒータイムを豊かにします。丁寧に手作りされた一品で、温かみのあるデザインが特徴です。',
--     2500,
--     '工芸品',
--     '新品',
--     '京都',
--     'https://picsum.photos/seed/pottery1/400/300',
--     'active',
--     15,
--     8,
--     3,
--     NOW()
-- );

-- To insert the sample ad, uncomment the above INSERT statement and replace the user_id with a real user UUID from your database.
