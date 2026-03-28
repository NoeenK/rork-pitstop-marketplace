-- Update schema to support direct user-to-user chats (not just listing-based)
-- Run this in your Supabase SQL Editor

-- Make listing_id optional in chat_threads to support direct messages
ALTER TABLE chat_threads ALTER COLUMN listing_id DROP NOT NULL;

-- Update the unique constraint to allow multiple direct chats without listing_id
ALTER TABLE chat_threads DROP CONSTRAINT IF EXISTS chat_threads_listing_id_buyer_id_seller_id_key;

-- Add new constraint for direct chats
CREATE UNIQUE INDEX IF NOT EXISTS unique_direct_chat ON chat_threads (buyer_id, seller_id) 
  WHERE listing_id IS NULL;

-- Keep unique constraint for listing-based chats
CREATE UNIQUE INDEX IF NOT EXISTS unique_listing_chat ON chat_threads (listing_id, buyer_id, seller_id) 
  WHERE listing_id IS NOT NULL;

-- Add user_status table for online/offline tracking
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Allow users to view other users' status
CREATE POLICY "User status is viewable by everyone" ON user_status
  FOR SELECT USING (true);

-- Users can update their own status
CREATE POLICY "Users can update own status" ON user_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own status" ON user_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_status_is_online ON user_status(is_online);
CREATE INDEX IF NOT EXISTS idx_user_status_last_seen ON user_status(last_seen);

-- Enable Realtime for user_status
ALTER PUBLICATION supabase_realtime ADD TABLE user_status;

-- Add typing indicator table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view typing in their threads" ON typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = typing_indicators.thread_id
      AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update typing status" ON typing_indicators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify typing status" ON typing_indicators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete typing status" ON typing_indicators
  FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;

-- Update policies for chat_threads to allow direct chats
DROP POLICY IF EXISTS "Users can create threads" ON chat_threads;
CREATE POLICY "Users can create threads" ON chat_threads
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );
