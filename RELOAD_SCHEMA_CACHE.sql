-- ============================================
-- RELOAD SCHEMA CACHE - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This command forces PostgREST to reload the schema cache
-- so it can see all the columns you've added to tables
-- ============================================

NOTIFY pgrst, 'reload sbuchema';

-- After running this, wait 2-3 seconds before testing your app
-- The schema cache should now include all your new columns
