# Google OAuth Redirect Fix

## Problem
The Google OAuth flow was failing with "Error: cancelled" because the redirect URI configuration in Supabase doesn't match what the app is using.

## Solution

### Step 1: Configure Redirect URLs in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **levfwegihveainqdnwkv**
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following URLs to **Redirect URLs**:

```
pitstop://auth/google-callback
pitstop://auth/callback
https://rork.com/auth/callback
```

### Step 2: Enable Google OAuth Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Click **Enable**
4. Add your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. Click **Save**

### Step 3: Configure Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:

```
https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
pitstop://auth/google-callback
pitstop://auth/callback
```

4. Click **Save**

## What Changed in the Code

1. **AuthContext.tsx**: Fixed redirect URI to use hardcoded scheme instead of `makeRedirectUri()`
2. **AuthContext.tsx**: Fixed error handling to return `null` for cancelled flows instead of throwing error
3. **AuthContext.tsx**: Added better error logging for debugging

## Testing

1. Open the app
2. Go to Login screen
3. Tap "Sign in with Google"
4. Complete Google sign in
5. You should be redirected back to the app and signed in successfully

## Common Issues

### "Error: cancelled"
- **Cause**: Redirect URI mismatch
- **Fix**: Ensure all redirect URIs are added to both Supabase and Google Cloud Console

### "Invalid redirect URI"
- **Cause**: Google Cloud Console doesn't have the redirect URI
- **Fix**: Add the redirect URI to Google Cloud Console

### "OAuth URL not received"
- **Cause**: Google provider not enabled in Supabase
- **Fix**: Enable Google provider in Supabase Dashboard
