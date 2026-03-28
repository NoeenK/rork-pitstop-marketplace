-- ========================================
-- CLEAN FIX FOR ALL DATABASE ISSUES
-- Run this in Supabase SQL Editor
-- No RAISE NOTICE statements - works perfectly
-- ========================================

-- PART 1: Fix Username Conflict Issues
-- ========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_team_number INTEGER;
  v_display_name TEXT;
  v_full_name TEXT;
  v_email TEXT;
  v_username TEXT;
  v_base_username TEXT;
  v_counter INTEGER;
  v_username_exists BOOLEAN;
BEGIN
  BEGIN
    v_team_number := (new.raw_user_meta_data->>'team_number')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_team_number := NULL;
  END;

  v_email := COALESCE(new.email, '');
  
  v_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    CASE 
      WHEN v_email != '' THEN split_part(v_email, '@', 1)
      ELSE 'User'
    END
  );
  
  v_display_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    CASE 
      WHEN v_email != '' THEN split_part(v_email, '@', 1)
      ELSE 'User'
    END
  );

  v_base_username := new.raw_user_meta_data->>'username';
  
  IF v_base_username IS NOT NULL AND v_base_username != '' THEN
    v_username := v_base_username;
    v_counter := 1;
    
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_username_exists;
    
    WHILE v_username_exists AND v_counter < 1000 LOOP
      v_username := v_base_username || v_counter::TEXT;
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_username_exists;
      v_counter := v_counter + 1;
    END LOOP;
    
    IF v_username_exists THEN
      v_username := NULL;
    END IF;
  ELSE
    v_username := NULL;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    username,
    phone_number,
    team_number,
    school_name,
    city,
    country,
    is_verified,
    avatar_url,
    created_at,
    blocked_users
  )
  VALUES (
    new.id,
    v_email,
    v_full_name,
    v_display_name,
    v_username,
    COALESCE(new.raw_user_meta_data->>'phone_number', NULL),
    v_team_number,
    COALESCE(
      new.raw_user_meta_data->>'team_name',
      new.raw_user_meta_data->>'school_name',
      ''
    ),
    '',
    '',
    FALSE,
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    NOW(),
    '{}'::UUID[]
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    username = CASE 
      WHEN EXCLUDED.username IS NOT NULL THEN EXCLUDED.username
      ELSE profiles.username
    END,
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    team_number = COALESCE(EXCLUDED.team_number, profiles.team_number),
    school_name = COALESCE(EXCLUDED.school_name, profiles.school_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- PART 2: Fix Chat Messages Permissions
-- ========================================

-- Add read_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their threads" ON messages;

-- Create new policies
CREATE POLICY "Users can view messages in their threads" ON messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = messages.thread_id
      AND (
        chat_threads.buyer_id = auth.uid() 
        OR chat_threads.seller_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = thread_id
      AND (
        chat_threads.buyer_id = auth.uid() 
        OR chat_threads.seller_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update messages in their threads" ON messages
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = messages.thread_id
      AND (
        chat_threads.buyer_id = auth.uid() 
        OR chat_threads.seller_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = messages.thread_id
      AND (
        chat_threads.buyer_id = auth.uid() 
        OR chat_threads.seller_id = auth.uid()
      )
    )
  );

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;

-- Enable realtime
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
END $$;

-- Fix chat_threads policies
DROP POLICY IF EXISTS "Users can view their chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can create chat threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can update their chat threads" ON chat_threads;

CREATE POLICY "Users can view their chat threads" ON chat_threads
  FOR SELECT 
  USING (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );

CREATE POLICY "Users can create chat threads" ON chat_threads
  FOR INSERT 
  WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

CREATE POLICY "Users can update their chat threads" ON chat_threads
  FOR UPDATE 
  USING (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  )
  WITH CHECK (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );


-- PART 3: Create Missing Profiles
-- ========================================

CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS TABLE (user_id UUID, email TEXT, status TEXT) AS $$
DECLARE
  r RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR r IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        display_name,
        created_at
      )
      VALUES (
        r.id,
        COALESCE(r.email, ''),
        COALESCE(
          r.raw_user_meta_data->>'full_name',
          r.raw_user_meta_data->>'name',
          split_part(COALESCE(r.email, ''), '@', 1)
        ),
        COALESCE(
          r.raw_user_meta_data->>'display_name',
          r.raw_user_meta_data->>'full_name',
          split_part(COALESCE(r.email, ''), '@', 1)
        ),
        NOW()
      );
      
      v_count := v_count + 1;
      
      user_id := r.id;
      email := COALESCE(r.email, '');
      status := 'Created';
      RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
      user_id := r.id;
      email := COALESCE(r.email, '');
      status := 'Error: ' || SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT * FROM create_missing_profiles();


-- PART 4: Refresh Schema
-- ========================================

NOTIFY pgrst, 'reload schema';


-- PART 5: Verification Queries
-- ========================================

SELECT '=== Messages Policies ===' as section;
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

SELECT '=== Realtime Tables ===' as section;
SELECT 
  string_agg(tablename, ', ') as tables
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('messages', 'chat_threads');

SELECT '=== Permissions ===' as section;
SELECT 
  table_name,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_name IN ('messages', 'chat_threads')
AND grantee = 'authenticated'
GROUP BY table_name;

SELECT '=== Users Without Profiles ===' as section;
SELECT 
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

SELECT '✅ All fixes applied successfully!' as status;
