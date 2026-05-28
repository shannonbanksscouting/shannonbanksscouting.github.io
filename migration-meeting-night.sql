-- Add meeting_night column to announcements
-- Run this in Supabase SQL Editor

ALTER TABLE public.announcements
ADD COLUMN meeting_night text DEFAULT NULL;

-- Optional constraint to enforce valid values
ALTER TABLE public.announcements
ADD CONSTRAINT announcements_meeting_night_check
CHECK (meeting_night IS NULL OR meeting_night IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday'));

COMMENT ON COLUMN public.announcements.meeting_night IS 'Which meeting night this announcement applies to (null = all nights in that section)';
