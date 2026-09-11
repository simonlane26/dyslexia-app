-- atw_guide_leads: opt-in email capture for the "Access to Work funding guide"
-- section embedded on the homepage, pricing page, and its standalone
-- /access-to-work-guide page. A row is written only when a visitor submits
-- the "Send me the funding guide" form.
CREATE TABLE IF NOT EXISTS atw_guide_leads (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text        NOT NULL,
  first_name     text,
  applying_via   text        CHECK (applying_via IN ('access-to-work', 'school-university', 'employer', 'not-sure')),
  source         text        NOT NULL DEFAULT 'homepage', -- which surface the form was submitted from
  email_sent     boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_atw_guide_leads_created_at ON atw_guide_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atw_guide_leads_applying_via ON atw_guide_leads (applying_via);

-- This table holds email addresses; lock it down beyond the app's service-role
-- access (no anon/public policies are defined, so RLS denies all client access).
ALTER TABLE atw_guide_leads ENABLE ROW LEVEL SECURITY;
