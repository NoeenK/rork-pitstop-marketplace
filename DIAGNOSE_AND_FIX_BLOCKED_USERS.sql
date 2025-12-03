-- ========================================
-- DIAGNOSE AND FIX BLOCKED_USERS ERROR
-- This script finds and removes any references to blocked_users TABLE
-- ========================================

-- Step 1: Find all functions that reference blocked_users table
SELECT 
  '========================================' as info
UNION ALL
SELECT 'STEP 1: Checking for functions that reference blocked_users'
UNION ALL
SELECT '========================================';

SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%blocked_users%'
  AND n.nspname = 'public';

-- Step 2: Find all triggers that might reference blocked_users
SELECT 
  '' as info
UNION ALL
SELECT '========================================'
UNION ALL
SELECT 'STEP 2: Checking for triggers that reference blocked_users'
UNION ALL
SELECT '========================================';

SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE pg_get_triggerdef(t.oid) ILIKE '%blocked_users%'
  AND n.nspname = 'public'
  AND NOT t.tgisinternal;

-- Step 3: Find all views that reference blocked_users
SELECT 
  '' as info
UNION ALL
SELECT '========================================'
UNION ALL
SELECT 'STEP 3: Checking for views that reference blocked_users'
UNION ALL
SELECT '========================================';

SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE definition ILIKE '%blocked_users%'
  AND schemaname = 'public';

-- Step 4: Check if blocked_users table exists (it should NOT)
SELECT 
  '' as info
UNION ALL
SELECT '========================================'
UNION ALL
SELECT 'STEP 4: Checking if blocked_users table exists (should be NO)'
UNION ALL
SELECT '========================================';

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'blocked_users' AND schemaname = 'public')
    THEN '✗ WARNING: blocked_users TABLE exists (it should not!)'
    ELSE '✓ Good: blocked_users table does NOT exist'
  END as status;

-- Step 5: Confirm blocked_users is a COLUMN in profiles
SELECT 
  '' as info
UNION ALL
SELECT '========================================'
UNION ALL
SELECT 'STEP 5: Confirming blocked_users is a column in profiles'
UNION ALL
SELECT '========================================';

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'blocked_users'
    )
    THEN '✓ Good: blocked_users column exists in profiles'
    ELSE '✗ ERROR: blocked_users column missing from profiles!'
  END as status;

-- Step 6: Check RLS policies on messages for blocked_users references
SELECT 
  '' as info
UNION ALL
SELECT '========================================'
UNION ALL
SELECT 'STEP 6: Checking RLS policies for blocked_users references'
UNION ALL
SELECT '========================================';

SELECT 
  schemaname,
  tablename,
  policyname,
  pg_get_expr(qual, (schemaname || '.' || tablename)::regclass) as using_expression,
  pg_get_expr(with_check, (schemaname || '.' || tablename)::regclass) as with_check_expression
FROM pg_policies
WHERE (
  pg_get_expr(qual, (schemaname || '.' || tablename)::regclass) ILIKE '%blocked_users%'
  OR pg_get_expr(with_check, (schemaname || '.' || tablename)::regclass) ILIKE '%blocked_users%'
)
AND schemaname = 'public';

SELECT 
  '' as info
UNION ALL
SELECT '========================================'
UNION ALL
SELECT 'DIAGNOSIS COMPLETE - Check results above'
UNION ALL
SELECT '========================================';
