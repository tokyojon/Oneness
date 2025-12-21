-- Add new columns to user_profiles table for enhanced signup process
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS relationship_status TEXT,
ADD COLUMN IF NOT EXISTS favorite_quote TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personality_traits TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS values TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_config JSONB;

-- Update existing profiles to have default empty arrays
UPDATE public.user_profiles
SET
  interests = COALESCE(interests, '{}'),
  personality_traits = COALESCE(personality_traits, '{}'),
  goals = COALESCE(goals, '{}'),
  values = COALESCE(values, '{}'),
  hobbies = COALESCE(hobbies, '{}')
WHERE interests IS NULL OR personality_traits IS NULL OR goals IS NULL OR values IS NULL OR hobbies IS NULL;
