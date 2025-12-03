# Database Errors - Complete Fix Summary

## Errors Fixed
1. ✅ `Could not find a relationship between 'chat_threads' and 'profiles'`
2. ✅ `Could not find a relationship between 'listings' and 'profiles'`
3. ✅ `Cannot coerce the result to a single JSON object` (missing profiles)

## Quick Fix (Do This Now!)

### Run This SQL Script in Supabase:
**File**: `RUN_THIS_TO_FIX_ALL_ERRORS.sql`

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `RUN_THIS_TO_FIX_ALL_ERRORS.sql`
3. Paste and run
4. Wait for "✓ ALL FIXES APPLIED SUCCESSFULLY!"
5. Reload your app

That's it! Your errors should be fixed.

## What Was Wrong?

### Problem 1: Missing Foreign Keys
The database had foreign key **relationships** but not properly named **constraints**. 

When you query:
```typescript
.select('*, buyer:profiles!buyer_id(*)')
```

Supabase (PostgREST) needs a constraint named `chat_threads_buyer_id_fkey` to understand this relationship.

**Without it**: ❌ Error - "Could not find relationship"
**With it**: ✅ Works perfectly

### Problem 2: Schema Cache Not Refreshed
Even if foreign keys exist, PostgREST caches the schema. It won't recognize new constraints until you run:
```sql
NOTIFY pgrst, 'reload schema';
```

### Problem 3: Missing Profiles
Users existed in `auth.users` but not in `profiles` table. This happens when:
- The profile creation trigger wasn't active
- The trigger failed silently
- Users were created before the trigger existed

When AuthContext tries to fetch the profile:
```typescript
.from("profiles")
.eq("id", profileId)
.single()  // ❌ Expects exactly 1 row, gets 0
```

## Files Created

### Main Fix
- **`RUN_THIS_TO_FIX_ALL_ERRORS.sql`** - Run this in Supabase (fixes everything)

### Documentation
- **`QUICK_FIX_INSTRUCTIONS.md`** - Simple step-by-step guide
- **`FIX_DATABASE_ERRORS_GUIDE.md`** - Detailed explanation

### Individual Scripts (if needed)
- **`FIX_FOREIGN_KEY_RELATIONSHIPS.sql`** - Just fixes foreign keys
- **`CREATE_MISSING_PROFILES.sql`** - Just creates profiles

## Technical Details

### Foreign Keys Added
```sql
chat_threads_buyer_id_fkey    → profiles(id)
chat_threads_seller_id_fkey   → profiles(id)
listings_seller_id_fkey       → profiles(id)
reviews_reviewer_id_fkey      → profiles(id)
reviews_reviewee_id_fkey      → profiles(id)
messages_sender_id_fkey       → profiles(id)
```

### Profile Creation Logic
For each user in `auth.users` without a profile:
- Extract metadata (name, team, phone, etc.)
- Create profile with sensible defaults
- Handle NULL values safely
- Skip if profile already exists (ON CONFLICT DO NOTHING)

## Verification Commands

Check if fix worked:
```sql
-- Should match
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM profiles;

-- Should list all foreign keys
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';
```

## Prevention

To avoid this in the future:
1. Always define foreign keys when creating tables
2. Run `NOTIFY pgrst, 'reload schema'` after schema changes
3. Verify profile trigger is active before creating users
4. Test with fresh users after any auth changes

## Support

If errors persist after running the fix:
1. Check Supabase SQL output for errors
2. Verify both scripts completed successfully
3. Hard refresh your app (clear cache)
4. Check console logs for new error messages
