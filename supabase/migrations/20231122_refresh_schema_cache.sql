-- This migration refreshes the PostgREST schema cache
-- to ensure all foreign key relationships are recognized

-- First, notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Then, explicitly create any missing foreign key constraints with IF NOT EXISTS
-- to ensure they exist even if the schema cache refresh doesn't work
DO $$
BEGIN
  -- For listings table
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
  END IF;

  -- For reviews table (reviewer)
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
  END IF;

  -- For reviews table (reviewee)
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
  END IF;
END $$;
