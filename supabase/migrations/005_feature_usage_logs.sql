-- feature_usage_logs: one row per tool use, for passport analytics
CREATE TABLE IF NOT EXISTS feature_usage_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text        NOT NULL,
  workplace_id  uuid        REFERENCES workplaces(id) ON DELETE SET NULL,
  feature       text        NOT NULL, -- 'simplify' | 'readAloud' | 'coach' | 'decoder' | 'grammarCheck'
  logged_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_date
  ON feature_usage_logs (user_id, logged_at);

CREATE INDEX IF NOT EXISTS idx_feature_usage_workplace_date
  ON feature_usage_logs (workplace_id, logged_at);
