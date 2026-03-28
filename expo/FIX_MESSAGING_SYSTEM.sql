-- ========================================
-- COMPLETE MESSAGING SYSTEM FIX
-- Run this in Supabase SQL Editor
-- ========================================
-- This script will:
-- 1. Ensure all required tables exist
-- 2. Fix all RLS policies
-- 3. Enable realtime
-- 4. Remove blocked_users dependency
-- ========================================

-- Step 1: Ensure read_at column exists in messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Make listing_id nullable in chat_threads (for direct messages)
ALTER TABLE chat_threads 
ALTER COLUMN listing_id DROP NOT NULL;

-- Step 3: Drop ALL existing message policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;

-- Step 4: Create clean SELECT policy for messages
CREATE POLICY "Users can view messages in their threads" 
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 5: Create clean INSERT policy for messages
CREATE POLICY "Users can send messages in their threads" 
ON messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 6: Create UPDATE policy for read receipts
CREATE POLICY "Users can update messages in their threads" 
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 7: Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Step 8: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;

-- Step 9: Drop and recreate chat_threads policies
DROP POLICY IF EXISTS "Users can view their chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can view their own threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can create chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can create threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can update their chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can update their threads" ON chat_threads;

CREATE POLICY "Users can view their chat threads" 
ON chat_threads FOR SELECT
USING (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);

CREATE POLICY "Users can create chat threads" 
ON chat_threads FOR INSERT
WITH CHECK (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

CREATE POLICY "Users can update their chat threads" 
ON chat_threads FOR UPDATE
USING (
  buyer_id = auth.uid() OR seller_id = auth.uid()
)
WITH CHECK (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);

-- Step 10: Create user_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view user status" ON user_status;
DROP POLICY IF EXISTS "Users can update own status" ON user_status;
DROP POLICY IF EXISTS "Users can update own status update" ON user_status;

CREATE POLICY "Anyone can view user status" 
ON user_status FOR SELECT
USING (true);

CREATE POLICY "Users can insert own status" 
ON user_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status" 
ON user_status FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON user_status TO authenticated;
GRANT SELECT ON user_status TO anon;

-- Step 11: Create or replace mark_messages_as_read function
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

-- Step 12: Ensure realtime is enabled for all required tables
DO $$
BEGIN
  -- Enable realtime for messages
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    RAISE NOTICE 'Added messages to realtime';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'messages already in realtime';
  END;
  
  -- Enable realtime for chat_threads
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
    RAISE NOTICE 'Added chat_threads to realtime';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'chat_threads already in realtime';
  END;

  -- Enable realtime for user_status
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
    RAISE NOTICE 'Added user_status to realtime';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'user_status already in realtime';
  END;
END $$;

-- Step 13: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION
-- ========================================

DO $$
DECLARE
  msg_policies INTEGER;
  thread_policies INTEGER;
  status_policies INTEGER;
  realtime_tables INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO msg_policies FROM pg_policies WHERE tablename = 'messages';
  SELECT COUNT(*) INTO thread_policies FROM pg_policies WHERE tablename = 'chat_threads';
  SELECT COUNT(*) INTO status_policies FROM pg_policies WHERE tablename = 'user_status';
  
  -- Count realtime tables
  SELECT COUNT(*) INTO realtime_tables 
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'chat_threads', 'user_status');
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'messages policies: % active', msg_policies;
  RAISE NOTICE 'chat_threads policies: % active', thread_policies;
  RAISE NOTICE 'user_status policies: % active', status_policies;
  RAISE NOTICE 'realtime tables: % enabled', realtime_tables;
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 Ready to test messaging!';
  RAISE NOTICE '';
END $$;
