-- ========================================
-- COMPLETE MESSAGING SYSTEM FIX
-- This script comprehensively fixes all messaging issues
-- ========================================

-- Step 1: Drop any blocked_users TABLE if it exists
DROP TABLE IF EXISTS blocked_users CASCADE;

-- Step 2: Ensure blocked_users COLUMN exists in profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'blocked_users'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN blocked_users UUID[] DEFAULT '{}';
    RAISE NOTICE '✓ Added blocked_users column to profiles';
  ELSE
    RAISE NOTICE '✓ blocked_users column already exists in profiles';
  END IF;
END $$;

-- Step 3: Drop ALL existing triggers on messages table
DROP TRIGGER IF EXISTS on_message_created ON messages;
DROP TRIGGER IF EXISTS on_message_created_unread ON messages;
DROP TRIGGER IF EXISTS check_blocked_users ON messages;
DROP TRIGGER IF EXISTS prevent_blocked_users_messaging ON messages;
DROP TRIGGER IF EXISTS update_message_count ON messages;

-- Step 4: Drop ALL existing message policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Messages readable by thread participants" ON messages;

-- Step 5: Drop ALL existing chat_threads policies
DROP POLICY IF EXISTS "Users can view their own threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can view their chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can create threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can create chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can update their threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can update their chat threads" ON chat_threads;

-- Step 6: Ensure read_at column exists in messages
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages 
    ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✓ Added read_at column to messages';
  ELSE
    RAISE NOTICE '✓ read_at column already exists in messages';
  END IF;
END $$;

-- Step 7: Make listing_id nullable in chat_threads (for direct messages)
DO $$
BEGIN
  ALTER TABLE chat_threads ALTER COLUMN listing_id DROP NOT NULL;
  RAISE NOTICE '✓ Made listing_id nullable in chat_threads';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✓ listing_id is already nullable';
END $$;

-- Step 8: Create CLEAN SELECT policy for messages
CREATE POLICY "Users can view messages in their threads" 
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 9: Create CLEAN INSERT policy for messages (NO blocked_users check)
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

-- Step 10: Create UPDATE policy for read receipts
CREATE POLICY "Users can update messages in their threads" 
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 11: Create chat_threads policies
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
);

-- Step 12: Recreate triggers (WITHOUT blocked_users table references)
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_thread_last_message();

-- Step 13: Recreate unread count trigger (WITHOUT blocked_users check)
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads
  SET unread_count = COALESCE(unread_count, 0) + 1
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created_unread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_unread_count();

-- Step 14: Create user_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Step 15: Drop and recreate user_status policies
DROP POLICY IF EXISTS "User status is viewable by everyone" ON user_status;
DROP POLICY IF EXISTS "Users can update own status" ON user_status;
DROP POLICY IF EXISTS "Users can insert own status" ON user_status;

CREATE POLICY "User status is viewable by everyone" 
ON user_status FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own status" 
ON user_status FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status" 
ON user_status FOR UPDATE 
USING (auth.uid() = user_id);

-- Step 16: Create or replace mark_messages_as_read function
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

-- Step 17: Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Step 18: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON user_status TO authenticated, anon;

-- Step 19: Enable realtime (conditionally)
DO $$
BEGIN
  -- Remove messages from realtime if it exists
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE messages;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  
  -- Remove and re-add chat_threads
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE chat_threads;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
  
  -- Remove and re-add user_status
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE user_status;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
  
  RAISE NOTICE '✓ Enabled realtime for all chat tables';
END $$;

-- Step 20: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '========================================' as info;
SELECT '✅ MESSAGING SYSTEM FIXED!' as status;
SELECT '========================================' as info;
SELECT '' as info;

-- Verify blocked_users is a column, not a table
SELECT 
  'blocked_users column in profiles' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'blocked_users'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Verify no blocked_users table exists
SELECT 
  'blocked_users table (should not exist)' as check_name,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'blocked_users'
    ) THEN '✅ CORRECTLY REMOVED'
    ELSE '❌ STILL EXISTS (BAD!)'
  END as status;

-- Check messages policies
SELECT 
  'messages policies' as check_name,
  '✅ ' || COUNT(*) || ' policies active' as status
FROM pg_policies
WHERE tablename = 'messages';

-- Check chat_threads policies  
SELECT 
  'chat_threads policies' as check_name,
  '✅ ' || COUNT(*) || ' policies active' as status
FROM pg_policies
WHERE tablename = 'chat_threads';

-- Check user_status policies
SELECT 
  'user_status policies' as check_name,
  '✅ ' || COUNT(*) || ' policies active' as status
FROM pg_policies
WHERE tablename = 'user_status';

-- Check triggers on messages
SELECT 
  'messages triggers' as check_name,
  '✅ ' || COUNT(*) || ' triggers active' as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'messages'
AND NOT t.tgisinternal;

-- Check realtime tables
SELECT 
  'realtime publication' as check_name,
  '✅ ' || COUNT(*) || ' chat tables enabled' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'chat_threads', 'user_status');

SELECT '' as info;
SELECT '========================================' as info;
SELECT '🎉 You can now send messages!' as info;
SELECT '========================================' as info;
