-- decoder_usage: tracks monthly decode count per user (for free-tier rate limiting)
CREATE TABLE IF NOT EXISTS decoder_usage (
  user_id  text    NOT NULL,
  month    text    NOT NULL, -- 'YYYY-MM'
  count    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

-- decoder_logs: one row per decode, used for workplace analytics
CREATE TABLE IF NOT EXISTS decoder_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text        NOT NULL,
  workplace_id  uuid        REFERENCES workplaces(id) ON DELETE SET NULL,
  document_type text        NOT NULL DEFAULT 'Document',
  decoded_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decoder_logs_workplace_month
  ON decoder_logs (workplace_id, decoded_at);

-- Atomically increment the monthly counter and return the new value
CREATE OR REPLACE FUNCTION increment_decoder_usage(p_user_id text, p_month text)
RETURNS integer
LANGUAGE sql
AS $$
  INSERT INTO decoder_usage (user_id, month, count)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month) DO UPDATE SET count = decoder_usage.count + 1
  RETURNING count;
$$;
