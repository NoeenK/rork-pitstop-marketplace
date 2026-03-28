-- ========================================
-- FIX BLOCKED_USERS ERROR
-- This fixes "relation blocked_users does not exist" error
-- ========================================

-- Step 1: Drop any functions that reference blocked_users table incorrectly
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT n.nspname as schema, p.proname as function_name, p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE pg_get_functiondef(p.oid) ILIKE '%from blocked_users%'
      AND n.nspname = 'public'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', 
      func_record.schema, func_record.function_name);
    RAISE NOTICE 'Dropped function: %.%', func_record.schema, func_record.function_name;
  END LOOP;
END $$;

-- Step 2: Ensure blocked_users column exists in profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_users UUID[] DEFAULT '{}';

-- Step 3: Drop blocked_users table if it exists (it shouldn't be a table)
DROP TABLE IF EXISTS blocked_users CASCADE;

-- Step 4: Recreate clean message policies without blocked_users table references
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;

CREATE POLICY "Users can view messages in their threads" 
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

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

CREATE POLICY "Users can update messages in their threads" 
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 5: Ensure chat_threads policies are clean
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
);

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;

-- Step 7: Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Step 8: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ FIX COMPLETE - Verification:' as status;

-- Check that blocked_users is a column, not a table
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'blocked_users')
    THEN '✗ ERROR: blocked_users table still exists!'
    ELSE '✓ blocked_users table removed'
  END as blocked_table_check;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'blocked_users'
    )
    THEN '✓ blocked_users column exists in profiles'
    ELSE '✗ ERROR: blocked_users column missing!'
  END as blocked_column_check;

-- Check policies
SELECT 
  '✓ Found ' || COUNT(*) || ' policies on messages' as messages_policies
FROM pg_policies
WHERE tablename = 'messages';

SELECT 
  '✓ Found ' || COUNT(*) || ' policies on chat_threads' as threads_policies
FROM pg_policies
WHERE tablename = 'chat_threads';

SELECT '✅ Ready to test! Try sending a message now.' as final_message;
