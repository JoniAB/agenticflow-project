export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Company, Content } from '@/lib/types'
import { ApprovalTable } from '@/components/boards/ApprovalTable'
import { ViewTransition } from 'react'

type ApprovalRow = Company & { content: Content | null }

async function getPendingApproval(): Promise<ApprovalRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*, content(*)')
    .in('status', ['awaiting_approval', 'awaiting_followup_approval'])
    .order('updated_at', { ascending: false })

  return (data ?? []).map((row) => ({
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
