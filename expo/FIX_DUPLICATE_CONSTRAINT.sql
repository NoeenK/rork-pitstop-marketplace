-- Fix duplicate unique_direct_thread constraint error

-- Drop the constraint if it exists
ALTER TABLE chat_threads DROP CONSTRAINT IF EXISTS unique_direct_thread;

-- Add it back with proper syntax
ALTER TABLE chat_threads ADD CONSTRAINT unique_direct_thread 
  UNIQUE NULLS NOT DISTINCT (listing_id, buyer_id, seller_id);
