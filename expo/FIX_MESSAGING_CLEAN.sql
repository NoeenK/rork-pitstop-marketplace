-- Clean fix for messaging system errors
-- Run this in Supabase SQL Editor

-- Step 1: Drop problematic triggers if they exist
DROP TRIGGER IF EXISTS on_message_created_check_blocked ON messages;
DROP TRIGGER IF EXISTS check_blocked_users_trigger ON messages;

-- Step 2: Drop the function that references blocked_users table
DROP FUNCTION IF EXISTS check_blocked_users();
DROP FUNCTION IF EXISTS check_blocked_before_message();

-- Step 3: Make sure chat_threads can have NULL listing_id for direct messages
ALTER TABLE chat_threads ALTER COLUMN listing_id DROP NOT NULL;

-- Step 4: Add unique constraint for direct messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_direct_thread'
  ) THEN
    ALTER TABLE chat_threads 
    ADD CONSTRAINT unique_direct_thread 
    UNIQUE NULLS NOT DISTINCT (listing_id, buyer_id, seller_id);
  END IF;
END $$;

-- Step 5: Create user_status table for online presence
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_status
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- User status policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_status' AND policyname = 'Anyone can view user status'
  ) THEN
    CREATE POLICY "Anyone can view user status" ON user_status FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_status' AND policyname = 'Users can insert own status'
  ) THEN
    CREATE POLICY "Users can insert own status" ON user_status 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_status' AND policyname = 'Users can update own status'
  ) THEN
    CREATE POLICY "Users can update own status" ON user_status 
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Step 6: Ensure messages and chat_threads are in realtime publication
DO $$
BEGIN
  -- Check if tables are in publication
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

-- Step 7: Verify the fixes
SELECT 
  'Messages table exists' as check_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') as result
UNION ALL
SELECT 
  'Chat threads table exists',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_threads')
UNION ALL
SELECT 
  'User status table exists',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_status')
UNION ALL
SELECT 
  'Messages in realtime publication',
  EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages')
UNION ALL
SELECT 
  'Chat threads in realtime publication',
  EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_threads')
UNION ALL
SELECT 
  'User status in realtime publication',
  EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_status');
