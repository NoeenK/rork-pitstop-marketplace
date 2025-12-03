# 🚀 Complete Supabase Setup Guide

## Step 1: Run the Main SQL Schema

1. **Go to Supabase Dashboard** → **SQL Editor** (left sidebar)
2. **Click "New Query"**
3. **Copy and paste** the entire contents of `supabase-schema.sql`
4. **Click "Run"** (or press Ctrl+Enter)

This will create all tables:
- ✅ `profiles`
- ✅ `listings`
- ✅ `chat_threads`
- ✅ `messages`
- ✅ `offers`
- ✅ `reviews`
- ✅ `activities`
- ✅ `saved_listings`
- ✅ `email_verification_codes`

**Wait for it to finish** - You should see "Success. No rows returned"

---

## Step 2: Run the Real-time Chat SQL (Optional Enhancement)

1. **Still in SQL Editor**, click **"New Query"**
2. **Copy and paste** the entire contents of `STEP2_REALTIME_CHAT.sql`
3. **Click "Run"**

This adds:
- ✅ Unread count increment function
- ✅ Better real-time triggers
- ✅ Performance indexes

---

## Step 3: Enable Realtime for Tables

You're already on the right page! Here's what to do:

### Option A: Enable via SQL (Recommended - Fastest)

1. **Go to SQL Editor** → **New Query**
2. **Copy and paste this SQL:**

```sql
-- Enable Realtime for all chat-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE listings;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
```

3. **Click "Run"**

### Option B: Enable via Dashboard (Visual Method)

1. **Go to Database** → **Replication** (left sidebar)
2. **Find each table** in the list:
   - `chat_threads`
   - `messages`
   - `listings` (optional)
   - `reviews` (optional)
   - `activities` (optional)
3. **Toggle ON** the switch for each table
4. **Make sure INSERT, UPDATE, DELETE are all enabled**

---

## Step 4: Verify Everything Works

### Check Tables Were Created:

1. **Go to Database** → **Tables** (left sidebar)
2. **Verify you see:**
   - ✅ `profiles`
   - ✅ `listings`
   - ✅ `chat_threads`
   - ✅ `messages`
   - ✅ `offers`
   - ✅ `reviews`
   - ✅ `activities`
   - ✅ `saved_listings`
   - ✅ `email_verification_codes`

### Check Realtime is Enabled:

1. **Go to Database** → **Replication** (or **Publications**)
2. **Verify `supabase_realtime` shows:**
   - ✅ `chat_threads` table listed
   - ✅ `messages` table listed
   - ✅ All toggles (INSERT, UPDATE, DELETE) are ON

---

## Step 5: Test Your App

1. **Start your app:**
   ```bash
   npx expo start
   ```

2. **Test these features:**
   - ✅ Sign up a new user
   - ✅ Create a listing
   - ✅ Send a message
   - ✅ Check Supabase dashboard to see data appear

---

## 🎯 Quick Checklist

- [ ] Step 1: Run `supabase-schema.sql` in SQL Editor
- [ ] Step 2: Run `STEP2_REALTIME_CHAT.sql` in SQL Editor (optional)
- [ ] Step 3: Enable Realtime for `chat_threads` and `messages` tables
- [ ] Step 4: Verify tables exist in Database → Tables
- [ ] Step 5: Test app - sign up, create listing, send message

---

## 📝 Notes

- **The Publications page you're on** shows the real-time configuration
- **You need to run SQL first** to create the tables
- **Then enable Realtime** for those tables
- **Your app is already configured** - it will work once Supabase is set up!

---

## 🔧 Troubleshooting

### If tables don't appear:
- Make sure SQL ran successfully (check for errors)
- Refresh the Tables page

### If Realtime doesn't work:
- Make sure you ran the SQL to add tables to publication
- Or manually enable in Replication page
- Check that INSERT, UPDATE, DELETE toggles are ON

### If app can't connect:
- Check your Supabase URL and anon key in `lib/supabase.ts`
- Make sure your project is active (not paused)

---

## ✅ You're Ready!

Once you complete these steps, your app will:
- ✅ Store all data in Supabase
- ✅ Update in real-time
- ✅ Work with multiple users
- ✅ Be production-ready!

