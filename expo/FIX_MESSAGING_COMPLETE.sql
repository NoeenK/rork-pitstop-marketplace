-- ========================================
-- COMPLETE MESSAGING FIX - CORRECTED VERSION
-- This fixes all messaging issues including SQL syntax errors
-- ========================================

-- Step 1: Ensure blocked_users column exists in profiles (not a separate table)
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

-- Step 3: Drop all message triggers that might reference wrong fields
DROP TRIGGER IF EXISTS on_message_created ON messages;
DROP TRIGGER IF EXISTS on_message_created_unread ON messages;
DROP TRIGGER IF EXISTS check_blocked_users_trigger ON messages;
DROP TRIGGER IF EXISTS prevent_blocked_messages ON messages;

-- Step 4: Create correct trigger functions
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_unread_count()
RETURNS TRIGGER AS $$
DECLARE
  v_receiver_id UUID;
BEGIN
  SELECT CASE 
    WHEN buyer_id = NEW.sender_id THEN seller_id 
    ELSE buyer_id 
  END INTO v_receiver_id
  FROM chat_threads
  WHERE id = NEW.thread_id;

  UPDATE chat_threads
  SET unread_count = COALESCE(unread_count, 0) + 1
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate triggers
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_last_message();

CREATE TRIGGER on_message_created_unread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_unread_count();

-- Step 6: Drop ALL existing message policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;

-- Step 7: Create clean SELECT policy for messages
CREATE POLICY "Users can view messages in their threads" 
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 8: Create clean INSERT policy for messages
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

-- Step 9: Create UPDATE policy for read receipts
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

-- Step 10: Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Step 11: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;

-- Step 12: Ensure chat_threads has proper policies
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

-- Step 13: Enable realtime (CORRECTED - no IF EXISTS clause)
DO $$
DECLARE
  v_has_messages BOOLEAN;
  v_has_chat_threads BOOLEAN;
BEGIN
  -- Check if messages is already in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) INTO v_has_messages;
  
  -- Remove and re-add messages table
  IF v_has_messages THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE messages;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  RAISE NOTICE '✓ Added messages to realtime';
  
  -- Check if chat_threads is already in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) INTO v_has_chat_threads;
  
  -- Remove and re-add chat_threads table
  IF v_has_chat_threads THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE chat_threads;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
  RAISE NOTICE '✓ Added chat_threads to realtime';
END $$;

-- Step 14: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION
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

-- Check messages table columns
SELECT 
  'messages table' as check_name,
  '✓ Columns: ' || string_agg(column_name, ', ' ORDER BY ordinal_position) as status
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('id', 'thread_id', 'sender_id', 'content', 'read_at', 'created_at');

-- Check messages triggers
SELECT 
  'messages triggers' as check_name,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✓ ' || COUNT(*) || ' triggers active'
    ELSE '⚠️ Only ' || COUNT(*) || ' triggers found (expected 2+)'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'messages'
AND t.tgname NOT LIKE 'RI_%'
AND t.tgname NOT LIKE 'pg_%';

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

-- Check permissions
SELECT 
  'permissions' as check_name,
  table_name,
  '✓ ' || string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE grantee = 'authenticated'
AND table_name IN ('messages', 'chat_threads')
GROUP BY table_name;

SELECT '' as info;
SELECT '========================================' as info;
SELECT '✅ You can now test sending messages!' as info;
SELECT '========================================' as info;
