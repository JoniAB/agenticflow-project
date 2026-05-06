-- Migration 002: Align schema with SOP-001-cold-outreach
-- Run this in Supabase SQL Editor after migration 001

-- ============================================================
-- companies — add SOP fields
-- ============================================================

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS cowork_id          TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS website            TEXT,
  ADD COLUMN IF NOT EXISTS contact_name       TEXT,
  ADD COLUMN IF NOT EXISTS contact_email      TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone      TEXT,
  ADD COLUMN IF NOT EXISTS contact_linkedin   TEXT,
  ADD COLUMN IF NOT EXISTS cowork_raw_data    JSONB,
  ADD COLUMN IF NOT EXISTS current_board      TEXT NOT NULL DEFAULT 'B-01',
  ADD COLUMN IF NOT EXISTS scoring_result     INTEGER CHECK (scoring_result BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS scoring_notes      TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason   TEXT;

-- Update status constraint to match SOP boards
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_status_check;
ALTER TABLE companies ADD CONSTRAINT companies_status_check
  CHECK (status IN (
    'new',
    'scoring',
    'insufficient_data',
    'potential',
    'high_score',
    'in_research',
    'research_incomplete',
    'awaiting_approval',
    'awaiting_followup_approval',
    'approved',
    'edit_required',
    'sent',
    'send_failed',
    'replied',
    'followup_sent',
    'exhausted',
    'rejected'
  ));

-- Update source constraint
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_source_check;
ALTER TABLE companies ADD CONSTRAINT companies_source_check
  CHECK (source IN ('cowork_api', 'cowork_webhook', 'linkedin', 'google_maps', 'other'));

-- ============================================================
-- research_data — add missing_sources
-- ============================================================

ALTER TABLE research_data
  ADD COLUMN IF NOT EXISTS missing_sources TEXT[];

-- ============================================================
-- content — add SOP fields
-- ============================================================

ALTER TABLE content
  ADD COLUMN IF NOT EXISTS report_url          TEXT,
  ADD COLUMN IF NOT EXISTS landing_page_failed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS company_slug        TEXT,
  ADD COLUMN IF NOT EXISTS followup_subject    TEXT,
  ADD COLUMN IF NOT EXISTS followup_body       TEXT;

-- ============================================================
-- outreach — add full reply body
-- ============================================================

ALTER TABLE outreach
  ADD COLUMN IF NOT EXISTS reply_body TEXT;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_companies_cowork_id    ON companies(cowork_id);
CREATE INDEX IF NOT EXISTS idx_companies_current_board ON companies(current_board);
CREATE INDEX IF NOT EXISTS idx_companies_board_status  ON companies(current_board, status);
CREATE INDEX IF NOT EXISTS idx_content_company_slug    ON content(company_slug);
