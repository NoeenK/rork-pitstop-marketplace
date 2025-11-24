-- Fix chat_count column in listings table
-- Run this in your Supabase SQL Editor

-- Step 1: Ensure the chat_count column exists
DO $$
BEGIN
    -- Check if chat_count column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'chat_count'
    ) THEN
        ALTER TABLE listings ADD COLUMN chat_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added chat_count column to listings table';
    ELSE
        RAISE NOTICE 'chat_count column already exists';
    END IF;
END $$;

-- Step 2: Set default value for existing rows that might have NULL
UPDATE listings 
SET chat_count = 0 
WHERE chat_count IS NULL;

-- Step 3: Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify the column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name = 'chat_count';

-- Step 5: Display all listings columns to confirm
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'listings' 
ORDER BY ordinal_position;
