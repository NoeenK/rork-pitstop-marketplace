-- PITSTOP Marketplace - Avatar Storage Setup
-- Run this in your Supabase SQL Editor to set up avatar storage

-- Note: Storage buckets must be created in the Supabase Dashboard first
-- Go to: Storage → Create bucket → Name: "avatars" → Public: Yes

-- After creating the bucket, run these SQL commands to set up policies:

-- 1. Allow anyone to view avatars (public read access)
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Alternative: Simpler policy that allows any authenticated user to upload/update/delete
-- (Use this if the folder-based approach doesn't work)

-- DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- CREATE POLICY "Avatars are publicly viewable"
-- ON storage.objects
-- FOR SELECT
-- USING (bucket_id = 'avatars');

-- CREATE POLICY "Authenticated users can upload avatars"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can update avatars"
-- ON storage.objects
-- FOR UPDATE
-- USING (bucket_id = 'avatars' AND auth.role() = 'authenticated')
-- WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can delete avatars"
-- ON storage.objects
-- FOR DELETE
-- USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

