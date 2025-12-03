# 📋 SQL Setup Instructions for Supabase

## ✅ Which SQL Files to Run

You need to run **2 SQL files** in this exact order:

### **Step 1: Main Database Schema**
**File:** `STEP1_MAIN_SCHEMA.sql`

**What it does:**
- Creates all database tables (`profiles`, `listings`, `chat_threads`, `messages`, `offers`, etc.)
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Sets up triggers for user creation
- Configures real-time publication

**Run this FIRST!**

---

### **Step 2: Real-time Chat Setup**
**File:** `STEP2_REALTIME_CHAT.sql`

**What it does:**
- Creates function to increment unread message counts
- Sets up trigger for automatic unread count updates
- Ensures real-time publication for chat tables

**Run this SECOND!**

---

## 🚀 How to Run in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `levfwegihveainqdnwkv`
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run STEP1_MAIN_SCHEMA.sql
1. Click **"New query"**
2. Open `STEP1_MAIN_SCHEMA.sql` from your project
3. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
4. **Paste into the SQL Editor** (Ctrl+V)
5. Click **"Run"** button (or press Ctrl+Enter)
6. Wait for it to complete (should see "Success" message)

### Step 3: Run STEP2_REALTIME_CHAT.sql
1. Click **"New query"** (or clear the previous one)
2. Open `STEP2_REALTIME_CHAT.sql` from your project
3. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
4. **Paste into the SQL Editor** (Ctrl+V)
5. Click **"Run"** button (or press Ctrl+Enter)
6. Wait for it to complete (should see "Success" message)

---

## ✅ Verification

After running both SQL files, verify:

1. **Check Tables:**
   - Go to **"Table Editor"** in Supabase Dashboard
   - You should see these tables:
     - `profiles`
     - `listings`
     - `chat_threads`
     - `messages`
     - `offers`
     - `saved_listings`
     - `reviews`
     - `activities`
     - `email_verification_codes`

2. **Check Realtime:**
   - Go to **"Database"** → **"Replication"**
   - Verify `chat_threads` and `messages` are enabled for Realtime

---

## ⚠️ Important Notes

1. **Run in Order:** Always run STEP1 before STEP2
2. **Idempotent:** Both files are safe to run multiple times (they check if objects exist first)
3. **No Errors Expected:** If you see errors about "already exists", that's normal - the scripts handle it
4. **One Commit:** Yes, you only see one commit because we force-pushed everything at once

---

## 📝 Summary

**Run these 2 files in order:**
1. ✅ `STEP1_MAIN_SCHEMA.sql` - Main database setup
2. ✅ `STEP2_REALTIME_CHAT.sql` - Real-time chat setup

**That's it!** After running both, your database is ready for the app.

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/levfwegihveainqdnwkv
- **SQL Editor:** https://supabase.com/dashboard/project/levfwegihveainqdnwkv/sql/new
- **GitHub Repo:** https://github.com/NoeenK/rork-pitstop-marketplace

