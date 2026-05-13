import { CompanyStatus } from './types'

export interface StatusConfig {
  label: string
  bg: string
  text: string
  dot: string
  ring: string
}

export const STATUS_CONFIG: Record<CompanyStatus, StatusConfig> = {
  new: {
    label: 'New',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    ring: 'ring-slate-200',
  },
  scoring: {
    label: 'Scoring',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-400',
    ring: 'ring-blue-100',
  },
  insufficient_data: {
    label: 'Insufficient Data',
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    dot: 'bg-slate-300',
    ring: 'ring-slate-200',
  },
  potential: {
    label: 'Potential',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    ring: 'ring-blue-100',
  },
  high_score: {
    label: 'High Score',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    ring: 'ring-violet-100',
  },
  in_research: {
    label: 'Researching',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    ring: 'ring-amber-100',
  },
  research_incomplete: {
    label: 'Research Incomplete',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-400',
    ring: 'ring-amber-100',
  },
  content_ready: {
    label: 'Content Ready',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-100',
  },
  awaiting_approval: {
    label: 'Awaiting Approval',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    ring: 'ring-orange-100',
  },
  awaiting_followup_approval: {
    label: 'Follow-up Approval',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    ring: 'ring-yellow-100',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-100',
  },
  edit_required: {
    label: 'Edit Required',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    dot: 'bg-orange-400',
    ring: 'ring-orange-100',
  },
  sent: {
    label: 'Sent',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-100',
  },
  send_failed: {
    label: 'Send Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    ring: 'ring-red-100',
  },
  replied: {
    label: 'Replied',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    ring: 'ring-green-100',
  },
  followup_sent: {
    label: 'Follow-up Sent',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-100',
  },
  exhausted: {
    label: 'Exhausted',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    ring: 'ring-slate-200',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
    ring: 'ring-red-100',
  },
  standby: {
    label: 'Standby',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    ring: 'ring-amber-100',
  },
}
