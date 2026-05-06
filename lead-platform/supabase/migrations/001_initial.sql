-- Lead Automation Platform — Initial Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE companies (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  domain      TEXT,
  linkedin_url TEXT,
  industry    TEXT,
  size_estimate TEXT,
  score       INTEGER     DEFAULT 0,
  status      TEXT        NOT NULL DEFAULT 'new'
              CHECK (status IN (
                'new','scored','disqualified','researching',
                'ready_for_content','content_created','pending_approval',
                'approved','sent','replied','follow_up_sent','closed'
              )),
  source      TEXT        NOT NULL DEFAULT '',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE research_data (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID        REFERENCES companies(id) ON DELETE CASCADE,
  linkedin_data       JSONB,
  website_data        JSONB,
  google_reviews      JSONB,
  additional_reviews  JSONB,
  satisfaction_report TEXT,
  pain_points         TEXT[],
  opportunities       TEXT[],
  researched_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID        REFERENCES companies(id) ON DELETE CASCADE,
  page_url       TEXT,
  page_status    TEXT        DEFAULT 'draft'
                 CHECK (page_status IN ('draft','deployed','failed')),
  report_content TEXT,
  report_status  TEXT        DEFAULT 'draft'
                 CHECK (report_status IN ('draft','ready')),
  email_subject  TEXT,
  email_subtitle TEXT,
  email_body     TEXT,
  email_links    JSONB,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE outreach (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id        UUID        REFERENCES companies(id) ON DELETE CASCADE,
  content_id        UUID        REFERENCES content(id) ON DELETE SET NULL,
  recipient_email   TEXT,
  gmail_message_id  TEXT,
  gmail_thread_id   TEXT,
  sent_at           TIMESTAMPTZ,
  replied           BOOLEAN     DEFAULT false,
  replied_at        TIMESTAMPTZ,
  reply_preview     TEXT,
  follow_up_count   INTEGER     DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ
);

CREATE TABLE agent_log (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID        REFERENCES companies(id) ON DELETE SET NULL,
  agent_name    TEXT        NOT NULL,
  action        TEXT        NOT NULL,
  status        TEXT        NOT NULL
                CHECK (status IN ('success','error','skipped')),
  payload       JSONB,
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_companies_status     ON companies(status);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX idx_research_company_id  ON research_data(company_id);
CREATE INDEX idx_content_company_id   ON content(company_id);
CREATE INDEX idx_outreach_company_id  ON outreach(company_id);
CREATE INDEX idx_outreach_replied     ON outreach(replied);
CREATE INDEX idx_agent_log_company_id ON agent_log(company_id);
CREATE INDEX idx_agent_log_created_at ON agent_log(created_at DESC);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE companies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE content       ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_log     ENABLE ROW LEVEL SECURITY;

-- Anon can read everything (for the UI board)
CREATE POLICY "anon_read_companies"     ON companies     FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_research"      ON research_data FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_content"       ON content       FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_outreach"      ON outreach      FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_agent_log"     ON agent_log     FOR SELECT TO anon USING (true);

-- service_role bypasses RLS — used by API routes
