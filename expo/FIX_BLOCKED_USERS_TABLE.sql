-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id),
  CHECK (user_id != blocked_user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
DROP POLICY IF EXISTS "Users can view their blocked users" ON blocked_users;
CREATE POLICY "Users can view their blocked users" 
ON blocked_users 
FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can block other users" ON blocked_users;
CREATE POLICY "Users can block other users" 
ON blocked_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND user_id != blocked_user_id);

DROP POLICY IF EXISTS "Users can unblock users" ON blocked_users;
CREATE POLICY "Users can unblock users" 
ON blocked_users 
FOR DELETE 
USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON blocked_users TO authenticated;

-- Function to check if a user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(check_user_id UUID, by_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE user_id = by_user_id AND blocked_user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update messages policies to prevent messages from blocked users
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
    AND NOT is_user_blocked(
      auth.uid(), 
      CASE 
        WHEN chat_threads.buyer_id = auth.uid() THEN chat_threads.seller_id
        ELSE chat_threads.buyer_id
      END
    )
  )
);

-- Enable realtime for blocked_users
ALTER PUBLICATION supabase_realtime ADD TABLE blocked_users;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Blocked users table created successfully!';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Realtime enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '1. Block users: INSERT INTO blocked_users (user_id, blocked_user_id) VALUES (your_id, blocked_id)';
  RAISE NOTICE '2. Unblock users: DELETE FROM blocked_users WHERE user_id = your_id AND blocked_user_id = blocked_id';
  RAISE NOTICE '3. Check if blocked: SELECT is_user_blocked(user_id, by_user_id)';
END $$;
