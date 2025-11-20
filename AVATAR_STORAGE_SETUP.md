# 📸 Avatar Storage Setup Guide

## How Avatars Work

Avatars are **image files** stored in Supabase Storage (not in SQL tables). The `avatar_url` column in the `profiles` table stores the URL to the image file.

## Setup Steps

### Step 1: Create Storage Bucket (Dashboard)

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name: `avatars`
4. **Public bucket**: ✅ **Yes** (so avatars can be viewed)
5. Click **"Create bucket"**

### Step 2: Set Up Storage Policies (SQL)

Run the SQL commands in `STEP3_AVATAR_STORAGE.sql` in your Supabase SQL Editor.

This will:
- ✅ Allow public viewing of avatars
- ✅ Allow authenticated users to upload avatars
- ✅ Allow users to update/delete their own avatars

### Step 3: Verify Setup

After running the SQL, test:
1. Upload an avatar in the app
2. Check Storage → `avatars` bucket
3. Verify the file appears
4. Check the `profiles.avatar_url` column has the URL

---

## How It Works

1. **User uploads image** → App uploads to `avatars` bucket
2. **Supabase returns URL** → `https://your-project.supabase.co/storage/v1/object/public/avatars/user-id-timestamp.jpg`
3. **URL saved to database** → Stored in `profiles.avatar_url`
4. **Avatar displayed** → App shows image from URL

---

## SQL Schema (Already Exists)

The `profiles` table already has the `avatar_url` column:

```sql
CREATE TABLE profiles (
  ...
  avatar_url TEXT,  -- ✅ Already exists
  ...
);
```

You don't need to create this - it's already in `STEP1_MAIN_SCHEMA.sql`!

---

## Quick Setup Commands

### Option 1: Dashboard + SQL (Recommended)

1. **Dashboard**: Create `avatars` bucket (Public: Yes)
2. **SQL Editor**: Run `STEP3_AVATAR_STORAGE.sql`

### Option 2: All SQL (If you prefer)

Unfortunately, Supabase doesn't allow creating storage buckets via SQL. You **must** create the bucket in the dashboard first, then use SQL for policies.

---

## Troubleshooting

### "Bucket not found" error
→ Make sure you created the `avatars` bucket in the dashboard first

### "Permission denied" error
→ Run the SQL policies from `STEP3_AVATAR_STORAGE.sql`

### Avatar not showing
→ Check:
1. Bucket is public
2. Policies are set up
3. `avatar_url` column has a valid URL
4. URL is accessible (try opening in browser)

---

## Summary

- ✅ **Storage bucket**: Create in dashboard (`avatars`)
- ✅ **Policies**: Run SQL from `STEP3_AVATAR_STORAGE.sql`
- ✅ **Database column**: Already exists (`profiles.avatar_url`)
- ✅ **App code**: Already implemented

You're all set! 🎉

