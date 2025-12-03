-- Fix Chat Schema Issues
-- Run this in your Supabase SQL Editor

-- Add read_at column to messages table if it doesn't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Verify chat_threads has last_message_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_threads' 
    AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE chat_threads 
    ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Verify chat_threads has unread_count column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_threads' 
    AND column_name = 'unread_count'
  ) THEN
    ALTER TABLE chat_threads 
    ADD COLUMN unread_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create or replace function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_thread_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE thread_id = p_thread_id
    AND sender_id != p_user_id
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to update unread count
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
DECLARE
  v_receiver_id UUID;
BEGIN
  -- Determine the receiver (the person who is NOT the sender)
  SELECT CASE 
    WHEN buyer_id = NEW.sender_id THEN seller_id 
    ELSE buyer_id 
  END INTO v_receiver_id
  FROM chat_threads
  WHERE id = NEW.thread_id;

  -- Increment unread count for the receiver
  UPDATE chat_threads
  SET unread_count = COALESCE(unread_count, 0) + 1
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_message_created_unread ON messages;

-- Create trigger to update unread count when message is sent
CREATE TRIGGER on_message_created_unread
  AFTER INSERT ON messages
  FOR EACH ROW 
  EXECUTE FUNCTION update_unread_count();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('chat_threads', 'messages')
  AND column_name IN ('last_message_at', 'unread_count', 'read_at')
ORDER BY table_name, column_name;
