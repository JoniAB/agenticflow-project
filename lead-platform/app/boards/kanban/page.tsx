import { getSupabaseAdmin } from '@/lib/supabase'
import { KanbanBoard } from '@/components/boards/KanbanBoard'
import type { CompanyStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

const KANBAN_STATUSES: CompanyStatus[] = [
  'potential', 'research_incomplete',
  'high_score', 'in_research',
  'content_ready',
  'awaiting_approval', 'approved', 'edit_required',
  'sent', 'replied', 'followup_sent', 'send_failed',
  'standby',
]

export default async function KanbanPage() {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('id, name, industry, score, status, created_at, updated_at, contact_name, contact_email, contact_phone, domain, notes, source, current_board, cowork_id, cowork_raw_data, website, size_estimate, contact_linkedin, city, linkedin_url, rejection_reason, scoring_result, scoring_notes, kanban_position')
    .in('status', KANBAN_STATUSES)
    .order('kanban_position', { ascending: true })
    .order('score', { ascending: false })

  return <KanbanBoard initialLeads={data ?? []} />
}
