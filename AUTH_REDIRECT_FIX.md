# Authentication Redirect Fix

## Problem
After signing in with Google OAuth, the app was getting stuck on the callback screen and not redirecting back to the app. The authentication process was hanging with loading indicators.

## Root Causes

1. **Slow callback processing**: The web callback handler was making too many attempts (up to 10) to check for session, causing delays
2. **Blocking profile checks**: The index routing logic was checking for profile completion before allowing redirect
3. **Missing route registration**: Auth callback routes weren't explicitly registered in the Stack navigator
4. **Complex routing logic**: Multiple async checks were happening before user could enter the app

## Changes Made

### 1. Simplified `/auth/callback` Handler
**File**: `app/auth/callback.tsx`
- Reduced session check attempts from 10 to 2 with shorter timeouts
- Changed from 500ms * 10 attempts to just 100ms + 1000ms wait
- Reduced timeout from 15s to 10s
- Immediate redirect after session is found

### 2. Simplified `/auth/google-callback` Handler  
**File**: `app/auth/google-callback.tsx`
- Removed verbose logging
- Reduced timeout from 15s to 10s
- Cleaner error handling

### 3. Simplified Index Routing
**File**: `app/index.tsx`
- **Removed** profile completion check that was blocking the redirect
- **Removed** async profile fetching from Supabase
- Now immediately redirects authenticated users to home
- Profile checks can happen after user enters the app

### 4. Registered Auth Routes
**File**: `app/_layout.tsx`
- Added explicit Stack.Screen entries for:
  - `auth/callback`
  - `auth/google-callback`
- Both use `fade` animation for smooth transitions

### 5. Enhanced Login Screen Logging
**File**: `app/onboarding/login.tsx`
- Added console logs to track Google sign-in flow
- Better visibility into the authentication process

## How It Works Now

### Web Flow
1. User clicks "Continue with Google"
2. Browser redirects to Google OAuth
3. Google redirects to `/auth/callback`
4. App waits 100ms, checks for session
5. If no session, waits 1000ms more and checks again
6. Once session found → Immediate redirect to `/(tabs)/(home)`

### Mobile Flow
1. User clicks "Continue with Google"
2. WebBrowser opens Google OAuth
3. After auth, returns to `pitstop://auth/google-callback`
4. Callback screen processes the code/tokens
5. Completes sign-in via AuthContext
6. Immediate redirect to `/(tabs)/(home)`

## Key Improvements

✅ **Faster redirects** - No unnecessary waiting or multiple attempts
✅ **Non-blocking** - Profile checks don't delay entry to app  
✅ **Better error handling** - Shorter timeout with clear error messages
✅ **Cleaner flow** - Removed complex async checks from index routing
✅ **Explicit routes** - Auth callbacks properly registered in navigator

## Testing Checklist

- [ ] Web Google sign-in redirects quickly
- [ ] Mobile Google sign-in redirects quickly  
- [ ] Error states show within 10 seconds
- [ ] Can retry after timeout/error
- [ ] App loads correctly after successful auth
- [ ] No infinite loading spinners

## Additional Notes

The profile completion check was moved out of the critical path. If you need profile completion checks, they should be added to the home screen or as a separate onboarding step after the user successfully enters the app.

The AuthContext already handles user state and profile fetching in the background, so the index routing just needs to direct authenticated users to the home screen immediately.
