# OAuth Setup Instructions for PITSTOP

This document outlines the steps to configure Google, Apple, and Facebook OAuth in your Supabase project.

## Deep Linking Configuration

The app uses the custom URL scheme: `pitstop://oauth-callback`

This is already configured in `app.json` with the scheme set to `pitstop`.

## Supabase OAuth Configuration

### 1. Enable OAuth Providers in Supabase Dashboard

1. Go to your Supabase dashboard: https://app.supabase.com/project/levfwegihveainqdnwkv
2. Navigate to **Authentication** → **Providers**
3. Enable each provider you want to use

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**

### Step 2: Configure OAuth Client

**For Web:**
- Application type: Web application
- Authorized JavaScript origins: 
  - `https://levfwegihveainqdnwkv.supabase.co`
- Authorized redirect URIs:
  - `https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback`

**For iOS:**
- Application type: iOS
- Bundle ID: `app.rork.pitstop-marketplace`

**For Android:**
- Application type: Android
- Package name: `app.rork.pitstop_marketplace`
- SHA-1 certificate fingerprint: (Get from your keystore)

### Step 3: Configure in Supabase

1. In Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Enter your **Client ID** and **Client Secret** from Google
4. Save changes

---

## Apple OAuth Setup

### Step 1: Configure Apple Sign In

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click on **Identifiers** → **+** to create a new identifier
4. Select **App IDs** and click **Continue**
5. Configure your App ID with Sign in with Apple capability

### Step 2: Create Service ID

1. In Identifiers, click **+** again
2. Select **Services IDs** and click **Continue**
3. Enter a description and identifier (e.g., `app.rork.pitstop-marketplace.auth`)
4. Enable **Sign in with Apple**
5. Configure domains and return URLs:
   - Domains: `levfwegihveainqdnwkv.supabase.co`
   - Return URLs: `https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback`

### Step 3: Create Key

1. Go to **Keys** → **+**
2. Enter a key name
3. Enable **Sign in with Apple**
4. Download the key file (`.p8`)

### Step 4: Configure in Supabase

1. In Supabase Dashboard → Authentication → Providers → Apple
2. Enable Apple provider
3. Enter your **Services ID** (identifier from Step 2)
4. Enter your **Team ID** (found in Apple Developer account)
5. Enter your **Key ID** (from the key you created)
6. Upload or paste the content of your **Private Key** (`.p8` file)
7. Save changes

---

## Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as the app type
4. Enter app details and create the app

### Step 2: Configure Facebook Login

1. In your app dashboard, add **Facebook Login** product
2. Go to **Facebook Login** → **Settings**
3. Add Valid OAuth Redirect URIs:
   - `https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback`
4. Save changes

### Step 3: Configure for Mobile

**For iOS:**
1. Go to **Settings** → **Basic**
2. Add your iOS Bundle ID: `app.rork.pitstop-marketplace`

**For Android:**
1. Add your Android package name: `app.rork.pitstop_marketplace`
2. Add your key hash (from your keystore)

### Step 4: Configure in Supabase

1. In Supabase Dashboard → Authentication → Providers → Facebook
2. Enable Facebook provider
3. Enter your **App ID** (from Facebook app dashboard)
4. Enter your **App Secret** (from Facebook app dashboard → Settings → Basic)
5. Save changes

---

## Testing OAuth

### On Web (localhost or deployed):
- OAuth should work automatically once configured
- The browser will redirect through the OAuth provider and back

### On Mobile (Expo Go or Development Build):
- OAuth will open in the system browser
- After authentication, it will redirect back to the app using the `pitstop://` URL scheme

### Deep Link Configuration
The app is configured to handle the OAuth callback at: `pitstop://oauth-callback`

When the OAuth flow completes, Supabase will redirect to this URL with the authentication token, and the app will automatically sign in the user.

---

## Troubleshooting

### OAuth not working?
1. Verify all redirect URLs are correctly configured in both the OAuth provider and Supabase
2. Check that the OAuth credentials (Client ID, Secret, etc.) are correct
3. Ensure the app scheme matches (`pitstop://`)
4. Check the Supabase logs for any errors

### Mobile deep linking not working?
1. Verify `app.json` has the correct scheme: `"scheme": "pitstop"`
2. Rebuild the app after changing the scheme
3. Test the deep link manually: `adb shell am start -a android.intent.action.VIEW -d "pitstop://oauth-callback"`

### Provider-specific issues:
- **Google**: Ensure Google+ API is enabled in Google Cloud Console
- **Apple**: Ensure you've added the redirect URL to the Service ID configuration
- **Facebook**: Ensure the app is in "Development" or "Live" mode in Facebook dashboard

---

## Additional Notes

### Profile Data with OAuth
When users sign in with OAuth providers, the app will automatically:
1. Create a profile in the `profiles` table
2. Use their name and email from the OAuth provider
3. Users will need to complete their profile (team number, etc.) after first OAuth sign-in

You may want to add a profile completion screen that appears after OAuth sign-in for first-time users.

### Security Considerations
- Never commit OAuth secrets to version control
- Use Supabase environment variables for OAuth credentials
- Regularly rotate OAuth secrets
- Monitor OAuth usage in your provider dashboards
