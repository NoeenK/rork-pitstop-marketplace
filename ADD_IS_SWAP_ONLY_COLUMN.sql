-- Add is_swap_only column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_swap_only BOOLEAN DEFAULT false;

-- Optionally add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_is_swap_only ON listings(is_swap_only);

-- Refresh the schema cache so PostgREST knows about the new column
NOTIFY pgrst, 'reload schema';
