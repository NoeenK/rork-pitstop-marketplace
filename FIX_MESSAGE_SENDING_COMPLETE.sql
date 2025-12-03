-- Complete Fix for Message Sending Issues
-- Run this in Supabase SQL Editor

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting Complete Message Sending Fix';
  RAISE NOTICE '========================================';
  
  -- Step 1: Ensure messages table has correct structure
  RAISE NOTICE '';
  RAISE NOTICE 'Step 1: Checking messages table structure...';
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✓ Added read_at column';
  ELSE
    RAISE NOTICE '✓ read_at column exists';
  END IF;

  -- Step 2: Drop ALL existing policies on messages
  RAISE NOTICE '';
  RAISE NOTICE 'Step 2: Removing old policies...';
  
  DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;
  
  RAISE NOTICE '✓ Removed all old policies';

  -- Step 3: Create SELECT policy (view messages)
  RAISE NOTICE '';
  RAISE NOTICE 'Step 3: Creating SELECT policy...';
  
  CREATE POLICY "Users can view messages in their threads" ON messages
    FOR SELECT 
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
  
  RAISE NOTICE '✓ Created SELECT policy';

  -- Step 4: Create INSERT policy (send messages)
  RAISE NOTICE '';
  RAISE NOTICE 'Step 4: Creating INSERT policy...';
  
  CREATE POLICY "Users can send messages in their threads" ON messages
    FOR INSERT 
    WITH CHECK (
      -- User must be authenticated
      auth.uid() IS NOT NULL
      -- User must match sender_id
      AND auth.uid() = sender_id
      -- User must be part of the thread
      AND EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = thread_id
        AND (
          chat_threads.buyer_id = auth.uid() 
          OR chat_threads.seller_id = auth.uid()
        )
      )
    );
  
  RAISE NOTICE '✓ Created INSERT policy';

  -- Step 5: Create UPDATE policy (read receipts)
  RAISE NOTICE '';
  RAISE NOTICE 'Step 5: Creating UPDATE policy...';
  
  CREATE POLICY "Users can update messages in their threads" ON messages
    FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = messages.thread_id
        AND (
          chat_threads.buyer_id = auth.uid() 
          OR chat_threads.seller_id = auth.uid()
        )
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = messages.thread_id
        AND (
          chat_threads.buyer_id = auth.uid() 
          OR chat_threads.seller_id = auth.uid()
        )
      )
    );
  
  RAISE NOTICE '✓ Created UPDATE policy';

  -- Step 6: Ensure RLS is enabled
  RAISE NOTICE '';
  RAISE NOTICE 'Step 6: Enabling RLS...';
  
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE '✓ RLS enabled on messages and chat_threads';

  -- Step 7: Grant permissions
  RAISE NOTICE '';
  RAISE NOTICE 'Step 7: Granting permissions...';
  
  GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
  GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
  
  RAISE NOTICE '✓ Permissions granted to authenticated users';

  -- Step 8: Ensure realtime is enabled
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

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
    RAISE NOTICE '✓ Added chat_threads to realtime';
  ELSE
    RAISE NOTICE '✓ Chat_threads already in realtime';
  END IF;

  -- Step 9: Verify chat_threads policies exist
  RAISE NOTICE '';
  RAISE NOTICE 'Step 9: Checking chat_threads policies...';
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_threads' AND policyname LIKE '%can view%'
  ) THEN
    CREATE POLICY "Users can view their chat threads" ON chat_threads
      FOR SELECT 
      USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
      );
    RAISE NOTICE '✓ Created SELECT policy for chat_threads';
  ELSE
    RAISE NOTICE '✓ chat_threads SELECT policy exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_threads' AND policyname LIKE '%can create%'
  ) THEN
    CREATE POLICY "Users can create chat threads" ON chat_threads
      FOR INSERT 
      WITH CHECK (
        auth.uid() = buyer_id OR auth.uid() = seller_id
      );
    RAISE NOTICE '✓ Created INSERT policy for chat_threads';
  ELSE
    RAISE NOTICE '✓ chat_threads INSERT policy exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_threads' AND policyname LIKE '%can update%'
  ) THEN
    CREATE POLICY "Users can update their chat threads" ON chat_threads
      FOR UPDATE 
      USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
      )
      WITH CHECK (
        buyer_id = auth.uid() OR seller_id = auth.uid()
      );
    RAISE NOTICE '✓ Created UPDATE policy for chat_threads';
  ELSE
    RAISE NOTICE '✓ chat_threads UPDATE policy exists';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Complete Fix Applied Successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Try sending a message in the app';
  RAISE NOTICE '2. Check browser console for detailed logs';
  RAISE NOTICE '3. If it still fails, run the diagnostic query below';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Verification Results';
  RAISE NOTICE '========================================';
  
END $;

-- Check messages policies
SELECT 
  '✓ Messages Policies' as status,
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'View messages'
    WHEN cmd = 'INSERT' THEN 'Send messages'
    WHEN cmd = 'UPDATE' THEN 'Read receipts'
  END as description
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

-- Check realtime tables
SELECT 
  '✓ Realtime Tables' as status,
  string_agg(tablename, ', ') as tables
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('messages', 'chat_threads');

-- Check permissions
SELECT 
  '✓ Permissions' as status,
  table_name,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_name IN ('messages', 'chat_threads')
AND grantee = 'authenticated'
GROUP BY table_name, grantee
ORDER BY table_name;
