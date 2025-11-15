# OAuth Fix Instructions for Pitstop

## Current Issues

1. **Google Sign In**: Not redirecting to verification page after authentication
2. **Apple Sign In**: Error "Unacceptable audience in id_token:[app.rork]"

## Root Causes

### Google OAuth Issue
The Google OAuth flow successfully authenticates but doesn't properly redirect to the verification screen because:
- The session may not be immediately available after OAuth callback
- There may be timing issues with fetching the user after OAuth completes

### Apple OAuth Issue
The error "Unacceptable audience in id_token:[app.rork]" indicates a mismatch between:
- The **Bundle ID** configured in your Apple Developer account
- The **Service ID** configured in Supabase
- The **audience** claim in the returned ID token

## Step-by-Step Fix Guide

### Part 1: Fix Apple OAuth (Critical)

#### Step 1: Check Your Apple Developer Configuration

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles** → **Identifiers**

#### Step 2: Verify or Create App ID

1. Find your App ID or create a new one:
   - **Description**: PITSTOP Marketplace
   - **Bundle ID**: `app.rork.pitstop-marketplace`
   - **Capabilities**: Enable "Sign in with Apple"
   
2. Click **Save**

#### Step 3: Create or Update Service ID

1. In Identifiers, click **+** and select **Services IDs**
2. Configure:
   - **Description**: PITSTOP Marketplace Auth
   - **Identifier**: Use `app.rork.pitstop-marketplace` (MUST match your Bundle ID, NOT a different identifier)
   - Enable **Sign in with Apple**
3. Click **Configure** next to Sign in with Apple:
   - **Primary App ID**: Select your app ID from Step 2
   - **Domains**: Add `levfwegihveainqdnwkv.supabase.co`
   - **Return URLs**: Add `https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback`
4. Click **Save**

#### Step 4: Create Key for Apple Sign In

1. Go to **Keys** → **+**
2. Configure:
   - **Key Name**: PITSTOP Auth Key
   - Enable **Sign in with Apple**
   - Click **Configure** and select your Primary App ID
3. Click **Continue** → **Register**
4. **Download the .p8 key file** (you can only download it once!)
5. Note your **Key ID** (shown on the screen)

#### Step 5: Update Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com/project/levfwegihveainqdnwkv)
2. Navigate to **Authentication** → **Providers** → **Apple**
3. Update these fields:
   - **Enabled**: ON
   - **Services ID**: `app.rork.pitstop-marketplace` (MUST match Bundle ID)
   - **Authorized Client IDs**: Add `app.rork` (this is important!)
   - **Team ID**: Find in Apple Developer account (top right, next to your name)
   - **Key ID**: From Step 4
   - **Private Key**: Open the .p8 file in a text editor and paste the entire content
4. Click **Save**

---

### Part 2: Fix Google OAuth

#### Step 1: Verify Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create one
3. Enable **Google+ API** (or **People API**)

#### Step 2: Configure OAuth 2.0 Credentials

Create THREE separate OAuth client IDs (one for each platform):

**For iOS:**
1. Click **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **iOS**
3. Bundle ID: `app.rork.pitstop-marketplace`
4. Click **Create** and note the **Client ID**

**For Android:**
1. Create another OAuth 2.0 Client ID
2. Application type: **Android**
3. Package name: `app.rork.pitstop_marketplace`
4. SHA-1 certificate fingerprint:
   - For development: Run `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - Copy the SHA-1 hash
5. Click **Create**

**For Web (required for OAuth flow):**
1. Create another OAuth 2.0 Client ID
2. Application type: **Web application**
3. Authorized JavaScript origins:
   - `https://levfwegihveainqdnwkv.supabase.co`
4. Authorized redirect URIs:
   - `https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback`
5. Click **Create** and note the **Client ID** and **Client Secret**

#### Step 3: Update Supabase Google Provider

1. Go to [Supabase Dashboard](https://app.supabase.com/project/levfwegihveainqdnwkv)
2. Navigate to **Authentication** → **Providers** → **Google**
3. Update:
   - **Enabled**: ON
   - **Client ID**: Use the **Web** Client ID from Step 2
   - **Client Secret**: Use the **Web** Client Secret from Step 2
   - **Authorized Client IDs**: Add the iOS Client ID (without .apps.googleusercontent.com)
4. Click **Save**

---

### Part 3: Update Redirect URL Configuration

#### Update app.json

Your `app.json` already has the correct scheme, but let's verify:

```json
{
  "expo": {
    "scheme": "pitstop"
  }
}
```

#### Add OAuth Callback Route

The app needs to handle OAuth callbacks properly. Your current setup should work, but if it doesn't, follow these additional steps.

---

### Part 4: Testing OAuth

#### Test Google OAuth:

1. Clear app data/cache
2. Click "Continue with Google"
3. Select your Google account
4. After authorization, you should:
   - See console logs showing the user email
   - Automatically transition to verification screen
   - Receive an OTP code via email

#### Test Apple OAuth:

1. Clear app data/cache  
2. Click "Continue with Apple"
3. Authorize with Face ID/Touch ID
4. After authorization, you should:
   - See console logs showing successful authentication
   - Automatically transition to verification screen
   - Receive an OTP code via email

---

## Common Issues & Solutions

### Issue: "Redirect URI mismatch" (Google)
**Solution**: Make sure all redirect URIs in Google Cloud Console exactly match:
- `https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback`

### Issue: "Unacceptable audience in id_token" (Apple)
**Solution**: 
1. Make sure Service ID matches Bundle ID: `app.rork.pitstop-marketplace`
2. Add `app.rork` to Authorized Client IDs in Supabase
3. Verify the domains and return URLs are correct in Apple Developer Console

### Issue: OAuth completes but doesn't redirect to verification
**Solution**: The code already handles this, but check console logs for:
- Session creation
- User email extraction
- Verification code sending

### Issue: Deep linking not working
**Solution**: 
1. Rebuild the app after changing the scheme
2. Test deep link: `npx uri-scheme open pitstop://auth/callback --ios` (or --android)

---

## Verification Checklist

- [ ] Apple Service ID matches Bundle ID
- [ ] Apple Service ID configured in Supabase with Team ID and Private Key
- [ ] `app.rork` added to Authorized Client IDs in Supabase Apple provider
- [ ] Google Web Client ID and Secret configured in Supabase
- [ ] Google iOS and Android Client IDs created (for respective platforms)
- [ ] All redirect URLs match exactly in both provider consoles and Supabase
- [ ] App scheme is `pitstop` in app.json
- [ ] After rebuild, OAuth flows redirect properly

---

## Additional Notes

### For Development Testing
- Use development builds or Expo Go
- OAuth will open in system browser
- After authentication, the browser will redirect back to the app

### For Production
- Build the app with EAS Build
- Test on physical devices
- Monitor Supabase logs for authentication events

---

## Support Contacts

If issues persist:
1. Check Supabase logs: **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Check OAuth provider logs:
   - Google: Google Cloud Console → APIs & Services → Credentials
   - Apple: Apple Developer Console → Certificates, Identifiers & Profiles
3. Check console logs in your app for detailed error messages
