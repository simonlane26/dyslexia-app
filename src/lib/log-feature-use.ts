import { createSupabaseServerClient } from '@/lib/supabase';

/**
 * Fire-and-forget: logs one tool use to feature_usage_logs.
 * Never throws — failures are silently swallowed so they can't affect API responses.
 */
export function logFeatureUse(userId: string, feature: string, workplaceId?: string | null) {
  try {
    const db = createSupabaseServerClient();
    void db.from('feature_usage_logs').insert({
      user_id: userId,
      workplace_id: workplaceId || null,
      feature,
    });
  } catch {
    // Supabase not configured or insert failed — silently skip
  }
}
