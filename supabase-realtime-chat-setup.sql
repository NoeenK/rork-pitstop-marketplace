-- Enhanced Real-time Chat Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Function to increment unread count for receiver
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
DECLARE
  receiver_id UUID;
  thread_buyer_id UUID;
  thread_seller_id UUID;
BEGIN
  -- Get the thread's buyer and seller IDs
  SELECT buyer_id, seller_id INTO thread_buyer_id, thread_seller_id
  FROM chat_threads
  WHERE id = NEW.thread_id;

  -- Determine who the receiver is (opposite of sender)
  IF NEW.sender_id = thread_buyer_id THEN
    receiver_id := thread_seller_id;
  ELSE
    receiver_id := thread_buyer_id;
  END IF;

  -- Increment unread count for the receiver's thread
  UPDATE chat_threads
  SET 
    unread_count = unread_count + 1,
    last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_message_created_increment_unread ON messages;

-- Create trigger for incrementing unread count
CREATE TRIGGER on_message_created_increment_unread
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();

-- Ensure Realtime is enabled for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Create indexes for better realtime performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message ON chat_threads(last_message_at DESC);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;
