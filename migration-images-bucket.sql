-- ============================================
-- Create 'images' storage bucket for announcement images
-- Run in Supabase SQL Editor
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view images (public bucket)
CREATE POLICY "Announcement images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');

-- Authenticated leaders can upload images
CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

-- Authenticated leaders can delete images
CREATE POLICY "Authenticated users can delete images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);
