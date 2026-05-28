-- ============================================
-- Shannon Banks Scouting - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'leader',
    section TEXT,
    meeting_day TEXT,
    title TEXT,
    bio TEXT,
    avatar_url TEXT,
    show_on_leaders_page BOOLEAN NOT NULL DEFAULT false,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    section TEXT NOT NULL DEFAULT 'general',
    date_display TEXT NOT NULL DEFAULT '',
    pinned_home BOOLEAN NOT NULL DEFAULT false,
    slug TEXT UNIQUE NOT NULL,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for PROFILES

-- Anyone can read profiles (public leaders display)
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Authenticated users can update is_suspended on any profile (for user management)
CREATE POLICY "Leaders can suspend other users"
    ON public.profiles FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- 5. RLS Policies for ANNOUNCEMENTS

-- Anyone can read announcements
CREATE POLICY "Announcements are viewable by everyone"
    ON public.announcements FOR SELECT
    USING (true);

-- Authenticated users can insert announcements
CREATE POLICY "Authenticated users can create announcements"
    ON public.announcements FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update any announcement
CREATE POLICY "Authenticated users can update announcements"
    ON public.announcements FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete any announcement
CREATE POLICY "Authenticated users can delete announcements"
    ON public.announcements FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- 6. Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- 7. Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        SPLIT_PART(NEW.email, '@', 1),
        SPLIT_PART(NEW.email, '@', 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Index for common queries
CREATE INDEX idx_announcements_section ON public.announcements(section);
CREATE INDEX idx_announcements_pinned ON public.announcements(pinned_home) WHERE pinned_home = true;
CREATE INDEX idx_announcements_created ON public.announcements(created_at DESC);
CREATE INDEX idx_profiles_show_leaders ON public.profiles(show_on_leaders_page) WHERE show_on_leaders_page = true;
