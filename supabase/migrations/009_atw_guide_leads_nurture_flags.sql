-- Tracks which nurture-sequence emails a lead has already received, so the
-- daily cron job (src/app/api/cron/access-to-work-nurture) is idempotent —
-- safe to run every day without double-sending if a run is missed or retried.
ALTER TABLE atw_guide_leads
  ADD COLUMN IF NOT EXISTS day14_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS day35_sent boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_atw_guide_leads_day14_pending
  ON atw_guide_leads (created_at) WHERE email_sent = true AND day14_sent = false;

CREATE INDEX IF NOT EXISTS idx_atw_guide_leads_day35_pending
  ON atw_guide_leads (created_at) WHERE email_sent = true AND day35_sent = false;
