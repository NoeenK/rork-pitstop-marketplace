-- Fix: Drop and recreate unique_direct_thread constraint
-- This handles the case where the constraint already exists

-- Drop the constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_direct_thread'
    ) THEN
        ALTER TABLE chat_threads DROP CONSTRAINT unique_direct_thread;
    END IF;
END $$;

-- Now add it back
ALTER TABLE chat_threads 
ADD CONSTRAINT unique_direct_thread 
UNIQUE NULLS NOT DISTINCT (listing_id, buyer_id, seller_id);
