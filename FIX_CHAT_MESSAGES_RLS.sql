-- Fix Chat Messages RLS and Permissions
-- Run this in Supabase SQL Editor to fix message sending issues

DO $$
BEGIN
  RAISE NOTICE 'Starting chat messages fix...';

  -- 1. Ensure messages table has all required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✓ Added read_at column to messages';
  END IF;

  -- 2. Drop all existing policies on messages table
  DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
  DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
  RAISE NOTICE '✓ Dropped old policies';

  -- 3. Create fresh SELECT policy for messages
  CREATE POLICY "Users can view messages in their threads" ON messages
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = messages.thread_id
        AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
      )
    );
  RAISE NOTICE '✓ Created SELECT policy';

  -- 4. Create fresh INSERT policy for messages
  CREATE POLICY "Users can send messages in their threads" ON messages
    FOR INSERT WITH CHECK (
      auth.uid() = sender_id AND
      EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = thread_id
        AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
      )
    );
  RAISE NOTICE '✓ Created INSERT policy';

  -- 5. Create fresh UPDATE policy for messages (for read receipts)
  CREATE POLICY "Users can update messages in their threads" ON messages
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = messages.thread_id
        AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
      )
    );
  RAISE NOTICE '✓ Created UPDATE policy';

  -- 6. Grant necessary permissions to authenticated users
  GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
  GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
  RAISE NOTICE '✓ Granted permissions';

  -- 7. Ensure messages table is in realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    RAISE NOTICE '✓ Added messages to realtime';
  ELSE
    RAISE NOTICE '✓ Messages already in realtime';
  END IF;

  -- 8. Ensure chat_threads table is in realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
    RAISE NOTICE '✓ Added chat_threads to realtime';
  ELSE
    RAISE NOTICE '✓ Chat_threads already in realtime';
  END IF;

  RAISE NOTICE '✅ Chat messages fix complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Try sending a message in the app';
  RAISE NOTICE '2. Check browser console for any errors';
  RAISE NOTICE '3. Verify that messages appear in real-time';
END $$;

-- Verify the setup
SELECT 
  'Messages policies' as check_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'messages';

SELECT 
  'Realtime tables' as check_name,
  string_agg(tablename, ', ') as tables
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('messages', 'chat_threads');
