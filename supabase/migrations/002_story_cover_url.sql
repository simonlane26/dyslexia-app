-- Add AI-generated cover URL to story series
alter table story_series
  add column if not exists cover_url text;

-- Supabase Storage bucket for story covers (run this in the Storage dashboard):
-- Create a public bucket called "story-covers"
-- Or run: insert into storage.buckets (id, name, public) values ('story-covers', 'story-covers', true);
