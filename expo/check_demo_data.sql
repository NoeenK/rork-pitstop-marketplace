-- Check for any demo/test data in the database

-- Check listings
SELECT 'Listings' as table_name, COUNT(*) as count FROM public.listings
UNION ALL
-- Check profiles
SELECT 'Profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
-- Check reviews
SELECT 'Reviews' as table_name, COUNT(*) as count FROM public.reviews
UNION ALL
-- Check messages
SELECT 'Messages' as table_name, COUNT(*) as count FROM public.messages
UNION ALL
-- Check chat_threads
SELECT 'Chat Threads' as table_name, COUNT(*) as count FROM public.chat_threads
UNION ALL
-- Check activities
SELECT 'Activities' as table_name, COUNT(*) as count FROM public.activities;
