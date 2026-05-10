import { getSupabaseAdmin } from '@/lib/supabase'
import { Company, Outreach, Content } from '@/lib/types'
import { MOCK_OUTREACH } from '@/lib/mock-data'
import { OutreachTable } from '@/components/boards/OutreachTable'
import { ViewTransition } from 'react'

export type OutreachRow = Company & { outreach: Outreach | null; content: Content | null }

async function getOutreachLeads(): Promise<OutreachRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*, outreach(*), content(*)')
    .in('status', ['sent', 'replied', 'followup_sent'])
    .order('updated_at', { ascending: false })

  if (!data || data.length === 0) return MOCK_OUTREACH as OutreachRow[]
  return data.map((row) => ({
    ...row,
    outreach: Array.isArray(row.outreach) ? (row.outreach[0] ?? null) : row.outreach,
    content:  Array.isArray(row.content)  ? (row.content[0]  ?? null) : row.content,
  }))
}

export default async function OutreachPage() {
  const companies = await getOutreachLeads()
  return (
    <ViewTransition>
      <OutreachTable companies={companies} />
    </ViewTransition>
  )
}
