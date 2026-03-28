# Fix Database Foreign Key Errors

## Problem
The app is showing these errors:
1. `Could not find a relationship between 'chat_threads' and 'profiles' in the schema cache`
2. `Could not find a relationship between 'listings' and 'profiles' in the schema cache`
3. `Cannot coerce the result to a single JSON object` (profile not found)

## Root Cause
Supabase's PostgREST schema cache is not recognizing the foreign key relationships even though they exist in the database. This happens when:
- Foreign keys are added after tables are created
- The schema cache hasn't been refreshed
- Tables were created without proper constraints

## Solution

### Step 1: Run the Foreign Key Fix Script
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `FIX_FOREIGN_KEY_RELATIONSHIPS.sql`
5. Click **Run** to execute the script

This will:
- Ensure all foreign key constraints exist
- Force refresh the PostgREST schema cache
- Verify the relationships are properly set up

### Step 2: Create Missing Profiles
The `Cannot coerce the result to a single JSON object` error means profiles don't exist for authenticated users. This happens when:
- Users were created before the profile trigger was set up
- The trigger failed during user creation

Run this query in Supabase SQL Editor to create profiles for existing users:

```sql
-- Create profiles for users that don't have one
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  display_name,
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
    'User'
  ),
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### Step 3: Verify the Fix
After running the scripts, test the app:
1. Reload the app
2. Check that the chat threads load without errors
3. Verify that profiles are displayed correctly
4. Test creating a new message

### Step 4: Monitor Console Logs
Check the console for these success messages:
- `[ChatContext] Loaded threads: X` (should show thread count)
- `[AuthContext] Found Supabase session` (should show user ID)
- No more foreign key relationship errors

## Why This Works
The `NOTIFY pgrst, 'reload schema'` command forces Supabase's PostgREST to refresh its schema cache, making it recognize all the foreign key relationships. The foreign key names like `chat_threads_buyer_id_fkey` tell PostgREST exactly how to join the tables when you use hints like `buyer:profiles!buyer_id(*)`.

## Prevention
To prevent this in the future:
1. Always define foreign keys when creating tables
2. Run `NOTIFY pgrst, 'reload schema'` after schema changes
3. Ensure the profile trigger is active before creating users
4. Test with fresh users after schema changes
