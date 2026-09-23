-- Enable RLS on tables from 001/004/005 that predate the RLS convention
-- established in 003/006/007/008. These tables are only ever accessed via
-- createSupabaseServerClient() (src/lib/supabase.ts), which uses the
-- service role key — service role bypasses RLS automatically, so enabling
-- it here with no policies simply closes off the public PostgREST API for
-- these tables (anon/authenticated get zero access) without changing any
-- app behaviour.

alter table story_reading_profiles enable row level security;
alter table story_series           enable row level security;
alter table story_episodes         enable row level security;
alter table decoder_usage          enable row level security;
alter table decoder_logs           enable row level security;
alter table feature_usage_logs     enable row level security;
