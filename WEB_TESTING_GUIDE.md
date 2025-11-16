# 🌐 Web Testing Guide

## 🚀 Starting the Web App

### Option 1: Using Expo (Recommended)
```bash
npx expo start --web
```

### Option 2: Using Custom Script
```bash
npm run start-web
# or
bunx rork start -p nwfospp9b67jshk0avfzy --web --tunnel
```

**The web server should start and open automatically at:** `http://localhost:8081`

---

## ✅ What to Test

### 1. **Google Sign-In**
1. Click "Continue with Google"
2. Should redirect to Google OAuth page
3. After authorizing, should redirect back to app
4. Should sign in **immediately** (no long wait)
5. Should navigate to home screen

**Expected Redirect URI:**
- Should use: `https://your-domain.com/auth/callback` or `http://localhost:8081/auth/callback`

### 2. **Apple Sign-In**
1. Click "Apple" button
2. Should redirect to Apple OAuth page (or show Apple sign-in modal)
3. After authorizing, should redirect back
4. Should sign in **immediately**
5. Should navigate to home screen

### 3. **Email Sign-In**
1. Enter email and password
2. Click "Log in"
3. Should sign in **immediately**
4. Should navigate to home screen

---

## 🔍 Check These Things

### ✅ Speed
- Sign-in should be **< 1 second** (no long loading)
- Navigation should happen **immediately** after OAuth callback

### ✅ Redirect URIs
- Google OAuth should use: `${window.location.origin}/auth/callback`
- Check browser console for redirect URI logs

### ✅ Console Logs
Open browser DevTools (F12) and check:
- `[AuthContext] Starting Google OAuth flow with Supabase`
- `[AuthContext] Redirect URI: ...`
- `[AuthContext] Success - completing sign in`
- No errors about redirect_uri_mismatch

### ✅ Profile Loading
- User should appear signed in **immediately**
- Profile data should load in background (check Network tab)
- User info should update when profile loads

---

## 🐛 Common Issues

### Issue: Redirect URI Mismatch
**Solution:** Make sure in Supabase Dashboard → Google Provider:
- Add redirect URI: `http://localhost:8081/auth/callback`
- Add redirect URI: `https://your-production-domain.com/auth/callback`

### Issue: Slow Sign-In
**Solution:** Check if profile is loading in background (should be non-blocking)

### Issue: OAuth Not Working
**Solution:** 
1. Check Supabase Dashboard → Auth → Providers
2. Make sure Google/Apple are enabled
3. Check credentials are correct

---

## 📝 Testing Checklist

- [ ] Google Sign-In works
- [ ] Apple Sign-In works (if on Safari/Mac)
- [ ] Email Sign-In works
- [ ] Sign-in is fast (< 1 second)
- [ ] Navigation happens immediately
- [ ] Profile loads in background
- [ ] No console errors
- [ ] Redirect URIs are correct

---

## 🔗 Important URLs

- **Local Web:** http://localhost:8081
- **Supabase Dashboard:** https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials

---

## 💡 Tips

1. **Use Chrome DevTools** to see network requests
2. **Check Console** for any errors or logs
3. **Test in Incognito** to avoid cached sessions
4. **Clear browser cache** if issues persist

---

**Ready to test! Start the web server and try signing in!** 🚀

