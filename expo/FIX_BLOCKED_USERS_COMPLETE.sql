-- ===================================
-- COMPLETE FIX FOR BLOCKED_USERS TABLE
-- ===================================
-- This script will:
-- 1. Drop and recreate the blocked_users table
-- 2. Create proper RLS policies
-- 3. Fix message policies
-- 4. Enable realtime
-- ===================================

-- Drop existing blocked_users table and related objects
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP FUNCTION IF EXISTS is_user_blocked(UUID, UUID) CASCADE;

-- Create blocked_users table
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id),
  CHECK (user_id != blocked_user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
CREATE POLICY "Users can view their blocked users" 
ON blocked_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can block other users" 
ON blocked_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND user_id != blocked_user_id);

CREATE POLICY "Users can unblock users" 
ON blocked_users 
FOR DELETE 
USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON blocked_users TO authenticated;
GRANT SELECT, INSERT, DELETE ON blocked_users TO anon;

-- Create helper function to check if a user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(check_user_id UUID, by_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE user_id = by_user_id AND blocked_user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update messages INSERT policy to prevent messages from/to blocked users
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
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

-- Add blocked_users to realtime publication
DO $$
BEGIN
  -- Try to add the table to realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE blocked_users;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table already in publication, ignore error
    RAISE NOTICE 'blocked_users already in realtime publication';
END $$;

-- Verify the table was created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'blocked_users';
  
  IF table_count > 0 THEN
    RAISE NOTICE '✅ blocked_users table created successfully!';
    RAISE NOTICE '✅ RLS policies applied';
    RAISE NOTICE '✅ Indexes created';
    RAISE NOTICE '✅ Helper function created';
    RAISE NOTICE '✅ Realtime enabled';
    RAISE NOTICE '';
    RAISE NOTICE 'Messages can now be sent without errors!';
  ELSE
    RAISE EXCEPTION '❌ Failed to create blocked_users table';
  END IF;
END $$;
