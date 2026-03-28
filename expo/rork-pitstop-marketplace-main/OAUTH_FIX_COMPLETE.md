# 🔧 OAuth Configuration Fix

## ✅ Code Changes Made

I've fixed the OAuth redirect URI issues in the code. Now you need to configure OAuth in Supabase Dashboard.

---

## 🔴 Error 1: Google OAuth - redirect_uri_mismatch

**Problem:** The redirect URI doesn't match what's configured in Google/Supabase.

**Fixed in code:** Now uses proper Supabase callback URLs.

---

## 🔴 Error 2: Apple OAuth - Unacceptable audience

**Problem:** Apple ID token audience doesn't match Supabase configuration.

**Fixed in code:** Added nonce handling for Apple authentication.

---

## 🚀 Configure OAuth in Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/levfwegihveainqdnwkv
2. Click **"Authentication"** in the left sidebar
3. Click **"Providers"** tab

### Step 2: Configure Google OAuth

1. **Enable Google Provider:**
   - Find **"Google"** in the providers list
   - Toggle it **ON**

2. **Get Google OAuth Credentials:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create a new OAuth 2.0 Client ID (or use existing)
   - **Application type:** Web application
   - **Authorized redirect URIs:** Add these:
     ```
     https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
     pitstop://auth/google-callback
     ```
   - Copy the **Client ID** and **Client Secret**

3. **Add to Supabase:**
   - Paste **Client ID** in Supabase Google provider settings
   - Paste **Client Secret** in Supabase Google provider settings
   - Click **"Save"**

---

### Step 3: Configure Apple OAuth

1. **Enable Apple Provider:**
   - Find **"Apple"** in the providers list
   - Toggle it **ON**

2. **Get Apple OAuth Credentials:**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Create a new **Services ID** (or use existing)
   - **Identifier:** e.g., `com.noeen.pitstop`
   - **Domains and Subdomains:** Add:
     ```
     levfwegihveainqdnwkv.supabase.co
     ```
   - **Return URLs:** Add:
     ```
     https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
     ```
   - Copy the **Services ID** (this is your Client ID)
   - Create a **Key** for Sign in with Apple
   - Download the **Key file** (.p8)
   - Copy the **Key ID** and **Team ID**

3. **Add to Supabase:**
   - **Services ID:** Your Apple Services ID
   - **Secret Key:** Upload the .p8 key file content
   - **Key ID:** Your Apple Key ID
   - **Team ID:** Your Apple Team ID
   - Click **"Save"**

---

## 📋 Redirect URIs Summary

### For Google OAuth:
Add these redirect URIs in Google Cloud Console:
```
https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
pitstop://auth/google-callback
```

### For Apple OAuth:
Add these return URLs in Apple Developer:
```
https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback
```

---

## ✅ After Configuration

1. **Test Google Sign In:**
   - Try signing in with Google
   - Should redirect properly now

2. **Test Apple Sign In:**
   - Try signing in with Apple
   - Should work without audience error

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Apple Developer:** https://developer.apple.com/account/resources/identifiers/list

---

## 📝 Code Changes Summary

1. ✅ Fixed Google redirect URI to use Supabase callback format
2. ✅ Fixed Apple redirect URI to use Supabase callback format  
3. ✅ Added nonce handling for Apple authentication
4. ✅ Added web vs mobile redirect URI handling

**The code is fixed! Now configure OAuth in Supabase Dashboard.**

