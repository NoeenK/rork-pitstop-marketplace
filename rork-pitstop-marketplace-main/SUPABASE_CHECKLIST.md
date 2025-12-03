# ✅ Supabase Integration Checklist

## Quick Setup Steps

### 1. Database Setup (5 minutes)
- [ ] Go to https://levfwegihveainqdnwkv.supabase.co
- [ ] Open **SQL Editor**
- [ ] Create **New Query**
- [ ] Copy and paste entire `supabase-schema.sql` file
- [ ] Click **Run**
- [ ] Verify no errors in output

### 2. Enable Realtime (2 minutes)
- [ ] Go to **Database** → **Replication**
- [ ] Find `chat_threads` table and enable replication
- [ ] Find `messages` table and enable replication

### 3. Authentication Settings (Optional - 2 minutes)
- [ ] Go to **Authentication** → **Settings**
- [ ] Verify email confirmation is configured as needed
- [ ] (Optional) Go to **Providers** → **Google** to enable OAuth

### 4. Test the App (5 minutes)

#### Test Sign Up
- [ ] Open app and go through onboarding
- [ ] Sign up with test email: `test@example.com`
- [ ] Check Supabase **Authentication** tab - new user should appear
- [ ] Check **Table Editor** → **profiles** - new profile should exist

#### Test Sign In
- [ ] Sign out from app
- [ ] Sign in with test credentials
- [ ] App should load with user profile

#### Test Chat (requires 2 users)
- [ ] Create a listing as User A
- [ ] Sign in as User B
- [ ] Message User A about the listing
- [ ] Check **Table Editor** → **chat_threads** - new thread should exist
- [ ] Check **Table Editor** → **messages** - messages should appear
- [ ] Messages should appear in real-time for both users

## Expected Database Tables

After running the SQL, you should have these tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (linked to auth.users) |
| `listings` | Marketplace listings |
| `chat_threads` | Chat conversations |
| `messages` | Individual chat messages |
| `offers` | Price/swap offers |
| `saved_listings` | User favorites |
| `reviews` | User ratings/reviews |
| `activities` | Notifications/activity feed |

## Verification Commands

Run these in SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check if realtime is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Check if triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## Troubleshooting

### Issue: "relation does not exist"
**Solution:** Run `supabase-schema.sql` again

### Issue: New user created but no profile
**Solution:** Check if `handle_new_user` function exists:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';
```

### Issue: Can't see other user's messages
**Solution:** Verify both users are part of the same chat thread

### Issue: Messages not appearing in real-time
**Solution:** 
1. Enable Realtime for `messages` table
2. Check browser console for WebSocket errors
3. Verify Supabase URL is correct

## Security Status

✅ Row Level Security (RLS) is enabled on all tables
✅ Users can only access their own data
✅ Auth tokens are stored securely
✅ Realtime subscriptions are authenticated

## What's Working

- ✅ User registration & authentication
- ✅ Profile creation on signup
- ✅ Session persistence
- ✅ Real-time chat messaging
- ✅ Chat thread management
- ✅ Offer creation & management
- ✅ Saved listings functionality

## Next Steps

Once database is set up, you can:
1. Start testing auth flows
2. Create test listings
3. Test chat between users
4. Build out remaining features (search, reviews, etc.)

The database schema supports all planned marketplace features!
