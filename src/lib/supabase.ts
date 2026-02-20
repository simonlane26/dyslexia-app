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
