# Next Steps After Database Setup ✅

You've successfully set up the database! Now follow these steps to complete the integration:

## Step 1: Enable Realtime (2 minutes)

1. Go to your Supabase Dashboard: https://levfwegihveainqdnwkv.supabase.co
2. Click **Database** → **Replication** in the left sidebar
3. Find these tables and toggle them **ON**:
   - ✅ `chat_threads` → Toggle ON
   - ✅ `messages` → Toggle ON

**Note:** If they're already ON, you're good to go!

## Step 2: Configure OAuth Providers (5-10 minutes)

### Google OAuth Setup:

1. Go to **Authentication** → **Providers** → **Google**
2. Click **Enable Google**
3. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
4. Add **Redirect URLs**:
   - `pitstop://auth/google-callback` (for mobile)
   - `https://your-domain.com/auth/callback` (for web, if applicable)
5. Click **Save**

**To get Google OAuth credentials:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a project or select existing
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URIs

### Apple OAuth Setup:

1. Go to **Authentication** → **Providers** → **Apple**
2. Click **Enable Apple**
3. Add your Apple credentials:
   - **Services ID**
   - **Secret Key**
   - **Team ID**
   - **Key ID**
4. Add **Redirect URLs**:
   - `pitstop://auth/callback` (for mobile)
   - `https://your-domain.com/auth/callback` (for web)
5. Click **Save**

**Note:** Apple Sign In requires an Apple Developer account.

## Step 3: Verify Database Setup (1 minute)

1. Go to **Table Editor** in Supabase
2. Verify you see these tables:
   - ✅ `profiles`
   - ✅ `listings`
   - ✅ `chat_threads`
   - ✅ `messages`
   - ✅ `offers`
   - ✅ `saved_listings`
   - ✅ `reviews`
   - ✅ `activities`
   - ✅ `email_verification_codes`

## Step 4: Test Authentication (5 minutes)

### Test Email/Password Sign Up:

1. Open your app
2. Go through onboarding
3. Sign up with a test email (e.g., `test@example.com`)
4. Check Supabase:
   - **Authentication** → **Users** → Should see new user
   - **Table Editor** → **profiles** → Should see new profile

### Test Email/Password Sign In:

1. Sign out from app
2. Sign in with the credentials you just created
3. App should load with your profile

### Test Google Sign In (if configured):

1. Click "Continue with Google" button
2. Complete Google OAuth flow
3. Should redirect back to app and sign you in

### Test Apple Sign In (if configured):

1. Click "Apple" button
2. Complete Apple authentication
3. Should sign you in

## Step 5: Test Real-Time Chat (10 minutes)

**You'll need 2 test accounts for this:**

### Setup:
1. Create **User A** account
2. Create **User B** account
3. Sign in as **User A**

### Test Chat Flow:

1. **Create a listing** (as User A):
   - Go to "Sell" tab
   - Create a test listing
   - Note the listing ID

2. **Start a chat** (as User B):
   - Sign in as User B
   - View the listing created by User A
   - Click "Message Seller" or similar
   - Send a test message

3. **Verify in Supabase**:
   - **Table Editor** → **chat_threads** → Should see new thread
   - **Table Editor** → **messages** → Should see the message

4. **Test Real-Time**:
   - Open chat as User A
   - As User B, send another message
   - Message should appear **instantly** in User A's chat (real-time!)

5. **Test Unread Counts**:
   - Send message from User B
   - Check User A's chat list
   - Should show unread count badge

## Step 6: Verify Everything Works

### Checklist:

- [ ] Email sign up works
- [ ] Email sign in works
- [ ] Google sign in works (if configured)
- [ ] Apple sign in works (if configured)
- [ ] Profile is created automatically on signup
- [ ] Chat threads can be created
- [ ] Messages can be sent
- [ ] Real-time message delivery works
- [ ] Unread counts update correctly
- [ ] Thread list shows correct last message

## Troubleshooting

### Authentication Issues:

**"Provider not enabled" error:**
- Go to Supabase → Authentication → Providers
- Make sure the provider (Google/Apple) is enabled

**"Redirect URI mismatch" error:**
- Check redirect URLs in Supabase match exactly
- For mobile: `pitstop://auth/google-callback`
- Check Google/Apple OAuth settings match

### Chat Issues:

**Messages not appearing:**
- Check Realtime is enabled (Database → Replication)
- Verify both users are authenticated
- Check browser console for errors

**Unread counts not updating:**
- Verify `increment_unread_count()` function exists
- Check trigger `on_message_created_increment_unread` exists

**Real-time not working:**
- Verify tables are in Realtime publication
- Check WebSocket connection in browser console
- Make sure you're authenticated

## What's Working Now:

✅ **Backend fully connected to Supabase**
✅ **Database schema set up**
✅ **Row Level Security policies active**
✅ **Real-time subscriptions configured**
✅ **Authentication flows ready**
✅ **Chat messaging ready**

## Ready for Demo! 🚀

Your app is now fully connected to Supabase and ready for the weekend demo!

If you encounter any issues, check the browser console for errors and verify all steps above are completed.

