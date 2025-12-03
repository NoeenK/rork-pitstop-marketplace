-- PITSTOP FINAL FIX - Copy and paste this entire script into Supabase SQL Editor

-- 1. Drop existing trigger and function (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Create the improved function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_team_number INTEGER;
  v_display_name TEXT;
  v_full_name TEXT;
BEGIN
  -- Safely parse team_number
  BEGIN
    v_team_number := (new.raw_user_meta_data->>'team_number')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_team_number := NULL;
  END;

  -- Get names from metadata or generate from email
  v_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  
  v_display_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Insert or update profile
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
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    team_number = COALESCE(EXCLUDED.team_number, profiles.team_number),
    school_name = COALESCE(EXCLUDED.school_name, profiles.school_name);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Done! Now go to Supabase Dashboard to enable Email OTP
