-- Fix Foreign Key Relationships for Chat and Profiles
-- This script ensures all foreign keys are properly defined and the schema cache is refreshed
-- Run this in your Supabase SQL Editor

-- First, let's ensure all constraints exist
DO $$
BEGIN
  -- Fix chat_threads foreign keys
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_threads_buyer_id_fkey' 
    AND table_name = 'chat_threads'
  ) THEN
    ALTER TABLE public.chat_threads
    ADD CONSTRAINT chat_threads_buyer_id_fkey 
    FOREIGN KEY (buyer_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    RAISE NOTICE 'Added chat_threads_buyer_id_fkey constraint';
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_threads_seller_id_fkey' 
    AND table_name = 'chat_threads'
  ) THEN
    ALTER TABLE public.chat_threads
    ADD CONSTRAINT chat_threads_seller_id_fkey 
    FOREIGN KEY (seller_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    RAISE NOTICE 'Added chat_threads_seller_id_fkey constraint';
  END IF;

  -- Fix listings foreign key
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'listings_seller_id_fkey' 
    AND table_name = 'listings'
  ) THEN
    ALTER TABLE public.listings
    ADD CONSTRAINT listings_seller_id_fkey 
    FOREIGN KEY (seller_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    RAISE NOTICE 'Added listings_seller_id_fkey constraint';
  END IF;

  -- Fix reviews foreign keys
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_reviewer_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    RAISE NOTICE 'Added reviews_reviewer_id_fkey constraint';
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_reviewee_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey 
    FOREIGN KEY (reviewee_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    RAISE NOTICE 'Added reviews_reviewee_id_fkey constraint';
  END IF;

  -- Fix messages foreign key
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    RAISE NOTICE 'Added messages_sender_id_fkey constraint';
  END IF;
END $$;

-- Force refresh of PostgREST schema cache
-- This is the critical step that makes Supabase recognize the foreign keys
NOTIFY pgrst, 'reload schema';

-- Verify all foreign keys are set up correctly
DO $$
DECLARE
  fkey_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fkey_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
  AND constraint_type = 'FOREIGN KEY'
  AND table_name IN ('chat_threads', 'listings', 'reviews', 'messages');
  
  RAISE NOTICE 'Total foreign key constraints found: %', fkey_count;
  RAISE NOTICE 'Schema cache has been refreshed!';
  RAISE NOTICE 'The foreign key relationships should now be recognized by PostgREST.';
END $$;
