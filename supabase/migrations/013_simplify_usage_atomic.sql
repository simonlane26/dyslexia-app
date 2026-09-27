-- Closes a race in simplify_usage: the route previously did
-- SELECT count, then (if under the limit) called a separate increment
-- RPC after the AI call succeeded. Two concurrent requests from the
-- same user could both read the same "under the limit" count before
-- either one wrote back, and both get waved through — a burst of
-- simultaneous requests could exceed FREE_SIMPLIFY_LIMIT/day.
--
-- This does the check and the increment as a single atomic statement,
-- so Postgres's row lock on the upsert serializes concurrent callers:
-- at most p_limit increments can ever succeed for a given user+day,
-- no matter how many requests race in at the same instant.

CREATE OR REPLACE FUNCTION try_increment_simplify_usage(p_user_id text, p_date text, p_limit int)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO simplify_usage (user_id, date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date) DO UPDATE
    SET count = simplify_usage.count + 1
    WHERE simplify_usage.count < p_limit
  RETURNING count INTO new_count;

  RETURN new_count; -- NULL if already at/over the limit — nothing was incremented
END;
$$;

-- Refunds a reserved use when the AI call ultimately fails after the
-- slot was already claimed (upfront, to close the race above), so a
-- provider outage doesn't cost the user one of their daily uses.
CREATE OR REPLACE FUNCTION refund_simplify_usage(p_user_id text, p_date text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE simplify_usage
  SET count = GREATEST(count - 1, 0)
  WHERE user_id = p_user_id AND date = p_date;
$$;
