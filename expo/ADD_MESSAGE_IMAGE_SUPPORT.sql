-- Add image_url column to messages table for chat image support
-- Run this in your Supabase SQL Editor

-- Add image_url column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update the constraint to allow empty text if image_url is provided
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS text_length;

-- New constraint: either text or image_url must be provided
ALTER TABLE messages 
ADD CONSTRAINT text_or_image_check 
CHECK (
  (char_length(text) > 0) OR (image_url IS NOT NULL AND char_length(image_url) > 0)
);

-- Add index for image_url queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_messages_image_url ON messages(image_url) WHERE image_url IS NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('text', 'image_url');

