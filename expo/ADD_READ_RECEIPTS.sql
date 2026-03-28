-- Add Read Receipts to Messages
-- Run this in your Supabase SQL Editor to add read receipt functionality

-- Add read_at column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when querying read receipts
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at) WHERE read_at IS NOT NULL;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_thread_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  -- Mark all messages in the thread as read for the current user
  -- (messages sent by the other person)
  UPDATE messages
  SET read_at = NOW()
  WHERE thread_id = p_thread_id
    AND sender_id != p_user_id
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.mark_messages_as_read(UUID, UUID) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Read receipts have been added successfully!';
  RAISE NOTICE 'Messages now have a read_at timestamp field.';
  RAISE NOTICE 'Use the mark_messages_as_read function to mark messages as read.';
END $$;
