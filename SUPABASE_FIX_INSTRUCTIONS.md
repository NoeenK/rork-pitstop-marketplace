# Supabase Database Fix Instructions

## Issue Fixed
1. **Database error saving new user** - The trigger function wasn't handling OAuth users properly
2. **Google sign-in not letting users into the app** - Added retry logic to wait for profile creation

## What to Do in Supabase

### Step 1: Update the Database Function

Go to your Supabase Dashboard → SQL Editor and run this SQL code:

```sql
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
```

### Step 2: Update the Username Constraint

Run this SQL to allow NULL usernames (needed for OAuth users):

```sql
-- Drop the old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_length;

-- Add new constraint that allows NULL
ALTER TABLE profiles ADD CONSTRAINT username_length 
  CHECK (username IS NULL OR char_length(username) >= 3);
```

### Step 3: Verify the Trigger Exists

Run this to make sure the trigger is set up:

```sql
-- Drop and recreate trigger to ensure it's using the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## What Changed in the Code

### 1. Database Function (`handle_new_user()`)
- Now safely handles `team_number` conversion with error handling
- Falls back to Google's `name` field if `full_name` isn't provided
- Uses `ON CONFLICT` to handle duplicate inserts gracefully
- Allows NULL values for optional fields like username

### 2. Username Constraint
- Changed from `CHECK (char_length(username) >= 3)` 
- To `CHECK (username IS NULL OR char_length(username) >= 3)`
- This allows OAuth users to have NULL usernames

### 3. AuthContext
- Added retry logic (up to 5 retries with 1-second delay) to wait for profile creation
- This ensures the profile is created before the app tries to load it
- Fixes the issue where Google sign-in wouldn't let users into the app

## Testing

After applying these changes:

1. **Test Email Sign-up:**
   - Enter email and get verification code
   - Verify code
   - Should create account and sign in

2. **Test Google Sign-in:**
   - Click "Continue with Google"
   - Complete Google authentication
   - Should create profile in database
   - Should automatically sign you into the app

3. **Test Apple Sign-in:** (if configured)
   - Click "Continue with Apple"
   - Complete Apple authentication
   - Should work the same as Google

## Troubleshooting

If you still see errors:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs → Database
   - Look for any errors in the `handle_new_user` function

2. **Verify Trigger is Running:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

3. **Check Profile Creation:**
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
   ```

4. **Verify Auth Users:**
   ```sql
   SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
