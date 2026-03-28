# Fix Chat Messages - JSON Parse Error

## Problem
Messages are failing to send with error: "JSON Parse error: Unexpected character: N"

## Root Cause
The `chat_threads` table has `listing_id` set as `NOT NULL`, but the app tries to create direct user-to-user chats with `listing_id: null`. This violates the database constraint.

## Solution
Run the migration SQL to make `listing_id` optional.

### Steps:

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run this SQL migration**
   Copy and paste the entire content from `ADD_DIRECT_USER_CHATS.sql` file in your project root

   Or run this simplified version:

```sql
-- Make listing_id optional to support direct chats
ALTER TABLE chat_threads ALTER COLUMN listing_id DROP NOT NULL;

-- Update unique constraints
ALTER TABLE chat_threads DROP CONSTRAINT IF EXISTS chat_threads_listing_id_buyer_id_seller_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS unique_direct_chat ON chat_threads (buyer_id, seller_id) 
  WHERE listing_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_listing_chat ON chat_threads (listing_id, buyer_id, seller_id) 
  WHERE listing_id IS NOT NULL;

-- Create user_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User status is viewable by everyone" ON user_status
  FOR SELECT USING (true);

CREATE POLICY "Users can update own status" ON user_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own status" ON user_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
```

4. **Click "Run"** (or press Cmd/Ctrl + Enter)

5. **Verify Success**
   You should see "Success. No rows returned" or similar message

6. **Test the app**
   - Reload your app
   - Try sending a message
   - It should work now!

## What This Does
- Makes `listing_id` optional (nullable) in `chat_threads` table
- Allows both listing-based chats AND direct user-to-user chats
- Adds proper unique constraints for both types of chats
- Creates `user_status` table for online/offline tracking
- Sets up proper RLS policies for security

## After Running the Migration
The chat should work immediately. No app restart or code changes needed!
