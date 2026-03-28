-- Fix Supabase Schema Cache Issue
-- This resolves PGRST204 errors: "Could not find column in the schema cache"
-- Run this in your Supabase SQL Editor

-- Step 1: Ensure all required columns exist in listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS price_cents INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_swap_only BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS chat_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS season_tag TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS boosted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Ensure all required columns exist in profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_number INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trades_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_rate NUMERIC(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_time TEXT DEFAULT '0 min';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_users UUID[] DEFAULT '{}';

-- Step 3: Ensure all required columns exist in reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 4: Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Step 5: Alternative method if above doesn't work
SELECT pg_notify('pgrst', 'reload config');

-- Step 6: Verify the columns exist
SELECT 'listings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'listings'
ORDER BY ordinal_position;

SELECT 'profiles' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 7: Restart PostgREST connection (this should happen automatically after NOTIFY)
-- If the error persists after running this script, you may need to:
-- 1. Go to Supabase Dashboard > Database > Replication
-- 2. Pause and resume replication
-- OR
-- 3. Go to Project Settings > Database and restart the database
