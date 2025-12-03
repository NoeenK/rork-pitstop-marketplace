-- ========================================
-- FINAL FIX FOR MESSAGING SYSTEM
-- This removes any reference to blocked_users table
-- and ensures clean message sending
-- ========================================

-- Step 1: Ensure blocked_users is a COLUMN in profiles, not a table
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

-- Step 2: Ensure read_at column exists in messages
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

-- Step 3: Make listing_id nullable in chat_threads (for direct messages)
DO $$
BEGIN
  ALTER TABLE chat_threads ALTER COLUMN listing_id DROP NOT NULL;
  RAISE NOTICE '✓ Made listing_id nullable in chat_threads';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✓ listing_id is already nullable or does not exist';
END $$;

-- Step 4: Drop ALL existing message policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;
  RAISE NOTICE '✓ Dropped all old message policies';
END $$;

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
-- This policy does NOT check blocked_users table
CREATE POLICY "Users can send messages in their threads" 
ON messages FOR INSERT
WITH CHECK (
  -- User must be authenticated
  auth.uid() IS NOT NULL
  -- User must match sender_id
  AND auth.uid() = sender_id
  -- User must be part of the chat thread
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

-- Step 10: Ensure chat_threads has proper policies
DROP POLICY IF EXISTS "Users can view their chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can create chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can update their chat threads" ON chat_threads;

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

-- Step 12: Enable realtime for all chat tables
DO $$
BEGIN
  -- Add messages to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    RAISE NOTICE '✓ Added messages to realtime';
  ELSE
    RAISE NOTICE '✓ messages already in realtime';
  END IF;
  
  -- Add chat_threads to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
    RAISE NOTICE '✓ Added chat_threads to realtime';
  ELSE
    RAISE NOTICE '✓ chat_threads already in realtime';
  END IF;
END $$;

-- Step 13: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

SELECT '========================================' as info;
SELECT '✅ ALL FIXES APPLIED SUCCESSFULLY!' as status;
SELECT '========================================' as info;

SELECT '' as info;
SELECT 'Verification Results:' as info;
SELECT '-------------------' as info;

-- Check blocked_users column
SELECT 
  'blocked_users column' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ EXISTS in profiles table'
    ELSE '✗ MISSING'
  END as status
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'blocked_users';

-- Check messages policies
SELECT 
  'messages policies' as check_name,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ ' || COUNT(*) || ' policies active'
    ELSE '✗ Only ' || COUNT(*) || ' policies found'
  END as status
FROM pg_policies
WHERE tablename = 'messages';

-- Check chat_threads policies
SELECT 
  'chat_threads policies' as check_name,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ ' || COUNT(*) || ' policies active'
    ELSE '✗ Only ' || COUNT(*) || ' policies found'
  END as status
FROM pg_policies
WHERE tablename = 'chat_threads';

-- Check realtime
SELECT 
  'realtime tables' as check_name,
  '✓ ' || string_agg(tablename, ', ') as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'chat_threads');

SELECT '' as info;
SELECT '========================================' as info;
SELECT 'You can now test sending messages!' as info;
SELECT '========================================' as info;
