-- Drop the constraint if it exists and recreate it
DO $$ 
BEGIN
  -- Drop the constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'unique_direct_thread'
  ) THEN
    ALTER TABLE chat_threads DROP CONSTRAINT unique_direct_thread;
  END IF;

  -- Add the constraint
  ALTER TABLE chat_threads 
  ADD CONSTRAINT unique_direct_thread 
  UNIQUE NULLS NOT DISTINCT (listing_id, buyer_id, seller_id);
  
  RAISE NOTICE 'Constraint unique_direct_thread created successfully';
END $$;
