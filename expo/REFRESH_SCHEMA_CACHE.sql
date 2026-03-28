-- Refresh Supabase Schema Cache
-- Run this in your Supabase SQL Editor to fix the "Could not find column" errors

-- Option 1: Refresh the schema cache (fastest)
NOTIFY pgrst, 'reload schema';

-- Option 2: If Option 1 doesn't work, manually reload the config
SELECT pg_notify('pgrst', 'reload config');

-- Option 3: If both above fail, recreate the foreign key constraints
-- This forces PostgREST to reload the entire schema

-- First, verify all foreign keys exist
DO $$
BEGIN
    -- Ensure listings -> profiles foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'listings_seller_id_fkey' 
        AND table_name = 'listings'
    ) THEN
        ALTER TABLE listings 
        ADD CONSTRAINT listings_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Ensure chat_threads -> profiles foreign keys exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_threads_buyer_id_fkey' 
        AND table_name = 'chat_threads'
    ) THEN
        ALTER TABLE chat_threads 
        ADD CONSTRAINT chat_threads_buyer_id_fkey 
        FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_threads_seller_id_fkey' 
        AND table_name = 'chat_threads'
    ) THEN
        ALTER TABLE chat_threads 
        ADD CONSTRAINT chat_threads_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Ensure reviews -> profiles foreign keys exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_reviewer_id_fkey' 
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE reviews 
        ADD CONSTRAINT reviews_reviewer_id_fkey 
        FOREIGN KEY (reviewer_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_reviewee_id_fkey' 
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE reviews 
        ADD CONSTRAINT reviews_reviewee_id_fkey 
        FOREIGN KEY (reviewee_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- After running the above, force another schema reload
NOTIFY pgrst, 'reload schema';

-- Check that all columns exist in profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
