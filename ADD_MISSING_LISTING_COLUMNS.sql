-- Add missing city and country columns to listings table
-- Run this in your Supabase SQL Editor

-- Add city column
ALTER TABLE listings ADD COLUMN IF NOT EXISTS city TEXT;

-- Add country column  
ALTER TABLE listings ADD COLUMN IF NOT EXISTS country TEXT;

-- Optionally add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_country ON listings(country);

-- Refresh the schema cache so PostgREST knows about the new columns
NOTIFY pgrst, 'reload schema';
