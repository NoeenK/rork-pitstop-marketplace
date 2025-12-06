-- Setup Supabase Storage for chat images
-- Run this in your Supabase SQL Editor

-- Note: You must create the 'chat-images' bucket in Supabase Dashboard first:
-- 1. Go to Storage → Create bucket
-- 2. Name: "chat-images"
-- 3. Public bucket: Yes (so images can be viewed)
-- 4. Then run these SQL commands:

-- 1. Allow anyone to view chat images (public read access)
CREATE POLICY IF NOT EXISTS "Chat images are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-images');

-- 2. Allow authenticated users to upload chat images
CREATE POLICY IF NOT EXISTS "Users can upload chat images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Allow users to update their own chat images
CREATE POLICY IF NOT EXISTS "Users can update chat images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow users to delete their own chat images
CREATE POLICY IF NOT EXISTS "Users can delete chat images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

