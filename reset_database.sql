-- Reset Database Script
-- Truncate all tables in public schema to remove all entries
-- Run this in your Supabase SQL editor to prepare for release

TRUNCATE TABLE post_likes CASCADE;
TRUNCATE TABLE post_comments CASCADE;
TRUNCATE TABLE user_bookmarks CASCADE;
TRUNCATE TABLE post_shares CASCADE;
TRUNCATE TABLE tip_transactions CASCADE;
TRUNCATE TABLE points_ledger CASCADE;
TRUNCATE TABLE user_profiles CASCADE;
TRUNCATE TABLE user_notifications CASCADE;
TRUNCATE TABLE ai_avatar_state CASCADE;
TRUNCATE TABLE marketplace_ad_likes CASCADE;
TRUNCATE TABLE marketplace_ad_comments CASCADE;
TRUNCATE TABLE marketplace_offers CASCADE;
TRUNCATE TABLE marketplace_ad_views CASCADE;
TRUNCATE TABLE marketplace_ad_clicks CASCADE;
TRUNCATE TABLE evaluations CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE direct_messages CASCADE;
TRUNCATE TABLE interactions CASCADE;
TRUNCATE TABLE listings CASCADE;
TRUNCATE TABLE marketplace_ads CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE users CASCADE;
