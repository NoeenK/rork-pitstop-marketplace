-- ========================================
-- SIMPLE REFRESH AND VERIFICATION
-- Run this after any database changes
-- ========================================

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify configuration
SELECT '✅ Checking configuration...' as status;

-- Check messages table structure
SELECT 
  'messages table columns: ' || string_agg(column_name, ', ' ORDER BY ordinal_position) as check_result
FROM information_schema.columns
WHERE table_name = 'messages';

-- Check messages policies
SELECT 
  'messages policies: ' || COUNT(*) || ' active' as check_result,
  string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename = 'messages';

-- Check chat_threads policies
SELECT 
  'chat_threads policies: ' || COUNT(*) || ' active' as check_result,
  string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename = 'chat_threads';

-- Check permissions
SELECT 
  'Permissions for authenticated:' as info,
  table_name,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE grantee = 'authenticated'
AND table_name IN ('messages', 'chat_threads')
GROUP BY table_name;

-- Check realtime
SELECT 
  'Realtime enabled for: ' || string_agg(tablename, ', ') as check_result
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'chat_threads', 'user_status');

-- Verify no blocked_users table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'blocked_users')
    THEN '✗ WARNING: blocked_users TABLE exists (should be a column in profiles)'
    ELSE '✓ Good: blocked_users is NOT a table'
  END as blocked_check;

-- Verify blocked_users column exists in profiles
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'blocked_users'
    )
    THEN '✓ Good: blocked_users column exists in profiles'
    ELSE '⚠️ Note: blocked_users column not in profiles (not required for chat)'
  END as blocked_column_check;

SELECT '✅ Configuration check complete!' as final_status;
