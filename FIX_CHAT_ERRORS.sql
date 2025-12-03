-- ========================================
-- FIX CHAT ERRORS - Clean Fix
-- ========================================

-- Step 1: Add blocked_users column to profiles if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'blocked_users'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN blocked_users UUID[] DEFAULT '{}';
    RAISE NOTICE 'Added blocked_users column to profiles';
  ELSE
    RAISE NOTICE 'blocked_users column already exists';
  END IF;
END $$;

-- Step 2: Add read_at column to messages if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages 
    ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added read_at column to messages';
  ELSE
    RAISE NOTICE 'read_at column already exists';
  END IF;
END $$;

-- Step 3: Make listing_id nullable in chat_threads
ALTER TABLE chat_threads ALTER COLUMN listing_id DROP NOT NULL;

-- Step 4: Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;

-- Step 5: Create clean SELECT policy
CREATE POLICY "Users can view messages in their threads" 
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 6: Create clean INSERT policy (no blocked_users check)
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

-- Step 7: Create clean UPDATE policy
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

-- Step 9: Grant permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;

-- Step 10: Ensure chat_threads policies exist
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

-- Step 11: Create user_status table if missing
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User status is viewable by everyone" ON user_status;
DROP POLICY IF EXISTS "Users can insert own status" ON user_status;
DROP POLICY IF EXISTS "Users can update own status" ON user_status;

CREATE POLICY "User status is viewable by everyone" 
ON user_status FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own status" 
ON user_status FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status" 
ON user_status FOR UPDATE 
USING (auth.uid() = user_id);

-- Step 12: Enable realtime
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

-- Step 13: Create mark_messages_as_read function
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

-- Step 14: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

SELECT 'Step 1: Checking blocked_users column...' as status;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'blocked_users';

SELECT 'Step 2: Checking messages policies...' as status;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY cmd;

SELECT 'Step 3: Checking chat_threads policies...' as status;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'chat_threads'
ORDER BY cmd;

SELECT 'Step 4: Checking realtime publications...' as status;
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'chat_threads', 'user_status')
ORDER BY tablename;

SELECT 'All fixes completed successfully!' as final_status;
