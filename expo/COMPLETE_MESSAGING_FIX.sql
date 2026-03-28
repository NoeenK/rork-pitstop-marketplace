-- ========================================
-- COMPLETE MESSAGING SYSTEM FIX
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Ensure blocked_users column exists in profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_users UUID[] DEFAULT '{}';

-- Step 2: Ensure read_at column exists in messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Make listing_id nullable in chat_threads (for direct messages)
ALTER TABLE chat_threads 
ALTER COLUMN listing_id DROP NOT NULL;

-- Step 4: Drop ALL existing message policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;

-- Step 5: Create clean SELECT policy for messages
CREATE POLICY "Users can view messages in their threads" 
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 6: Create clean INSERT policy for messages
CREATE POLICY "Users can send messages in their threads" 
ON messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 7: Create UPDATE policy for read receipts
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

-- Step 8: Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Step 9: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;

-- Step 10: Drop and recreate chat_threads policies
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

-- Step 11: Create user_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view user status" ON user_status;
DROP POLICY IF EXISTS "Users can update own status" ON user_status;

CREATE POLICY "Anyone can view user status" 
ON user_status FOR SELECT
USING (true);

CREATE POLICY "Users can update own status" 
ON user_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status update" 
ON user_status FOR UPDATE
USING (auth.uid() = user_id);

-- Step 12: Create or replace mark_messages_as_read function
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

-- Step 13: Ensure realtime is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
  END IF;
END $$;

-- Step 14: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ Setup complete! Verifying configuration...' as status;

-- Check blocked_users column
SELECT 
  'blocked_users column: ' || 
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as check_result
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'blocked_users';

-- Check messages policies
SELECT 
  'messages policies: ✓ ' || COUNT(*) || ' active' as check_result
FROM pg_policies
WHERE tablename = 'messages';

-- Check chat_threads policies
SELECT 
  'chat_threads policies: ✓ ' || COUNT(*) || ' active' as check_result
FROM pg_policies
WHERE tablename = 'chat_threads';

-- Check realtime tables
SELECT 
  'realtime: ✓ enabled for ' || string_agg(tablename, ', ') as check_result
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'chat_threads', 'user_status');

SELECT '✅ All fixes applied! Test sending messages now.' as final_status;
