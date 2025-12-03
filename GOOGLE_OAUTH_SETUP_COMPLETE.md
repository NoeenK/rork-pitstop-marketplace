# Google OAuth Setup Instructions

## Current Status

Your app is configured to use Google OAuth through Supabase. The error you're seeing indicates that the OAuth callback is not completing successfully.

## Required Configuration Steps

### 1. Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/levfwegihveainqdnwkv
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and enable it
4. You'll need:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console

### 2. Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if you haven't already
6. Select **Application type**: Choose the appropriate type for your app
   - For mobile: **iOS** or **Android**
   - For web: **Web application**

### 3. Add Authorized Redirect URIs in Google Cloud Console

You need to add these redirect URIs to your Google OAuth configuration:

**For Supabase (REQUIRED):**
```
https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
```

**For Mobile Deep Linking (REQUIRED):**
```
pitstop://auth/google-callback
```

**For Development/Expo Go (if using Expo Go):**
```
exp://[your-ip]:8081/--/auth/google-callback
```

### 4. Update Your env File

After getting your Google credentials, update your `env` file:

```bash
# Replace these with your actual Google OAuth credentials
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here

# This should point to your Supabase project
GOOGLE_REDIRECT_URI=https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
```

### 5. Enter Credentials in Supabase Dashboard

1. Go back to Supabase Dashboard → Authentication → Providers → Google
2. Paste your **Client ID** from Google Cloud Console
3. Paste your **Client Secret** from Google Cloud Console  
4. Click **Save**

## Troubleshooting

### Error: "Authentication failed or was cancelled"

This error typically means:
1. ✅ OAuth redirect URIs are not configured correctly in Google Cloud Console
2. ✅ Google OAuth is not enabled in Supabase
3. ✅ Google credentials (Client ID/Secret) are not set in Supabase

### Additional Debugging

The app logs helpful debug information. Look for these console messages:
- `[AuthContext] Starting Google OAuth flow with Supabase`
- `[AuthContext] Redirect URI: pitstop://auth/google-callback`
- `[AuthContext] Google OAuth session result`

### Testing Steps

1. Make sure all configuration steps above are complete
2. Restart your app completely
3. Try signing in with Google
4. Check the console logs for detailed error messages

## Deep Link Configuration

The app is already configured with the deep link scheme in `app.json`:
```json
{
  "expo": {
    "scheme": "pitstop"
  }
}
```

This allows the app to handle the callback URL: `pitstop://auth/google-callback`

## Next Steps After Configuration

Once you complete the setup:

1. Test Google sign-in on your device
2. The flow should:
   - Open Google sign-in page in browser
   - Allow you to select/sign in with Google account
   - Redirect back to the app
   - Create or load your user profile
   - Navigate to the welcome screen for profile setup (if needed) or home screen

## Important Notes

- The OAuth flow uses Supabase's built-in OAuth handling
- The app automatically creates a user profile after successful Google sign-in
- If the user already has a profile with phone number and team number, they'll go straight to the home screen
- If the user is new or missing profile info, they'll be redirected to the welcome screen to complete their profile

## Support

If you're still experiencing issues after completing all steps:
1. Check Supabase logs in Dashboard → Logs
2. Review Google Cloud Console OAuth consent screen settings
3. Verify all redirect URIs are saved correctly
4. Make sure your app scheme matches: `pitstop://`
