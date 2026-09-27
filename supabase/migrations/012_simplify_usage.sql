-- simplify_usage: tracks daily Simplify count per user (free-tier rate
-- limiting). Mirrors decoder_usage (004_decoder_usage.sql) — a
-- persistent, per-account counter rather than the in-memory,
-- IP-keyed Map the route used before, which didn't scale correctly
-- across serverless instances and never distinguished Pro accounts.
CREATE TABLE IF NOT EXISTS simplify_usage (
  user_id  text    NOT NULL,
  date     text    NOT NULL, -- 'YYYY-MM-DD'
  count    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Atomically increment the daily counter and return the new value
CREATE OR REPLACE FUNCTION increment_simplify_usage(p_user_id text, p_date text)
RETURNS integer
LANGUAGE sql
AS $$
  INSERT INTO simplify_usage (user_id, date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date) DO UPDATE SET count = simplify_usage.count + 1
  RETURNING count;
$$;

-- Service role bypasses RLS automatically
ALTER TABLE simplify_usage ENABLE ROW LEVEL SECURITY;
