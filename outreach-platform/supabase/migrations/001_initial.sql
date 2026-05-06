-- Cold Outreach Multi-Agent System — Initial Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- BOARDS CONFIG (static reference table)
-- ============================================================

CREATE TABLE boards (
  board_id    TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  position    INTEGER     NOT NULL,
  owner_agent TEXT
);

INSERT INTO boards (board_id, name, description, position, owner_agent) VALUES
  ('B-01', 'Prospect Pool',    'Raw company data, unvalidated',                 1, 'research-agent'),
  ('B-02', 'Enriched Leads',   'Validated + enriched company profiles',          2, 'research-agent'),
  ('B-03', 'Qualification',    'Scoring and ICP fit assessment',                 3, 'qualification-agent'),
  ('B-04', 'Outreach Queue',   'Approved leads ready for first contact',         4, 'outbound-agent'),
  ('B-05', 'Active Outreach',  'First message sent, awaiting response',          5, 'outbound-agent'),
  ('B-06', 'Follow-up',        'No response — scheduled follow-up sequence',     6, 'followup-agent'),
  ('B-07', 'Responded',        'Lead replied — human takes over',                7, NULL),
  ('B-08', 'Archive',          'Not qualified, opted out, or closed lost',       8, NULL);

-- ============================================================
-- LEADS
-- ============================================================

CREATE TABLE leads (
  lead_id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Base fields
  company_name         TEXT        NOT NULL,
  website              TEXT,
  industry             TEXT,
  employee_count       INTEGER,
  hq_location          TEXT,
  linkedin_url         TEXT,
  contact_name         TEXT,
  contact_title        TEXT,
  contact_email        TEXT,
  contact_linkedin     TEXT,

  -- Pipeline state
  current_board        TEXT        NOT NULL DEFAULT 'B-01'
                       REFERENCES boards(board_id),
  status               TEXT        NOT NULL DEFAULT 'new'
                       CHECK (status IN (
                         'new','in_progress','ready',
                         'pending_review','qualified','rejected','needs_human_review',
                         'queued',
                         'contacted','no_response','send_failed',
                         'following_up','exhausted',
                         'responded',
                         'archived'
                       )),
  assigned_agent       TEXT,
  created_by           TEXT        NOT NULL DEFAULT 'human',

  -- Qualification fields (B-03+)
  icp_score            INTEGER     CHECK (icp_score BETWEEN 0 AND 100),
  icp_notes            TEXT,
  rejection_reason     TEXT,

  -- Outreach fields (B-04+)
  outreach_channel     TEXT        CHECK (outreach_channel IN ('email','linkedin','whatsapp')),
  first_message_sent_at TIMESTAMPTZ,
  first_message_text   TEXT,

  -- Follow-up fields (B-06)
  followup_count       INTEGER     DEFAULT 0,
  next_followup_at     TIMESTAMPTZ,

  -- Response fields (B-07)
  response_received_at TIMESTAMPTZ,
  response_sentiment   TEXT        CHECK (response_sentiment IN ('positive','neutral','negative')),

  -- Free-text notes (any agent)
  agent_notes          TEXT,

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ACTIVITY LOG (per-lead audit trail)
-- ============================================================

CREATE TABLE activity_log (
  activity_id  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id      UUID        REFERENCES leads(lead_id) ON DELETE CASCADE,
  type         TEXT        NOT NULL
               CHECK (type IN ('note','advance','reject','field_update','scheduled_check','outreach','followup')),
  body         TEXT,
  channel      TEXT,
  agent_id     TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AGENT TASKS
-- ============================================================

CREATE TABLE agent_tasks (
  task_id      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id     TEXT        NOT NULL,
  lead_id      UUID        REFERENCES leads(lead_id) ON DELETE SET NULL,
  type         TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'open'
               CHECK (status IN ('open','complete','failed')),
  payload      JSONB,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_leads_board         ON leads(current_board);
CREATE INDEX idx_leads_status        ON leads(status);
CREATE INDEX idx_leads_assigned      ON leads(assigned_agent);
CREATE INDEX idx_leads_followup      ON leads(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX idx_leads_created       ON leads(created_at DESC);
CREATE INDEX idx_activity_lead       ON activity_log(lead_id);
CREATE INDEX idx_activity_created    ON activity_log(created_at DESC);
CREATE INDEX idx_tasks_agent         ON agent_tasks(agent_id, status);

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

CREATE TRIGGER leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at
BEFORE UPDATE ON agent_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards       ENABLE ROW LEVEL SECURITY;

-- Anon can read everything (for the UI board)
CREATE POLICY "anon_read_leads"        ON leads        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_activity"     ON activity_log FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_tasks"        ON agent_tasks  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_boards"       ON boards       FOR SELECT TO anon USING (true);

-- service_role bypasses RLS — used by API routes
