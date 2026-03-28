-- Fix duplicate constraint error
-- This script safely handles the unique_direct_thread constraint

DO $$ 
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'unique_direct_thread'
  ) THEN
    ALTER TABLE chat_threads DROP CONSTRAINT unique_direct_thread;
    RAISE NOTICE 'Dropped existing unique_direct_thread constraint';
  END IF;

  -- Now add the constraint fresh
  ALTER TABLE chat_threads 
  ADD CONSTRAINT unique_direct_thread 
  UNIQUE NULLS NOT DISTINCT (listing_id, buyer_id, seller_id);
  
  RAISE NOTICE 'Added unique_direct_thread constraint successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Verify the constraint exists
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'unique_direct_thread';
