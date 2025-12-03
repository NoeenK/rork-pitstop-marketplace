-- Add like_count column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';
