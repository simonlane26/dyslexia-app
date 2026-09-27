-- Generic per-user daily usage counter, shared across several
-- free-tier-limited AI features (rewrite, check_message, tone_check,
-- tts) that previously had no server-side enforcement at all — either
-- no limit whatsoever, or a limit tracked only in browser localStorage
-- (trivially bypassed by clearing storage or calling the API
-- directly). Mirrors simplify_usage / try_increment_simplify_usage,
-- just keyed by an extra `feature` column instead of a dedicated table
-- per feature.

CREATE TABLE IF NOT EXISTS api_usage (
  user_id  text    NOT NULL,
  feature  text    NOT NULL,
  date     text    NOT NULL, -- 'YYYY-MM-DD'
  count    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, feature, date)
);

-- Atomic check-and-increment — see 013_simplify_usage_atomic.sql for
-- why this needs to be one statement rather than select-then-update.
CREATE OR REPLACE FUNCTION try_increment_api_usage(p_user_id text, p_feature text, p_date text, p_limit int)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO api_usage (user_id, feature, date, count)
  VALUES (p_user_id, p_feature, p_date, 1)
  ON CONFLICT (user_id, feature, date) DO UPDATE
    SET count = api_usage.count + 1
    WHERE api_usage.count < p_limit
  RETURNING count INTO new_count;

  RETURN new_count; -- NULL if already at/over the limit
END;
$$;

-- Refunds a reserved use when the upstream call ultimately fails
-- after the slot was already claimed, so a provider hiccup doesn't
-- cost the user one of their daily uses.
CREATE OR REPLACE FUNCTION refund_api_usage(p_user_id text, p_feature text, p_date text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE api_usage
  SET count = GREATEST(count - 1, 0)
  WHERE user_id = p_user_id AND feature = p_feature AND date = p_date;
$$;

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
