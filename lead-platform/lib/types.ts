// Board IDs per SOP-001
export type BoardId =
  | 'B-01' // Raw Leads
  | 'B-02' // Scoring
  | 'B-03' // Potentials
  | 'B-04' // High Score
  | 'B-05' // In Research
  | 'B-06' // Ready to Send
  | 'B-07' // Sent
  | 'B-08' // Replied
  | 'B-09' // Follow-up Sent
  | 'B-10' // Archive

export type CompanyStatus =
  | 'new'
  | 'scoring'
  | 'insufficient_data'
  | 'potential'
  | 'high_score'
  | 'in_research'
  | 'research_incomplete'
  | 'content_ready'
  | 'awaiting_approval'
  | 'awaiting_followup_approval'
  | 'approved'
  | 'edit_required'
  | 'sent'
  | 'send_failed'
  | 'replied'
  | 'followup_sent'
  | 'exhausted'
  | 'rejected'

export type CompanySource = 'cowork_api' | 'cowork_webhook' | 'linkedin' | 'google_maps' | 'other'

// Maps status → board per SOP routing rules
export const STATUS_TO_BOARD: Record<CompanyStatus, BoardId> = {
  new:                        'B-01',
  insufficient_data:          'B-01',
  scoring:                    'B-02',
  potential:                  'B-03',
  research_incomplete:        'B-03',
  high_score:                 'B-04',
  in_research:                'B-05',
  content_ready:              'B-05',
  awaiting_approval:          'B-06',
  awaiting_followup_approval: 'B-06',
  approved:                   'B-06',
  edit_required:              'B-06',
  sent:                       'B-07',
  send_failed:                'B-07',
  replied:                    'B-08',
  followup_sent:              'B-09',
  exhausted:                  'B-10',
  rejected:                   'B-10',
}

export interface Company {
  id: string
  // Cowork integration
  cowork_id: string | null
  cowork_raw_data: Record<string, unknown> | null
  source: CompanySource
  // Company info
  name: string
  website: string | null
  domain: string | null
  industry: string | null
  size_estimate: string | null
  // Contact
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_linkedin: string | null
  // Legacy
  linkedin_url: string | null
  // Board state
  current_board: BoardId
  status: CompanyStatus
  // Scoring
  score: number
  scoring_result: number | null
  scoring_notes: string | null
  // Meta
  rejection_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ResearchData {
  id: string
  company_id: string
  linkedin_data: Record<string, unknown> | null
  website_data: Record<string, unknown> | null
  google_reviews: Record<string, unknown> | null
  google_business: Record<string, unknown> | null
  news_data: Record<string, unknown> | null
  additional_reviews: Record<string, unknown> | null
  satisfaction_report: string | null
  pain_points: string[] | null
  opportunities: string[] | null
  missing_sources: string[] | null
  researched_at: string
}

export interface Content {
  id: string
  company_id: string
  // Landing page
  company_slug: string | null
  page_url: string | null
  page_status: 'draft' | 'deployed' | 'failed' | null
  landing_page_failed: boolean
  // Report
  report_url: string | null
  report_content: string | null
  report_status: 'draft' | 'ready' | null
  // Email
  email_subject: string | null
  email_subtitle: string | null
  email_body: string | null
  email_links: Record<string, unknown> | null
  // Follow-up
  followup_subject: string | null
  followup_body: string | null
  created_at: string
}

export interface Outreach {
  id: string
  company_id: string
  content_id: string
  recipient_email: string
  gmail_message_id: string | null
  gmail_thread_id: string | null
  sent_at: string | null
  replied: boolean
  replied_at: string | null
  reply_preview: string | null
  reply_body: string | null
  follow_up_count: number
  last_follow_up_at: string | null
}

export interface AgentLog {
  id: string
  company_id: string | null
  agent_name: string
  action: string
  status: 'success' | 'error' | 'skipped'
  payload: Record<string, unknown> | null
  error_message: string | null
  created_at: string
}

export type CompanyWithRelations = Company & {
  research?: ResearchData | null
  content?: Content | null
  outreach?: Outreach | null
}
