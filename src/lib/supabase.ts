import { createClient } from '@supabase/supabase-js';

export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export interface School {
  id: string;
  name: string;
  school_code: string;
  plan_tier: 'starter' | 'mid' | 'full';
  stripe_customer_id: string | null;
  max_students: number;
  created_at: string;
  expires_at: string | null;
}

export interface SchoolMember {
  id: string;
  school_id: string;
  clerk_user_id: string;
  role: 'teacher' | 'student';
  display_name: string | null;
  joined_at: string;
}

export interface WritingSession {
  id: string;
  school_id: string;
  member_id: string;
  session_date: string;
  words_typed: number;
  simplifications_used: number;
  avg_sentence_length: number | null;
  session_duration_minutes: number | null;
  created_at: string;
}

export interface StorySeries {
  id: string;
  clerk_user_id: string;
  title: string;
  theme: string;
  character_name: string;
  setting: string | null;
  reading_level: number;
  current_episode: number;
  is_complete: boolean;
  cover_url: string | null;
  created_at: string;
  last_read_at: string;
}

export interface StoryEpisode {
  id: string;
  series_id: string;
  episode_number: number;
  text: string;
  recap: string | null;
  next_teaser: string | null;
  word_count: number;
  new_vocabulary: string[];
  last_word_index: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
  wordIndex: number;
}
