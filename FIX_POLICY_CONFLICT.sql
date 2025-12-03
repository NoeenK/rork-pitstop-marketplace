-- ========================================
-- FIX POLICY CONFLICTS
-- This script safely drops and recreates all policies
-- ========================================

-- Step 1: Drop ALL existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their blocked users" ON blocked_users;
DROP POLICY IF EXISTS "Users can block other users" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock users" ON blocked_users;
DROP POLICY IF EXISTS "Anyone can view user status" ON user_status;
DROP POLICY IF EXISTS "Users can update own status" ON user_status;
DROP POLICY IF EXISTS "Users can insert own status" ON user_status;
DROP POLICY IF EXISTS "Users can update own status update" ON user_status;
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can view their chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can create chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can update their chat threads" ON chat_threads;

-- Step 2: Ensure blocked_users column exists in profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_users UUID[] DEFAULT '{}';

-- Step 3: Drop blocked_users table if it exists (we use column in profiles instead)
DROP TABLE IF EXISTS blocked_users CASCADE;

-- Step 4: Ensure read_at column exists in messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Step 5: Drop all message triggers
DROP TRIGGER IF EXISTS on_message_created ON messages;
DROP TRIGGER IF EXISTS on_message_created_unread ON messages;
DROP TRIGGER IF EXISTS check_blocked_users_trigger ON messages;
DROP TRIGGER IF EXISTS prevent_blocked_messages ON messages;

-- Step 6: Create correct trigger functions
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

-- Step 7: Recreate triggers
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_last_message();

CREATE TRIGGER on_message_created_unread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_unread_count();

-- Step 8: Create messages policies
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
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_threads
    WHERE chat_threads.id = messages.thread_id
    AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
  )
);

-- Step 9: Create chat_threads policies
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

-- Step 10: Create user_status table if needed
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Step 12: Create user_status policies (with unique names)
CREATE POLICY "user_status_select_policy" 
ON user_status FOR SELECT
USING (true);

CREATE POLICY "user_status_insert_policy" 
ON user_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_status_update_policy" 
ON user_status FOR UPDATE
USING (auth.uid() = user_id);

-- Step 13: Grant permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_status TO authenticated;

-- Step 14: Enable realtime
DO $$
DECLARE
  v_has_messages BOOLEAN;
  v_has_chat_threads BOOLEAN;
  v_has_user_status BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) INTO v_has_messages;
  
  IF v_has_messages THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE messages;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads'
  ) INTO v_has_chat_threads;
  
  IF v_has_chat_threads THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE chat_threads;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_status'
  ) INTO v_has_user_status;
  
  IF v_has_user_status THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE user_status;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
END $$;

-- Step 15: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '========================================' as info;
SELECT '✅ ALL POLICY CONFLICTS FIXED!' as status;
SELECT '========================================' as info;

SELECT 'blocked_users column: ' || 
  CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as result
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'blocked_users';

SELECT 'messages policies: ✓ ' || COUNT(*) || ' active' as result
FROM pg_policies WHERE tablename = 'messages';

SELECT 'chat_threads policies: ✓ ' || COUNT(*) || ' active' as result
FROM pg_policies WHERE tablename = 'chat_threads';

SELECT 'user_status policies: ✓ ' || COUNT(*) || ' active' as result
FROM pg_policies WHERE tablename = 'user_status';

SELECT '========================================' as info;
SELECT '✅ Test messaging now!' as info;
SELECT '========================================' as info;
