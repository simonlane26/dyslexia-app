-- screener_leads: opt-in email capture from the Free Screener results screen.
-- A row is written only when a visitor submits the "email me my results" form —
-- the screener itself remains anonymous and on-device otherwise.
CREATE TABLE IF NOT EXISTS screener_leads (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL,
  audience        text        CHECK (audience IN ('self', 'parent-sen', 'employer')), -- optional "this is for..." answer
  screener_result text        NOT NULL CHECK (screener_result IN ('likely', 'possible', 'unlikely')),
  source          text        NOT NULL DEFAULT 'free-screener',
  email_sent      boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screener_leads_created_at ON screener_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screener_leads_audience ON screener_leads (audience);

-- This table holds email addresses; lock it down beyond the app's service-role
-- access (no anon/public policies are defined, so RLS denies all client access).
ALTER TABLE screener_leads ENABLE ROW LEVEL SECURITY;
