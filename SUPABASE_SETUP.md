# Supabase Integration Setup Guide

This guide will help you set up Supabase for authentication and real-time chat in your PITSTOP Marketplace app.

## ✅ What's Already Done

The app is already configured with:
- Supabase client initialized in `lib/supabase.ts`
- Auth integration in `contexts/AuthContext.tsx`
- Real-time chat integration in `contexts/ChatContext.tsx`
- Your Supabase credentials are set up

## 📋 Next Steps - Database Setup

### Step 1: Create Database Tables

1. Go to your Supabase project: https://levfwegihveainqdnwkv.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL Editor
6. Click **Run** to execute the SQL

This will create all necessary tables:
- `profiles` - User profiles
- `listings` - Marketplace listings
- `chat_threads` - Chat conversations between buyers and sellers
- `messages` - Individual messages in chat threads
- `offers` - Price offers and swap proposals
- `saved_listings` - User's saved/favorited listings
- `reviews` - User reviews and ratings
- `activities` - Notifications and activity feed

### Step 2: Enable Realtime (Optional but Recommended)

For real-time chat updates:

1. Go to **Database** → **Replication** in Supabase
2. Enable replication for these tables:
   - `chat_threads`
   - `messages`

### Step 3: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Email** provider (already enabled by default)
3. (Optional) Enable **Google** provider if you want OAuth:
   - Click on Google provider
   - Add your Google OAuth credentials
   - Add authorized redirect URLs

### Step 4: Test the Integration

Try these features in your app:

#### Sign Up
1. Open the app
2. Go through onboarding
3. Sign up with email and password
4. Check Supabase Authentication tab to see the new user

#### Sign In
1. Use the credentials you just created
2. Sign in to the app
3. Your profile should load automatically

#### Chat (after listings are created)
1. Create a listing
2. As another user, message the seller
3. Messages should appear in real-time

## 🔒 Security

The database is secured with Row Level Security (RLS) policies:
- Users can only view and edit their own profiles
- Users can only see messages in their own chat threads
- Listings are publicly viewable but only editable by owners
- All sensitive operations are protected

## 🎯 What Works Now

### Authentication
- ✅ Email/password sign up
- ✅ Email/password sign in
- ✅ Sign out
- ✅ Session persistence
- ✅ Profile creation on signup
- ✅ Google OAuth (if configured)

### Chat
- ✅ Create chat threads
- ✅ Send messages
- ✅ Real-time message updates
- ✅ Thread list with unread counts
- ✅ Mark threads as read

### Offers
- ✅ Create price offers
- ✅ Update offer status
- ✅ Seller can accept/decline offers

### Saved Listings
- ✅ Save/favorite listings
- ✅ View saved listings

## 📝 Notes

- The app uses the Supabase anon key for client-side operations
- All database operations respect Row Level Security policies
- Realtime subscriptions automatically clean up when components unmount
- Auth state is synced across the app via AuthContext

## 🐛 Troubleshooting

### "relation does not exist" errors
Run the SQL schema again in Supabase SQL Editor

### Authentication not working
1. Check that email provider is enabled in Supabase
2. Check browser console for errors
3. Verify Supabase URL and anon key are correct in `lib/supabase.ts`

### Chat messages not appearing
1. Enable Realtime replication for `chat_threads` and `messages` tables
2. Check that both users are authenticated
3. Verify chat thread was created successfully

### Profile data not loading
1. Check that the `handle_new_user` function exists in Supabase
2. Verify the trigger is enabled
3. Manually create a profile if needed:
   ```sql
   INSERT INTO profiles (id, email, full_name)
   VALUES ('user-uuid', 'email@example.com', 'Full Name');
   ```

## 🚀 Next Features to Implement

You can now build:
- Listings management (create, update, delete listings)
- Search and filters for listings
- User profiles and ratings
- Activity/notification feed
- Reviews system
- More!

The database schema is ready for all these features.
