-- Add reviewee_id column to reviews table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'reviews' AND column_name = 'reviewee_id') THEN
        -- First add the column without NOT NULL constraint
        ALTER TABLE public.reviews 
        ADD COLUMN IF NOT EXISTS reviewee_id UUID;
        
        -- Update existing rows with a default value
        -- Using seller_id from the associated listing as a default
        UPDATE public.reviews r
        SET reviewee_id = l.seller_id
        FROM public.listings l
        WHERE r.listing_id = l.id
        AND r.reviewee_id IS NULL;
        
        -- Now add the foreign key constraint
        ALTER TABLE public.reviews
        ADD CONSTRAINT fk_reviews_reviewee
        FOREIGN KEY (reviewee_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE;
        
        -- Finally, make the column NOT NULL now that all rows have values
        ALTER TABLE public.reviews 
        ALTER COLUMN reviewee_id SET NOT NULL;
    END IF;
END $$;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
