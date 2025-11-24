-- Add missing columns to profiles table
-- Run this in your Supabase SQL Editor

-- Add city column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city TEXT;
  END IF;
END $$;

-- Add country column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
  END IF;
END $$;

-- Add display_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name TEXT;
  END IF;
END $$;

-- Add username column if it doesn't exist (with unique constraint)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
    ALTER TABLE profiles ADD CONSTRAINT username_length CHECK (username IS NULL OR char_length(username) >= 3);
  END IF;
END $$;

-- Add phone_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- Add team_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'team_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN team_number INTEGER;
  END IF;
END $$;

-- Add school_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'school_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN school_name TEXT;
  END IF;
END $$;

-- Add is_verified column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add trades_completed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trades_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trades_completed INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add rating column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'rating'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rating NUMERIC(3,2) DEFAULT 0;
  END IF;
END $$;

-- Add review_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN review_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add response_rate column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'response_rate'
  ) THEN
    ALTER TABLE profiles ADD COLUMN response_rate NUMERIC(3,2) DEFAULT 0;
  END IF;
END $$;

-- Add avg_response_time column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avg_response_time'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avg_response_time TEXT DEFAULT '0 min';
  END IF;
END $$;

-- Add blocked_users column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'blocked_users'
  ) THEN
    ALTER TABLE profiles ADD COLUMN blocked_users UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Reload the schema cache
NOTIFY pgrst, 'reload schema';
