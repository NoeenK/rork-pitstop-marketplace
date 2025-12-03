-- Debug Message Sending Issues
-- Run this to diagnose why messages aren't sending

-- 1. Check if messages table exists and has correct structure
SELECT 
  'Messages table structure' as check_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 2. Check RLS status for messages table
SELECT 
  'RLS Status' as check_name,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'messages';

-- 3. Check all policies on messages table
SELECT 
  'Messages Policies' as check_name,
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read messages'
    WHEN cmd = 'INSERT' THEN 'Send messages'
    WHEN cmd = 'UPDATE' THEN 'Edit/Read receipts'
    WHEN cmd = 'DELETE' THEN 'Delete messages'
  END as description,
  permissive
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

-- 4. Check permissions granted to authenticated users
SELECT 
  'Permissions on messages' as check_name,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_name = 'messages'
AND grantee = 'authenticated'
GROUP BY grantee;

-- 5. Check sample chat thread to verify thread exists
SELECT 
  'Sample chat thread' as check_name,
  id,
  buyer_id,
  seller_id,
  listing_id,
  last_message_at,
  unread_count
FROM chat_threads
LIMIT 1;

-- 6. Check if realtime is enabled for messages
SELECT 
  'Realtime Status' as check_name,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'chat_threads');

-- 7. Test if we can see the auth.uid() function
SELECT 
  'Current Auth Check' as check_name,
  current_user as db_user,
  session_user as session_user;
