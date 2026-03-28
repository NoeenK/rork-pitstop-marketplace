-- Create Missing Profiles for Existing Users
-- Run this in your Supabase SQL Editor to fix "Cannot coerce the result to a single JSON object" errors

-- Step 1: Create profiles for any users that don't have one
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
SELECT 
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'User'),
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.email,
    'User'
  ),
  COALESCE(u.raw_user_meta_data->>'username', NULL),
  COALESCE(u.raw_user_meta_data->>'phone_number', NULL),
  CASE 
    WHEN u.raw_user_meta_data->>'team_number' ~ '^[0-9]+$' 
    THEN (u.raw_user_meta_data->>'team_number')::INTEGER
    ELSE NULL
  END,
  COALESCE(u.raw_user_meta_data->>'team_name', u.raw_user_meta_data->>'school_name', ''),
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify profiles were created
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  missing_count := user_count - profile_count;
  
  RAISE NOTICE 'Total users: %', user_count;
  RAISE NOTICE 'Total profiles: %', profile_count;
  
  IF missing_count = 0 THEN
    RAISE NOTICE '✓ All users have profiles!';
  ELSE
    RAISE WARNING '⚠ Still missing % profiles. Check for data issues.', missing_count;
  END IF;
END $$;
