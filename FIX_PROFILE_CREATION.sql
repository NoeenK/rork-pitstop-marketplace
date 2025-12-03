-- ========================================
-- FIX PROFILE CREATION ISSUES
-- Run this SQL in your Supabase SQL Editor
-- ========================================

-- 1. First, check if the trigger exists and is working
SELECT 
  trigger_name, 
  event_object_table, 
  action_timing, 
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Create improved function with detailed logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_team_number INTEGER;
  v_display_name TEXT;
  v_full_name TEXT;
  v_email TEXT;
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'handle_new_user triggered for user: %', new.id;
  
  -- Safely parse team_number
  BEGIN
    v_team_number := (new.raw_user_meta_data->>'team_number')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_team_number := NULL;
    RAISE NOTICE 'Failed to parse team_number, setting to NULL';
  END;

  -- Get email with fallback
  v_email := COALESCE(new.email, '');
  
  -- Get names from metadata or generate from email
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

  RAISE NOTICE 'Attempting to insert profile for user: % with email: %', new.id, v_email;

  -- Insert or update profile with RETURNING to verify
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
    COALESCE(new.raw_user_meta_data->>'username', NULL),
    COALESCE(new.raw_user_meta_data->>'phone_number', NULL),
    v_team_number,
    COALESCE(
      new.raw_user_meta_data->>'team_name',
      new.raw_user_meta_data->>'school_name',
      ''
    ),
    '',  -- city (empty by default, user will update later)
    '',  -- country (empty by default)
    FALSE,  -- is_verified
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    NOW(),
    '{}'::UUID[]  -- blocked_users as empty array
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    team_number = COALESCE(EXCLUDED.team_number, profiles.team_number),
    school_name = COALESCE(EXCLUDED.school_name, profiles.school_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  
  RAISE NOTICE 'Successfully inserted/updated profile for user: %', new.id;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: % - %', new.id, SQLERRM, SQLSTATE;
    -- Return new anyway to not block user creation
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Ensure blocked_users column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'blocked_users'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN blocked_users UUID[] DEFAULT '{}';
    RAISE NOTICE 'Added blocked_users column to profiles table';
  ELSE
    RAISE NOTICE 'blocked_users column already exists';
  END IF;
END $$;

-- 6. Check and fix policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 8. Create a function to manually create missing profiles
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
      -- Call the trigger function manually
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
      
      RETURN QUERY SELECT r.id, COALESCE(r.email, '')::TEXT, 'Created'::TEXT;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT r.id, COALESCE(r.email, '')::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
  END LOOP;
  
  RAISE NOTICE 'Created % missing profiles', v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Run the function to create any missing profiles
SELECT * FROM create_missing_profiles();

-- 10. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if trigger exists
SELECT 
  trigger_name, 
  event_object_table, 
  action_timing, 
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check for users without profiles
SELECT 
  COUNT(*) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Show recent users and their profiles
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  p.id as profile_id,
  p.display_name,
  CASE 
    WHEN p.id IS NULL THEN 'MISSING PROFILE'
    ELSE 'Profile exists'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check all policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

SELECT 'Profile creation fix applied! Check verification results above.' AS status;
