# Supabase Update Instructions

## Required Changes to Your Supabase Database

You need to run the following SQL commands in your Supabase SQL Editor to update your database schema with the phone_number field and updated trigger function.

### Step 1: Add phone_number Column to profiles Table

Run this SQL command:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
```

### Step 2: Update the handle_new_user() Trigger Function

Replace the existing trigger function with this updated version:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, username, phone_number, team_number, school_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', ''),
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    NULLIF(COALESCE(new.raw_user_meta_data->>'team_number', '')::text, '')::integer,
    COALESCE(new.raw_user_meta_data->>'team_name', ''),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Enable Email Confirmations (Optional but Recommended)

If you want to require email verification:

1. Go to Authentication → Settings in your Supabase dashboard
2. Enable "Enable email confirmations"
3. Customize your email templates if needed

### Step 4: Verify the Changes

After running the SQL commands, you should see:
- A new `phone_number` column in the `profiles` table
- The trigger function should now capture all fields including phone_number, display_name, username, team_number, and school_name

### Step 5: Test the Integration

1. Sign up with a new account in your app
2. Check the `profiles` table in Supabase
3. Verify that all fields are populated:
   - full_name
   - display_name
   - username
   - phone_number
   - team_number
   - school_name

## What Has Been Updated in the App

### 1. Phone Number Field Added
- Added phone number input field in signup form
- Phone number is now required for account creation
- Data is saved to Supabase profiles table

### 2. Proper Email Verification
- Implemented real OTP verification using Supabase
- Users must enter verification code sent to their email
- Resend verification email functionality added

### 3. Home Screen Updates
- Displays "Hi, [User's Name]" at the top of the home screen
- Location icon moved to header right side (small icon)
- User's display name fetched from Supabase

### 4. All Data Fields Synced
The following fields are now properly synced to Supabase:
- Full Name (full_name & display_name)
- Username (username)
- Phone Number (phone_number)
- Team Number (team_number)
- Team Name/School Name (school_name)
- Email (email)

### 5. Authentication Flow
- Sign up creates user in auth.users
- Trigger automatically creates profile entry
- Additional update ensures all fields are populated
- Real password verification on login
- Only allows login with correct credentials

## Troubleshooting

### If profiles are not being created:
1. Check if the trigger exists: 
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Check if the function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. Re-run Step 2 to recreate the trigger function

### If fields are showing NULL:
1. Make sure you ran the Step 2 SQL command to update the trigger
2. Create a new test account (existing accounts won't be retroactively updated)
3. Check console logs for any errors during signup

### If email verification is not working:
1. Make sure email confirmations are enabled in Supabase dashboard
2. Check your spam folder for verification emails
3. Try the "Resend" button in the verification screen
