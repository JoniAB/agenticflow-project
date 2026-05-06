import { getSupabaseAdmin } from '@/lib/supabase'
import { Company, Outreach } from '@/lib/types'
import { MOCK_OUTREACH } from '@/lib/mock-data'
import { OutreachTable } from '@/components/boards/OutreachTable'
import { ViewTransition } from 'react'

type OutreachRow = Company & { outreach: Outreach | null }

async function getOutreachLeads(): Promise<OutreachRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*, outreach(*)')
    .in('status', ['sent', 'replied', 'followup_sent'])
    .order('updated_at', { ascending: false })

  if (!data || data.length === 0) return MOCK_OUTREACH
  return data.map((row) => ({
    ...row,
    outreach: Array.isArray(row.outreach) ? (row.outreach[0] ?? null) : row.outreach,
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
