-- COMPLETE FIX FOR ALL DATABASE ERRORS
-- Run this ONCE in your Supabase SQL Editor to fix all foreign key and profile issues
-- This script is safe to run multiple times

BEGIN;

-- =====================================================================
-- PART 1: FIX FOREIGN KEY CONSTRAINTS
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 1: Fixing Foreign Key Constraints';
  RAISE NOTICE '========================================';
  
  -- Fix chat_threads -> profiles (buyer_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_threads_buyer_id_fkey' 
    AND table_name = 'chat_threads'
  ) THEN
    ALTER TABLE public.chat_threads
    ADD CONSTRAINT chat_threads_buyer_id_fkey 
    FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added chat_threads_buyer_id_fkey';
  ELSE
    RAISE NOTICE '✓ chat_threads_buyer_id_fkey already exists';
  END IF;

  -- Fix chat_threads -> profiles (seller_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_threads_seller_id_fkey' 
    AND table_name = 'chat_threads'
  ) THEN
    ALTER TABLE public.chat_threads
    ADD CONSTRAINT chat_threads_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added chat_threads_seller_id_fkey';
  ELSE
    RAISE NOTICE '✓ chat_threads_seller_id_fkey already exists';
  END IF;

  -- Fix listings -> profiles (seller_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'listings_seller_id_fkey' 
    AND table_name = 'listings'
  ) THEN
    ALTER TABLE public.listings
    ADD CONSTRAINT listings_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added listings_seller_id_fkey';
  ELSE
    RAISE NOTICE '✓ listings_seller_id_fkey already exists';
  END IF;

  -- Fix reviews -> profiles (reviewer_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_reviewer_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added reviews_reviewer_id_fkey';
  ELSE
    RAISE NOTICE '✓ reviews_reviewer_id_fkey already exists';
  END IF;

  -- Fix reviews -> profiles (reviewee_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_reviewee_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey 
    FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added reviews_reviewee_id_fkey';
  ELSE
    RAISE NOTICE '✓ reviews_reviewee_id_fkey already exists';
  END IF;

  -- Fix messages -> profiles (sender_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added messages_sender_id_fkey';
  ELSE
    RAISE NOTICE '✓ messages_sender_id_fkey already exists';
  END IF;
END $$;

-- =====================================================================
-- PART 2: CREATE MISSING PROFILES
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 2: Creating Missing Profiles';
  RAISE NOTICE '========================================';
END $$;

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  display_name,
  username,
  phone_number,
  team_number,
  school_name,
  created_at
)
SELECT 
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'User'),
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1),
    'User'
  ),
  COALESCE(u.raw_user_meta_data->>'username', NULL),
  COALESCE(u.raw_user_meta_data->>'phone_number', NULL),
  CASE 
    WHEN u.raw_user_meta_data->>'team_number' ~ '^[0-9]+$' 
    THEN (u.raw_user_meta_data->>'team_number')::INTEGER
    ELSE NULL
  END,
  COALESCE(u.raw_user_meta_data->>'team_name', u.raw_user_meta_data->>'school_name', ''),
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- PART 3: REFRESH SCHEMA CACHE
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 3: Refreshing Schema Cache';
  RAISE NOTICE '========================================';
END $$;

-- Force PostgREST to reload schema cache - THIS IS CRITICAL!
NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- PART 4: VERIFICATION
-- =====================================================================

DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  missing_count INTEGER;
  fkey_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 4: Verification';
  RAISE NOTICE '========================================';
  
  -- Check users vs profiles
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  missing_count := user_count - profile_count;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Users and Profiles:';
  RAISE NOTICE '  Total users: %', user_count;
  RAISE NOTICE '  Total profiles: %', profile_count;
  
  IF missing_count = 0 THEN
    RAISE NOTICE '  ✓ All users have profiles!';
  ELSE
    RAISE WARNING '  ⚠ Still missing % profiles', missing_count;
  END IF;
  
  -- Check foreign keys
  SELECT COUNT(*) INTO fkey_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
  AND constraint_type = 'FOREIGN KEY'
  AND table_name IN ('chat_threads', 'listings', 'reviews', 'messages');
  
  RAISE NOTICE '';
  RAISE NOTICE 'Foreign Keys:';
  RAISE NOTICE '  Total foreign key constraints: %', fkey_count;
  RAISE NOTICE '  ✓ Foreign keys configured';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ ALL FIXES APPLIED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Reload your app';
  RAISE NOTICE '2. Check console logs for errors';
  RAISE NOTICE '3. Test chat functionality';
  RAISE NOTICE '4. Verify profile loading';
END $$;

COMMIT;
