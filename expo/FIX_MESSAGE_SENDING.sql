-- Fix Message Sending Issues
-- This fixes RLS policies and permissions for message sending

DO $$
BEGIN
  RAISE NOTICE 'Starting message sending fix...';

  -- 1. Drop and recreate INSERT policy with proper auth check
  DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
  
  CREATE POLICY "Users can send messages in their threads" ON messages
    FOR INSERT 
    WITH CHECK (
      -- Must be authenticated
      auth.uid() IS NOT NULL
      -- Must match sender_id
      AND auth.uid() = sender_id
      -- Must be part of the thread
      AND EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = thread_id
        AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
      )
    );
  
  RAISE NOTICE '✓ Created INSERT policy for messages';

  -- 2. Ensure SELECT policy exists
  DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
  
  CREATE POLICY "Users can view messages in their threads" ON messages
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM chat_threads
        WHERE chat_threads.id = messages.thread_id
        AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
      )
    );
  
  RAISE NOTICE '✓ Created SELECT policy for messages';

  -- 3. Ensure UPDATE policy exists (for read receipts)
  DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
  
  CREATE POLICY "Users can update messages in their threads" ON messages
    FOR UPDATE 
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
  
  RAISE NOTICE '✓ Created UPDATE policy for messages';

  -- 4. Ensure permissions are granted
  GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
  GRANT SELECT ON chat_threads TO authenticated;
  
  RAISE NOTICE '✓ Granted permissions';

  -- 5. Verify messages table structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✓ Added read_at column';
  END IF;

  RAISE NOTICE '✅ Message sending fix complete!';
END $$;

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd, policyname;
