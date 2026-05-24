export type LeadStatus =
  | 'new_lead'
  | 'search_complete'
  | 'researching'
  | 'content_ready'
  | 'awaiting_approval'
  | 'sent'
  | 'replied'
  | 'no_reply'
  | 'converted'
  | 'error'

export interface Lead {
  id: string
  business_name: string
  contact_name: string | null
  address: string | null
  website_url: string | null
  social_links: string[] | null
  report_url: string | null
  landing_page_url: string | null
  email_draft: string | null
  email_subject: string | null
  status: LeadStatus
  score: number | null
  industry: string | null
  city: string | null
  weakness_summary: string | null
  research_notes: string | null
  created_at: string
  updated_at: string
}

export interface AgentLog {
  id: string
  lead_id: string | null
  agent_name: string
  action: string
  result: string | null
  error: string | null
  created_at: string
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new_lead:          'ליד חדש',
  search_complete:   'נמצא',
  researching:       'מחקר...',
  content_ready:     'תוכן מוכן',
  awaiting_approval: 'ממתין לאישור',
  sent:              'נשלח',
  replied:           'הגיב',
  no_reply:          'אין תגובה',
  converted:         'הפך ללקוח',
  error:             'שגיאה',
}

export const STATUS_BOARD: Record<LeadStatus, number> = {
  new_lead:          2,
  search_complete:   2,
  researching:       3,
  content_ready:     3,
  awaiting_approval: 4,
  sent:              4,
  replied:           4,
  no_reply:          4,
  converted:         4,
  error:             4,
}
