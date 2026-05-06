import { BoardId, LeadStatus } from './types'

export const BOARDS: { id: BoardId; name: string; description: string; ownerAgent: string | null }[] = [
  { id: 'B-01', name: 'Prospect Pool',   description: 'Raw company data, unvalidated',            ownerAgent: 'research-agent' },
  { id: 'B-02', name: 'Enriched Leads',  description: 'Validated + enriched company profiles',    ownerAgent: 'research-agent' },
  { id: 'B-03', name: 'Qualification',   description: 'Scoring and ICP fit assessment',           ownerAgent: 'qualification-agent' },
  { id: 'B-04', name: 'Outreach Queue',  description: 'Approved leads ready for first contact',   ownerAgent: 'outbound-agent' },
  { id: 'B-05', name: 'Active Outreach', description: 'First message sent, awaiting response',    ownerAgent: 'outbound-agent' },
  { id: 'B-06', name: 'Follow-up',       description: 'No response — scheduled follow-up',        ownerAgent: 'followup-agent' },
  { id: 'B-07', name: 'Responded',       description: 'Lead replied — human takes over',          ownerAgent: null },
  { id: 'B-08', name: 'Archive',         description: 'Not qualified, opted out, or closed lost', ownerAgent: null },
]

export const BOARD_NEXT: Partial<Record<BoardId, BoardId>> = {
  'B-01': 'B-02',
  'B-02': 'B-03',
  'B-03': 'B-04',
  'B-04': 'B-05',
  'B-05': 'B-06',
  'B-06': 'B-07',
}

export const STATUS_ON_ADVANCE: Partial<Record<BoardId, LeadStatus>> = {
  'B-01': 'pending_review',
  'B-02': 'pending_review',
  'B-03': 'queued',
  'B-04': 'contacted',
  'B-05': 'following_up',
  'B-06': 'responded',
}

interface StatusConfig {
  label: string
  color: string
  bg: string
}

export const STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  new:                { label: 'New',               color: 'text-blue-600',   bg: 'bg-blue-50' },
  in_progress:        { label: 'In Progress',       color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ready:              { label: 'Ready',             color: 'text-green-600',  bg: 'bg-green-50' },
  pending_review:     { label: 'Pending Review',    color: 'text-orange-600', bg: 'bg-orange-50' },
  qualified:          { label: 'Qualified',         color: 'text-green-600',  bg: 'bg-green-50' },
  rejected:           { label: 'Rejected',          color: 'text-red-600',    bg: 'bg-red-50' },
  needs_human_review: { label: 'Human Review',      color: 'text-purple-600', bg: 'bg-purple-50' },
  queued:             { label: 'Queued',            color: 'text-blue-600',   bg: 'bg-blue-50' },
  contacted:          { label: 'Contacted',         color: 'text-yellow-600', bg: 'bg-yellow-50' },
  no_response:        { label: 'No Response',       color: 'text-orange-600', bg: 'bg-orange-50' },
  send_failed:        { label: 'Send Failed',       color: 'text-red-600',    bg: 'bg-red-50' },
  following_up:       { label: 'Following Up',      color: 'text-yellow-600', bg: 'bg-yellow-50' },
  exhausted:          { label: 'Exhausted',         color: 'text-red-600',    bg: 'bg-red-50' },
  responded:          { label: 'Responded',         color: 'text-green-600',  bg: 'bg-green-50' },
  archived:           { label: 'Archived',          color: 'text-gray-500',   bg: 'bg-gray-100' },
}
