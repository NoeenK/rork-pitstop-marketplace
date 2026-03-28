-- Drop existing constraints if they exist
DO $$
BEGIN
  -- Drop constraints on listings
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'listings_seller_id_fkey' 
    AND table_name = 'listings'
  ) THEN
    ALTER TABLE public.listings DROP CONSTRAINT listings_seller_id_fkey;
  END IF;

  -- Drop constraints on reviews (reviewer)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_reviewer_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews DROP CONSTRAINT reviews_reviewer_id_fkey;
  END IF;

  -- Drop constraints on reviews (reviewee)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_reviewee_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews DROP CONSTRAINT reviews_reviewee_id_fkey;
  END IF;
END $$;

-- Add new constraints with the correct names
ALTER TABLE public.listings
ADD CONSTRAINT listings_seller_id_fkey 
FOREIGN KEY (seller_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewee_id_fkey 
FOREIGN KEY (reviewee_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
