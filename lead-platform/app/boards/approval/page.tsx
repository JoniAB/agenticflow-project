import { getSupabaseAdmin } from '@/lib/supabase'
import { Company, Content } from '@/lib/types'
import { MOCK_APPROVAL } from '@/lib/mock-data'
import { ApprovalTable } from '@/components/boards/ApprovalTable'
import { ViewTransition } from 'react'

type ApprovalRow = Company & { content: Content | null }

async function getPendingApproval(): Promise<ApprovalRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*, content(*)')
    .in('status', ['awaiting_approval', 'awaiting_followup_approval', 'approved', 'edit_required'])
    .order('updated_at', { ascending: false })

  if (!data || data.length === 0) return MOCK_APPROVAL
  return data.map((row) => ({
    ...row,
    content: Array.isArray(row.content) ? (row.content[0] ?? null) : row.content,
  }))
}

export default async function ApprovalPage() {
  const companies = await getPendingApproval()
  return (
    <ViewTransition>
      <ApprovalTable companies={companies} />
    </ViewTransition>
  )
}
