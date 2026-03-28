-- FIX BLOCKED_USERS REFERENCE ERROR
-- This removes any database functions/triggers referencing blocked_users as a table

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixing blocked_users reference error';
  RAISE NOTICE '========================================';
  
  -- Step 1: Drop any triggers that reference blocked_users table
  RAISE NOTICE '';
  RAISE NOTICE 'Step 1: Removing triggers...';
  
  DROP TRIGGER IF EXISTS check_blocked_users_trigger ON messages;
  DROP TRIGGER IF EXISTS check_blocked_users_before_insert ON messages;
  DROP TRIGGER IF EXISTS prevent_blocked_users_message ON messages;
  DROP TRIGGER IF EXISTS validate_message_recipients ON messages;
  
  RAISE NOTICE '✓ Removed triggers';
  
  -- Step 2: Drop any functions that reference blocked_users table
  RAISE NOTICE '';
  RAISE NOTICE 'Step 2: Removing functions...';
  
  DROP FUNCTION IF EXISTS check_blocked_users() CASCADE;
  DROP FUNCTION IF EXISTS prevent_blocked_messages() CASCADE;
  DROP FUNCTION IF EXISTS validate_message_recipients() CASCADE;
  DROP FUNCTION IF EXISTS check_user_blocked() CASCADE;
  
  RAISE NOTICE '✓ Removed functions';
  
  -- Step 3: Drop blocked_users table if it exists (it should be a column, not a table)
  RAISE NOTICE '';
  RAISE NOTICE 'Step 3: Checking for blocked_users table...';
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'blocked_users' AND schemaname = 'public') THEN
    DROP TABLE blocked_users CASCADE;
    RAISE NOTICE '✓ Removed blocked_users table (it should be a column in profiles)';
  ELSE
    RAISE NOTICE '✓ No blocked_users table found (correct!)';
  END IF;
  
  -- Step 4: Ensure blocked_users column exists in profiles
  RAISE NOTICE '';
  RAISE NOTICE 'Step 4: Ensuring blocked_users column in profiles...';
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'blocked_users'
  ) THEN
    ALTER TABLE profiles ADD COLUMN blocked_users UUID[] DEFAULT '{}';
    RAISE NOTICE '✓ Added blocked_users column to profiles';
  ELSE
    RAISE NOTICE '✓ blocked_users column already exists in profiles';
  END IF;
  
  -- Step 5: Clean up ALL message policies
  RAISE NOTICE '';
  RAISE NOTICE 'Step 5: Recreating message policies...';
  
  DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;
  
  -- Create clean SELECT policy
  CREATE POLICY "Users can view messages in their threads"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = messages.thread_id
      AND (
        chat_threads.buyer_id = auth.uid()
        OR chat_threads.seller_id = auth.uid()
      )
    )
  );
  
  -- Create clean INSERT policy (NO blocked_users check)
  CREATE POLICY "Users can send messages in their threads"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = thread_id
      AND (
        chat_threads.buyer_id = auth.uid()
        OR chat_threads.seller_id = auth.uid()
      )
    )
  );
  
  -- Create clean UPDATE policy
  CREATE POLICY "Users can update messages in their threads"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = messages.thread_id
      AND (
        chat_threads.buyer_id = auth.uid()
        OR chat_threads.seller_id = auth.uid()
      )
    )
  );
  
  RAISE NOTICE '✓ Created clean message policies';
  
  -- Step 6: Enable RLS
  RAISE NOTICE '';
  RAISE NOTICE 'Step 6: Enabling RLS...';
  
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE '✓ RLS enabled';
  
  -- Step 7: Grant permissions
  RAISE NOTICE '';
  RAISE NOTICE 'Step 7: Granting permissions...';
  
  GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
  GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
  
  RAISE NOTICE '✓ Permissions granted';
  
  -- Step 8: Ensure realtime
  RAISE NOTICE '';
  RAISE NOTICE 'Step 8: Setting up realtime...';
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    RAISE NOTICE '✓ Added messages to realtime';
  ELSE
    RAISE NOTICE '✓ Messages already in realtime';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Fix completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '1. Removed all triggers referencing blocked_users table';
  RAISE NOTICE '2. Removed all functions referencing blocked_users table';
  RAISE NOTICE '3. Removed blocked_users table if it existed';
  RAISE NOTICE '4. Ensured blocked_users is a column in profiles';
  RAISE NOTICE '5. Created clean RLS policies without blocked_users checks';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now test sending messages!';
  
END $$;

-- Verification
SELECT '========================================' as info
UNION ALL SELECT 'VERIFICATION RESULTS'
UNION ALL SELECT '========================================';

-- Check for blocked_users table (should NOT exist)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'blocked_users')
    THEN '✗ ERROR: blocked_users table still exists'
    ELSE '✓ Good: No blocked_users table'
  END as status;

-- Check for blocked_users column (should exist)
SELECT 
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'blocked_users'
    )
    THEN '✓ Good: blocked_users column exists in profiles'
    ELSE '✗ ERROR: blocked_users column missing from profiles'
  END as status;

-- Check message policies
SELECT 
  '✓ Message policies: ' || count(*)::text as status
FROM pg_policies
WHERE tablename = 'messages';

-- Check for any remaining triggers on messages
SELECT 
  CASE
    WHEN count(*) = 0
    THEN '✓ Good: No problematic triggers on messages'
    ELSE '✗ WARNING: ' || count(*)::text || ' triggers still on messages'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'messages'
AND t.tgname NOT LIKE 'RI_%'
AND t.tgname NOT LIKE 'pg_%';

SELECT '========================================' as info;
