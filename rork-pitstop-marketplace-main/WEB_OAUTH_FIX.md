# 🌐 Web OAuth Fix - Complete

## ✅ Changes Made

### 1. **Fixed Google Callback for Web**
- Updated `app/auth/google-callback.tsx` to use actual browser URL for web
- Uses `window.location.href` for web instead of deep link
- Properly handles both web and mobile platforms

### 2. **Created General Auth Callback Route**
- Created `app/auth/callback.tsx` for general OAuth callbacks
- Handles both Google and Apple OAuth on web
- Automatically detects and processes OAuth codes

### 3. **Web-Specific Handling**
- Web now uses actual browser URLs
- Mobile continues to use deep links (`pitstop://`)
- Proper platform detection with `Platform.OS === "web"`

---

## 🚀 How to Test

### Step 1: Start Web Server
```bash
npx expo start --web
```

### Step 2: Open Browser
- Should open automatically at: `http://localhost:8081`
- Or manually navigate to that URL

### Step 3: Test Google Sign-In
1. Navigate to login page
2. Click "Continue with Google"
3. Should redirect to Google OAuth
4. After authorizing, should redirect back to: `http://localhost:8081/auth/callback?code=...`
5. Should automatically sign in and navigate to home

### Step 4: Check Console
Open browser DevTools (F12) and check:
- No redirect_uri_mismatch errors
- `[AuthContext] Redirect URI: http://localhost:8081/auth/callback`
- `[GoogleCallbackScreen] Processing callback URL: ...`
- Sign-in should complete quickly

---

## 🔧 Important: Configure Redirect URIs

### In Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
2. Click on **Google** provider
3. Make sure these redirect URIs are configured in Google Cloud Console:
   - `http://localhost:8081/auth/callback` (for local testing)
   - `https://your-production-domain.com/auth/callback` (for production)

### In Google Cloud Console:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   - `http://localhost:8081/auth/callback`
   - `https://levfwegihveainqdnwkv.supabase.co/auth/v1/callback`

---

## 📝 Files Changed

1. ✅ `app/auth/google-callback.tsx` - Fixed web callback handling
2. ✅ `app/auth/callback.tsx` - New general callback route
3. ✅ `contexts/AuthContext.tsx` - Already optimized for speed

---

## ✅ Expected Behavior

### Web:
- Redirect URI: `http://localhost:8081/auth/callback`
- Uses `window.location.href` for callback processing
- Fast sign-in (< 1 second)

### Mobile:
- Redirect URI: `pitstop://auth/google-callback`
- Uses deep link for callback processing
- Fast sign-in (< 1 second)

---

## 🐛 Troubleshooting

### Issue: Redirect URI Mismatch
**Solution:** Add `http://localhost:8081/auth/callback` to Google Cloud Console

### Issue: Callback Not Working
**Solution:** Check browser console for errors, verify Supabase provider is enabled

### Issue: Slow Sign-In
**Solution:** Check network tab - profile should load in background (non-blocking)

---

**Ready to test on web!** 🚀

