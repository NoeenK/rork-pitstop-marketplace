-- ========================================
-- COMPLETE REALTIME CHAT SYSTEM SETUP
-- Run this SQL in your Supabase SQL Editor
-- ========================================

-- 1. Make listing_id nullable in chat_threads to support direct messaging
ALTER TABLE chat_threads 
ALTER COLUMN listing_id DROP NOT NULL;

-- 2. Drop the old UNIQUE constraint (listing_id, buyer_id, seller_id)
ALTER TABLE chat_threads 
DROP CONSTRAINT IF EXISTS chat_threads_listing_id_buyer_id_seller_id_key;

-- 3. Add new UNIQUE constraint for listing-based chats
-- This prevents duplicate threads for the same listing + buyer + seller combination
CREATE UNIQUE INDEX IF NOT EXISTS unique_listing_thread 
ON chat_threads (listing_id, buyer_id, seller_id) 
WHERE listing_id IS NOT NULL;

-- 4. Add UNIQUE constraint for direct chats (no listing)
-- This prevents duplicate direct message threads between two users
CREATE UNIQUE INDEX IF NOT EXISTS unique_direct_thread 
ON chat_threads (LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id)) 
WHERE listing_id IS NULL;

-- 5. Create user_status table for online/offline tracking
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Everyone can see user status
CREATE POLICY "User status is viewable by everyone" ON user_status
  FOR SELECT USING (true);

-- Users can update their own status
CREATE POLICY "Users can update own status" ON user_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status" ON user_status
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Enable Realtime for all chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS user_status;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message_at ON chat_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_status_user_id ON user_status(user_id);

-- ========================================
-- VERIFICATION QUERIES
-- Run these to verify everything is set up correctly
-- ========================================

-- Check chat_threads structure
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_threads' 
ORDER BY ordinal_position;

-- Check messages structure
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- Check user_status structure
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_status' 
ORDER BY ordinal_position;

-- Check realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- ========================================
-- HOW TO USE
-- ========================================
-- 
-- LISTING-BASED CHAT:
-- When someone clicks "Chat with Seller" on a listing:
-- 1. Create thread with listing_id, buyer_id, seller_id
-- 2. Messages are sent in this thread
-- 3. Both users see the conversation
--
-- DIRECT MESSAGING:
-- When someone selects a user from contacts:
-- 1. Create thread with listing_id = NULL, buyer_id, seller_id
-- 2. buyer_id and seller_id are sorted alphabetically
-- 3. Messages work the same way
--
-- REALTIME UPDATES:
-- 1. Subscribe to messages table with filter: thread_id=eq.{threadId}
-- 2. Subscribe to chat_threads table with filter: buyer_id=eq.{userId} OR seller_id=eq.{userId}
-- 3. Subscribe to user_status table to see online/offline status
--
-- ========================================
