# SQL Commands for Supabase SQL Editor

⚠️ **IMPORTANT**: Do NOT copy the markdown code blocks (```sql). Instead, use the `.sql` files I created:
- **STEP1_MAIN_SCHEMA.sql** - Copy the entire contents of this file
- **STEP2_REALTIME_CHAT.sql** - Copy the entire contents of this file

## Quick Instructions:

1. Open **STEP1_MAIN_SCHEMA.sql** file
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Open **STEP2_REALTIME_CHAT.sql** file  
6. Copy ALL contents (Ctrl+A, Ctrl+C)
7. Paste into Supabase SQL Editor
8. Click "Run"

---

## Alternative: If you want to copy from here, use the code below (without the ```sql markers):

### Step 1: Main Schema

-- PITSTOP Marketplace - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  username TEXT UNIQUE,
  phone_number TEXT,
  team_number INTEGER,
  school_name TEXT,
  city TEXT,
  country TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trades_completed INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  response_rate NUMERIC(3,2) DEFAULT 0,
  avg_response_time TEXT DEFAULT '0 min',
  blocked_users UUID[] DEFAULT '{}',
  CONSTRAINT username_length CHECK (username IS NULL OR char_length(username) >= 3)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  price_cents INTEGER,
  is_swap_only BOOLEAN DEFAULT FALSE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  season_tag TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_at TIMESTAMP WITH TIME ZONE,
  boosted_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  chat_count INTEGER DEFAULT 0,
  CONSTRAINT title_length CHECK (char_length(title) >= 3)
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (true);

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = seller_id);

-- Chat threads table
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own threads" ON chat_threads
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create threads" ON chat_threads
  FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can update their threads" ON chat_threads
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  offer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT text_length CHECK (char_length(text) > 0)
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their threads" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = messages.thread_id
      AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = thread_id
      AND (chat_threads.buyer_id = auth.uid() OR chat_threads.seller_id = auth.uid())
    )
  );

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offered_price_cents INTEGER,
  proposed_swap_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view offers for their listings" ON offers
  FOR SELECT USING (
    auth.uid() = buyer_id OR
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = offers.listing_id AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can create offers" ON offers
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Listing owners can update offer status" ON offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = offers.listing_id AND listings.seller_id = auth.uid()
    )
  );

-- Saved listings table
CREATE TABLE IF NOT EXISTS saved_listings (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved listings" ON saved_listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings" ON saved_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave listings" ON saved_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, listing_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Activity/Notifications table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_buyer_id ON chat_threads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_seller_id ON chat_threads(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_listing_id ON chat_threads(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_team_number INTEGER;
BEGIN
  -- Safely parse team_number, default to NULL if invalid
  BEGIN
    v_team_number := (new.raw_user_meta_data->>'team_number')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_team_number := NULL;
  END;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    username,
    phone_number,
    team_number,
    school_name,
    created_at
  )
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      'User'
    ),
    COALESCE(new.raw_user_meta_data->>'username', NULL),
    COALESCE(new.raw_user_meta_data->>'phone_number', NULL),
    v_team_number,
    COALESCE(new.raw_user_meta_data->>'team_name', new.raw_user_meta_data->>'school_name', ''),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update thread's last_message_at when a new message is sent
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update thread timestamp
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_last_message();

-- Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON email_verification_codes(expires_at);

ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert verification codes (needed during signup)
CREATE POLICY "Anyone can create verification codes" ON email_verification_codes
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read their own verification codes
CREATE POLICY "Users can read verification codes for their email" ON email_verification_codes
  FOR SELECT USING (true);

-- Grant access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

## Step 2: Run Real-time Chat Setup (Copy and paste ALL of this)

```sql
-- Enhanced Real-time Chat Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Function to increment unread count for receiver
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
DECLARE
  receiver_id UUID;
  thread_buyer_id UUID;
  thread_seller_id UUID;
BEGIN
  -- Get the thread's buyer and seller IDs
  SELECT buyer_id, seller_id INTO thread_buyer_id, thread_seller_id
  FROM chat_threads
  WHERE id = NEW.thread_id;

  -- Determine who the receiver is (opposite of sender)
  IF NEW.sender_id = thread_buyer_id THEN
    receiver_id := thread_seller_id;
  ELSE
    receiver_id := thread_buyer_id;
  END IF;

  -- Increment unread count for the receiver's thread
  UPDATE chat_threads
  SET 
    unread_count = unread_count + 1,
    last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_message_created_increment_unread ON messages;

-- Create trigger for incrementing unread count
CREATE TRIGGER on_message_created_increment_unread
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();

-- Ensure Realtime is enabled for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Create indexes for better realtime performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message ON chat_threads(last_message_at DESC);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;
```

## Instructions:

1. **Go to Supabase Dashboard**: https://levfwegihveainqdnwkv.supabase.co
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New Query"**
4. **Copy and paste Step 1 SQL** (the entire first block above)
5. **Click "Run"** (or press Ctrl+Enter)
6. **Wait for success message**
7. **Click "New Query" again**
8. **Copy and paste Step 2 SQL** (the entire second block above)
9. **Click "Run"** again
10. **Done!** ✅

## After Running SQL:

1. **Enable Realtime** (if not already enabled):
   - Go to **Database** → **Replication**
   - Find `chat_threads` table → Toggle ON
   - Find `messages` table → Toggle ON

2. **Verify Setup**:
   - Go to **Table Editor**
   - You should see these tables: `profiles`, `listings`, `chat_threads`, `messages`, `offers`, `saved_listings`, `reviews`, `activities`

## Troubleshooting:

- **Error: "relation already exists"** → Tables already created, that's OK, continue
- **Error: "permission denied"** → Make sure you're using the SQL Editor (not Table Editor)
- **Error: "publication does not exist"** → The realtime publication should exist by default, if not, contact Supabase support

