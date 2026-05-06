export type BoardId = 'B-01' | 'B-02' | 'B-03' | 'B-04' | 'B-05' | 'B-06' | 'B-07' | 'B-08'

export type LeadStatus =
  | 'new'
  | 'in_progress'
  | 'ready'
  | 'pending_review'
  | 'qualified'
  | 'rejected'
  | 'needs_human_review'
  | 'queued'
  | 'contacted'
  | 'no_response'
  | 'send_failed'
  | 'following_up'
  | 'exhausted'
  | 'responded'
  | 'archived'

export type OutreachChannel = 'email' | 'linkedin' | 'whatsapp'
export type ResponseSentiment = 'positive' | 'neutral' | 'negative'
export type ActivityType = 'note' | 'advance' | 'reject' | 'field_update' | 'scheduled_check' | 'outreach' | 'followup'
export type TaskStatus = 'open' | 'complete' | 'failed'

export interface Board {
  board_id: BoardId
  name: string
  description: string
  position: number
  owner_agent: string | null
}

export interface Lead {
  lead_id: string
  company_name: string
  website: string | null
  industry: string | null
  employee_count: number | null
  hq_location: string | null
  linkedin_url: string | null
  contact_name: string | null
  contact_title: string | null
  contact_email: string | null
  contact_linkedin: string | null
  current_board: BoardId
  status: LeadStatus
  assigned_agent: string | null
  created_by: string
  icp_score: number | null
  icp_notes: string | null
  rejection_reason: string | null
  outreach_channel: OutreachChannel | null
  first_message_sent_at: string | null
  first_message_text: string | null
  followup_count: number
  next_followup_at: string | null
  response_received_at: string | null
  response_sentiment: ResponseSentiment | null
  agent_notes: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  activity_id: string
  lead_id: string
  type: ActivityType
  body: string | null
  channel: string | null
  agent_id: string | null
  created_at: string
}

export interface AgentTask {
  task_id: string
  agent_id: string
  lead_id: string | null
  type: string
  status: TaskStatus
  payload: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface LeadWithActivity extends Lead {
  activity?: ActivityLog[]
}
