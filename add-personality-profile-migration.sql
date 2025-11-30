-- Add personality_profile field to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS personality_profile JSONB;

-- Add location field to user_profiles table  
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add onboarding_completed field to distinguish between new users and existing users
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for personality profile queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_personality ON user_profiles USING GIN (personality_profile);

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON user_profiles(onboarding_completed);
