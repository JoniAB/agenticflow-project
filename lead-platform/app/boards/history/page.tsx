import { getSupabaseAdmin } from '@/lib/supabase'
import { Company, Outreach, Content } from '@/lib/types'
import { HistoryTable } from '@/components/boards/HistoryTable'
import { ViewTransition } from 'react'

type HistoryRow = Company & { outreach: Outreach | null; content: Content | null }

async function getRepliedClients(): Promise<HistoryRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*, outreach(*), content(*)')
    .eq('status', 'replied')
    .order('updated_at', { ascending: false })

  return (data ?? []).map((row) => ({
    ...row,
    outreach: Array.isArray(row.outreach) ? (row.outreach[0] ?? null) : row.outreach,
    content:  Array.isArray(row.content)  ? (row.content[0]  ?? null) : row.content,
  }))
}

export default async function HistoryPage() {
  const companies = await getRepliedClients()
  return (
    <ViewTransition>
      <HistoryTable companies={companies} />
    </ViewTransition>
  )
}
