# Profile Creation Error - Complete Fix Guide

## Problem
Users signing up are getting profile creation errors. The database trigger that should automatically create profiles when users sign up is either not working or missing.

## Solution

### Step 1: Run the SQL Fix

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `FIX_PROFILE_CREATION.sql` in this project
5. **Copy the entire contents** of the file
6. **Paste it** into the Supabase SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

### Step 2: Verify the Fix

After running the SQL, check the verification results at the bottom of the output:

1. **Trigger exists**: Should show `on_auth_user_created` trigger
2. **Users without profiles**: Should be 0 (or low number)
3. **Recent users**: Should show that all users have profiles

### Step 3: Test User Sign Up

1. Try signing up with a new email address
2. Complete the verification process
3. Check if the profile is created successfully

## What the SQL Fix Does

1. **Drops and recreates the trigger** - Ensures the trigger is properly set up
2. **Adds better error handling** - Logs errors instead of failing silently
3. **Fixes blocked_users column** - Ensures it exists with proper default
4. **Recreates policies** - Ensures RLS policies are correct
5. **Creates missing profiles** - Automatically creates profiles for any existing users without them
6. **Grants permissions** - Ensures all necessary permissions are in place

## Common Issues & Solutions

### Issue: "Policy already exists" error
**Solution**: The SQL script drops existing policies before creating them, so this shouldn't happen. If it does, you can manually drop the policy first:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Issue: Users still don't have profiles after signup
**Solution**: Check the Supabase logs:
1. Go to **Database** > **Logs** in Supabase Dashboard
2. Look for errors related to `handle_new_user`
3. Share the error message for further debugging

### Issue: "Function does not exist"
**Solution**: Make sure you run the ENTIRE SQL script, not just parts of it.

## Additional Checks

### Manual Profile Creation
If you need to manually create a profile for a user:

```sql
-- Replace USER_ID and USER_EMAIL with actual values
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  full_name,
  created_at
)
VALUES (
  'USER_ID',
  'USER_EMAIL',
  'Display Name',
  'Full Name',
  NOW()
);
```

### Check if Trigger is Running
After someone signs up, check the Supabase logs for NOTICE messages:
- "handle_new_user triggered for user: ..."
- "Successfully inserted/updated profile for user: ..."

If you don't see these, the trigger is not firing.

## Need Help?

If you're still experiencing issues after running the SQL fix:

1. Check the Supabase **Database Logs**
2. Look for any error messages in the app console
3. Check if email confirmation is enabled in Supabase Auth settings (should be disabled for OTP)
4. Verify that the user is actually being created in `auth.users` table

## Success Indicators

✅ Trigger `on_auth_user_created` exists in database  
✅ All users in `auth.users` have corresponding profiles  
✅ New signups automatically get profiles created  
✅ No errors in Supabase logs related to profile creation  
✅ Users can complete onboarding and access the app  
