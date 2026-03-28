-- Refresh Supabase Schema Cache
-- Run this in your Supabase SQL Editor to fix schema cache errors

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the listings table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'listings'
ORDER BY ordinal_position;

-- Verify the profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
