-- ========================================
-- FIX BLOCKED USERS AND CHAT ISSUES
-- Run this SQL in your Supabase SQL Editor
-- ========================================

-- 1. Add blocked_users column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'blocked_users'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN blocked_users UUID[] DEFAULT '{}';
    RAISE NOTICE 'Added blocked_users column to profiles table';
  ELSE
    RAISE NOTICE 'blocked_users column already exists in profiles table';
  END IF;
END $$;

-- 2. Make listing_id nullable in chat_threads (for direct messaging)
ALTER TABLE chat_threads 
ALTER COLUMN listing_id DROP NOT NULL;

-- 3. Add read_at column to messages if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages 
    ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added read_at column to messages table';
  ELSE
    RAISE NOTICE 'read_at column already exists in messages table';
  END IF;
END $$;

-- 4. Drop old constraints and create new ones
ALTER TABLE chat_threads 
DROP CONSTRAINT IF EXISTS chat_threads_listing_id_buyer_id_seller_id_key;

-- Create unique index for listing-based chats
DROP INDEX IF EXISTS unique_listing_thread;
CREATE UNIQUE INDEX unique_listing_thread 
ON chat_threads (listing_id, buyer_id, seller_id) 
WHERE listing_id IS NOT NULL;

-- Create unique index for direct chats
DROP INDEX IF EXISTS unique_direct_thread;
CREATE UNIQUE INDEX unique_direct_thread 
ON chat_threads (LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id)) 
WHERE listing_id IS NULL;

-- 5. Create user_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "User status is viewable by everyone" ON user_status;
DROP POLICY IF EXISTS "Users can update own status" ON user_status;
DROP POLICY IF EXISTS "Users can modify own status" ON user_status;

-- 7. Create user_status policies
CREATE POLICY "User status is viewable by everyone" ON user_status
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own status" ON user_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status" ON user_status
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Update messages INSERT policy to avoid blocked users check
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = thread_id
      AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
    )
  );

-- 9. Drop and recreate the UPDATE policy for messages
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
CREATE POLICY "Users can update messages in their threads" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = messages.thread_id
      AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
    )
  );

-- 10. Enable Realtime for all necessary tables
DO $$
BEGIN
  -- Add chat_threads to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
    RAISE NOTICE 'Added chat_threads to realtime publication';
  END IF;
  
  -- Add messages to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    RAISE NOTICE 'Added messages to realtime publication';
  END IF;
  
  -- Add user_status to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
    RAISE NOTICE 'Added user_status to realtime publication';
  END IF;
END $$;

-- 11. Create or replace mark_messages_as_read function
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

-- 12. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION
-- ========================================

-- Check if blocked_users column exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'blocked_users';

-- Check chat_threads structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_threads'
ORDER BY ordinal_position;

-- Check messages structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Check user_status structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_status'
ORDER BY ordinal_position;

-- Check realtime publications
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Success message
SELECT 'All fixes applied successfully!' AS status;
