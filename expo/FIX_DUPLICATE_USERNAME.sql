-- ========================================
-- FIX DUPLICATE USERNAME CONSTRAINT ERROR
-- Run this SQL in your Supabase SQL Editor
-- ========================================

-- Drop and recreate the trigger function with username conflict handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create improved function with username conflict resolution
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
  RAISE NOTICE 'handle_new_user triggered for user: %', new.id;
  
  -- Safely parse team_number
  BEGIN
    v_team_number := (new.raw_user_meta_data->>'team_number')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_team_number := NULL;
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

  -- Handle username with conflict resolution
  v_base_username := new.raw_user_meta_data->>'username';
  
  -- If username is provided, check for conflicts and resolve them
  IF v_base_username IS NOT NULL AND v_base_username != '' THEN
    v_username := v_base_username;
    v_counter := 1;
    
    -- Check if username already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_username_exists;
    
    -- If exists, append numbers until we find an available one
    WHILE v_username_exists AND v_counter < 1000 LOOP
      v_username := v_base_username || v_counter::TEXT;
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_username_exists;
      v_counter := v_counter + 1;
    END LOOP;
    
    -- If we couldn't find a unique username after 1000 tries, use NULL
    IF v_username_exists THEN
      v_username := NULL;
      RAISE WARNING 'Could not find unique username for base: %. Setting to NULL.', v_base_username;
    END IF;
  ELSE
    v_username := NULL;
  END IF;

  RAISE NOTICE 'Attempting to insert profile for user: % with username: %', new.id, v_username;

  -- Insert profile
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
    v_username,  -- Use resolved username (NULL if conflict couldn't be resolved)
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
    -- Only update username if the new one is not null
    username = CASE 
      WHEN EXCLUDED.username IS NOT NULL THEN EXCLUDED.username
      ELSE profiles.username
    END,
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    team_number = COALESCE(EXCLUDED.team_number, profiles.team_number),
    school_name = COALESCE(EXCLUDED.school_name, profiles.school_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  
  RAISE NOTICE 'Successfully inserted/updated profile for user: %', new.id;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: % - %', new.id, SQLERRM, SQLSTATE;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- OPTION 1: Make username optional (RECOMMENDED)
-- This allows users to sign up without a username
-- and add it later through profile edit
-- ========================================

-- The username column is already nullable, so users can sign up without one

-- ========================================
-- OPTION 2: Generate unique usernames automatically
-- ========================================

-- Create a function to generate unique usernames for existing users without one
CREATE OR REPLACE FUNCTION generate_unique_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_username TEXT;
  v_counter INTEGER := 1;
  v_exists BOOLEAN;
BEGIN
  -- Clean the base name (remove special chars, lowercase)
  base_name := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
  
  -- If base_name is empty, use 'user'
  IF base_name = '' THEN
    base_name := 'user';
  END IF;
  
  v_username := base_name;
  
  -- Check if username exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_exists;
  
  -- Append numbers until we find a unique one
  WHILE v_exists AND v_counter < 10000 LOOP
    v_username := base_name || v_counter::TEXT;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_exists;
    v_counter := v_counter + 1;
  END LOOP;
  
  IF v_exists THEN
    -- Use UUID suffix as last resort
    v_username := base_name || '_' || substr(md5(random()::text), 1, 8);
  END IF;
  
  RETURN v_username;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check for duplicate usernames
SELECT username, COUNT(*) as count
FROM profiles
WHERE username IS NOT NULL
GROUP BY username
HAVING COUNT(*) > 1;

-- Check users without usernames
SELECT COUNT(*) as users_without_username
FROM profiles
WHERE username IS NULL;

-- Show recent profiles
SELECT 
  id,
  email,
  username,
  display_name,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

SELECT 'Username conflict resolution applied!' AS status;
