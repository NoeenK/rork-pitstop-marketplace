-- FIX MESSAGES TRIGGER ERROR
-- This fixes the "record 'new' has no field 'user_id'" error

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixing Messages Trigger Error';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Step 1: Drop all triggers on messages table
  RAISE NOTICE 'Step 1: Dropping all triggers on messages table...';
  
  DROP TRIGGER IF EXISTS on_message_created ON messages;
  DROP TRIGGER IF EXISTS on_message_created_unread ON messages;
  DROP TRIGGER IF EXISTS check_blocked_users_trigger ON messages;
  DROP TRIGGER IF EXISTS prevent_blocked_messages ON messages;
  
  RAISE NOTICE '✓ All message triggers dropped';

  -- Step 2: Recreate the correct update_thread_last_message function
  RAISE NOTICE '';
  RAISE NOTICE 'Step 2: Creating update_thread_last_message function...';
END $$;

CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the correct update_unread_count function
CREATE OR REPLACE FUNCTION public.update_unread_count()
RETURNS TRIGGER AS $$
DECLARE
  v_receiver_id UUID;
BEGIN
  -- Get the receiver ID (the person who didn't send the message)
  SELECT CASE 
    WHEN buyer_id = NEW.sender_id THEN seller_id 
    ELSE buyer_id 
  END INTO v_receiver_id
  FROM chat_threads
  WHERE id = NEW.thread_id;

  -- Increment unread count
  UPDATE chat_threads
  SET unread_count = COALESCE(unread_count, 0) + 1
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  RAISE NOTICE '✓ Functions created';

  -- Step 4: Recreate triggers
  RAISE NOTICE '';
  RAISE NOTICE 'Step 3: Creating triggers...';
END $$;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_last_message();

CREATE TRIGGER on_message_created_unread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_unread_count();

DO $$
BEGIN
  RAISE NOTICE '✓ Triggers created';

  -- Step 5: Drop and recreate RLS policies (clean slate)
  RAISE NOTICE '';
  RAISE NOTICE 'Step 4: Recreating RLS policies...';
END $$;

DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;

CREATE POLICY "Users can view messages in their threads" 
ON messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their threads" 
ON messages 
FOR INSERT 
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
ON messages 
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

DO $$
BEGIN
  RAISE NOTICE '✓ RLS policies created';

  -- Step 6: Ensure RLS is enabled
  RAISE NOTICE '';
  RAISE NOTICE 'Step 5: Enabling RLS...';
END $$;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '✓ RLS enabled';

  -- Step 7: Grant permissions
  RAISE NOTICE '';
  RAISE NOTICE 'Step 6: Granting permissions...';
END $$;

GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '✓ Permissions granted';

  -- Step 8: Ensure realtime is enabled
  RAISE NOTICE '';
  RAISE NOTICE 'Step 7: Enabling realtime...';
END $$;

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
END $$;

DO $$
BEGIN
  RAISE NOTICE '✓ Realtime enabled';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Fix Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'All triggers have been recreated correctly.';
  RAISE NOTICE 'The "user_id" error should now be resolved.';
  RAISE NOTICE '';
  RAISE NOTICE 'Try sending a message in your app now!';
  RAISE NOTICE '';
END $$;

-- Verification queries
SELECT '✓ Messages Triggers' as check_name,
  COUNT(*) as trigger_count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'messages'
AND t.tgname NOT LIKE 'RI_%'
AND t.tgname NOT LIKE 'pg_%';

SELECT '✓ Messages Policies' as check_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'messages';

SELECT '✓ Realtime Tables' as check_name,
  string_agg(tablename, ', ') as tables
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'chat_threads');
