# 🔧 OAuth Setup in Supabase Dashboard

## ✅ Code is Fixed!

I've updated the code to use proper redirect URIs. Now configure OAuth in Supabase.

---

## 🚀 Step-by-Step: Configure Google OAuth

### 1. Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project (or create new)
3. Click **"Create Credentials"** → **"OAuth client ID"**
4. **Application type:** Web application
5. **Name:** Pitstop Marketplace
6. **Authorized redirect URIs:** Add these EXACT URLs:
   ```
   https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
   pitstop://auth/google-callback
   ```
7. Click **"Create"**
8. **Copy the Client ID and Client Secret**

### 2. Configure in Supabase

1. Go to: https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
2. Find **"Google"** provider
3. Toggle it **ON**
4. Paste:
   - **Client ID (for Google OAuth):** Your Google Client ID
   - **Client Secret (for Google OAuth):** Your Google Client Secret
5. Click **"Save"**

---

## 🍎 Step-by-Step: Configure Apple OAuth

### 1. Get Apple OAuth Credentials

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click **"+"** to create new identifier
3. Select **"Services IDs"** → **"Continue"**
4. **Description:** Pitstop Marketplace
5. **Identifier:** `com.noeen.pitstop` (or your bundle ID)
6. Check **"Sign in with Apple"** → **"Configure"**
7. **Primary App ID:** Select your app
8. **Domains and Subdomains:** Add:
   ```
   levfwegihveainqdnwkv.supabase.co
   ```
9. **Return URLs:** Add:
   ```
   https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
   ```
10. Click **"Save"** → **"Continue"** → **"Register"**

### 2. Create Apple Key

1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Click **"+"** to create new key
3. **Key Name:** Pitstop Sign In Key
4. Check **"Sign in with Apple"**
5. Click **"Configure"** → Select your Primary App ID → **"Save"**
6. Click **"Continue"** → **"Register"**
7. **Download the .p8 key file** (you can only download once!)
8. **Copy the Key ID** (shown on the page)
9. **Copy your Team ID** (from top right of Apple Developer page)

### 3. Configure in Supabase

1. Go to: https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
2. Find **"Apple"** provider
3. Toggle it **ON**
4. Fill in:
   - **Services ID (for Apple OAuth):** `com.noeen.pitstop` (your Services ID)
   - **Secret Key:** Open the downloaded .p8 file, copy ALL contents (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - **Key ID (for Apple OAuth):** Your Apple Key ID
   - **Team ID (for Apple OAuth):** Your Apple Team ID
5. Click **"Save"**

---

## ✅ Test After Configuration

1. **Restart your app**
2. **Try Google Sign In** - should work now!
3. **Try Apple Sign In** - should work now!

---

## 🔗 Quick Links

- **Supabase Auth Providers:** https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Apple Developer:** https://developer.apple.com/account/resources/identifiers/list

---

## 📝 Important Notes

1. **Redirect URIs must match EXACTLY** - copy/paste them, don't type manually
2. **Apple .p8 key** - download it immediately, you can't download again!
3. **Team ID** - found in top right of Apple Developer portal
4. **After saving** - wait 1-2 minutes for changes to propagate

---

## ✅ Code Changes Summary

- ✅ Fixed Google redirect URI for web and mobile
- ✅ Fixed Apple redirect URI for web and mobile  
- ✅ Added nonce handling for Apple iOS authentication
- ✅ Proper Supabase callback URL format

**Code is ready! Just configure OAuth in Supabase Dashboard now!**

