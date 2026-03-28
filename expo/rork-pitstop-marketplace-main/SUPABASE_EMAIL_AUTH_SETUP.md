# Supabase Email Authentication Setup Guide

## ✅ What's Been Done (Code Side)

The code has been updated to properly implement Supabase email authentication with OTP verification:

1. **signup-email.tsx**: Now sends OTP code via Supabase when user clicks "Continue with Email"
2. **verify-email.tsx**: Verifies the OTP code and signs the user in
3. **lib/verification.ts**: Uses Supabase's native OTP system instead of custom verification

## 📋 Supabase Dashboard Configuration

Follow these steps **exactly** to configure Supabase:

### Step 1: Enable Email Authentication
1. Go to https://levfwegihveainqdnwkv.supabase.co
2. Click **Authentication** in the left sidebar
3. Click **Providers** tab
4. Find **Email** provider
5. Make sure it's **ENABLED** (toggle should be ON)

### Step 2: Configure Auth Settings
1. Stay in **Authentication** → Click **Settings**
2. Scroll to **Email Auth** section
3. Configure these settings:
   - ✅ **Enable email provider**: ON
   - ✅ **Enable email confirmations**: OFF (we're using OTP instead)
   - ✅ **Secure email change enabled**: ON
   - ✅ **Enable email OTP**: ON (VERY IMPORTANT!)

### Step 3: Configure Site URL & Redirect URLs
1. Still in **Authentication** → **Settings**
2. Scroll to **Site URL** section
3. Set **Site URL** to: `http://localhost:8081` (or your production URL)
4. Scroll to **Redirect URLs** section
5. Add these URLs (click "+ Add URL" for each):
   - `http://localhost:8081`
   - `pitstop://`
   - `pitstop://auth/callback`
   - Your production URL (if you have one)

### Step 4: Email Templates (Optional but Recommended)
1. Go to **Authentication** → **Email Templates**
2. Click on **Magic Link** template (this is used for OTP emails)
3. Customize the email if you want:
   ```
   Subject: Your Pitstop Verification Code
   
   Body:
   Hi there!
   
   Your verification code is: {{ .Token }}
   
   This code will expire in 60 minutes.
   
   If you didn't request this code, please ignore this email.
   
   Best,
   The Pitstop Team
   ```

### Step 5: SMTP Configuration (For Production)

**For Testing**: Supabase's default email service works but may land in spam

**For Production**: Set up custom SMTP
1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Enter your email provider details:
   - Host: (e.g., smtp.gmail.com for Gmail)
   - Port: 587 (for TLS) or 465 (for SSL)
   - Username: your email address
   - Password: app-specific password
   - Sender email: noreply@yourdomain.com
   - Sender name: Pitstop

**Popular SMTP Options:**
- **SendGrid**: Free tier, easy setup
- **Mailgun**: Good for transactional emails
- **Amazon SES**: Cheap, reliable
- **Gmail**: For testing only (16-100 emails/day limit)

### Step 6: Database Setup (Profiles Table)

Make sure your profiles table has these columns. Run this SQL in **SQL Editor** if not already done:

```sql
-- Profiles table should already exist, but verify it has these columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS team_number INTEGER,
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trades_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_rate INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time TEXT DEFAULT '0 min',
ADD COLUMN IF NOT EXISTS blocked_users TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create a function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, username, phone_number, team_number, school_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'phone_number',
    (new.raw_user_meta_data->>'team_number')::integer,
    new.raw_user_meta_data->>'team_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Testing the Flow

### Test Email Signup:
1. Start your app
2. Click "Sign Up for Pitstop"
3. Enter a **real email address** you can access
4. Click "Continue with Email"
5. Check your email inbox (and spam folder!) for the OTP code
6. The code should be **6 digits**
7. Enter the code in the app
8. Toggle "I am at least 18 years of age"
9. Click "Verify & Create Account"
10. You should be signed in!

### Troubleshooting:

**Problem**: "Failed to send verification code"
- **Solution**: Check that Email provider is enabled in Supabase
- **Solution**: Check that "Enable email OTP" is ON

**Problem**: Email not received
- **Solution**: Check spam folder
- **Solution**: Wait 1-2 minutes (emails can be delayed)
- **Solution**: Check SMTP settings if using custom SMTP
- **Solution**: Check Supabase logs: Authentication → Logs

**Problem**: "Invalid or expired code"
- **Solution**: OTP codes expire after 60 minutes by default
- **Solution**: Click "Resend code" to get a new one
- **Solution**: Make sure you're entering the full 6-digit code

**Problem**: User created but no profile
- **Solution**: Check that the trigger function exists (run SQL above)
- **Solution**: Check Supabase logs for errors

## 🔐 Security Notes

1. **OTP codes expire**: Default is 60 minutes
2. **Rate limiting**: Supabase limits OTP requests to prevent abuse
3. **Email verification**: Users must verify email to sign in
4. **HTTPS only**: In production, always use HTTPS

## 📱 Next Steps

After email auth is working:
1. ✅ Test the full signup → verify → signin flow
2. Add profile completion flow (if needed)
3. Test "Resend code" functionality
4. Add forgot password flow (if needed)
5. Set up Google & Apple OAuth (already in code)
6. Configure production SMTP for better deliverability

## 🆘 Need Help?

If you get stuck:
1. Check console logs for errors
2. Check Supabase Auth logs: Authentication → Logs
3. Verify all settings above are correct
4. Make sure you're using a real, accessible email for testing
