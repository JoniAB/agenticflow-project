import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getMockLeadById, MOCK_ACTIVITY } from '@/lib/mock-data'
import { Lead, ActivityLog } from '@/lib/types'
import { LeadCard } from '@/components/boards/LeadCard'

async function getLead(leadId: string): Promise<{ lead: Lead; activity: ActivityLog[] } | null> {
  try {
    const supabase = getSupabaseAdmin()
    const { data: lead } = await supabase.from('leads').select('*').eq('lead_id', leadId).single()
    if (lead) {
      const { data: activity } = await supabase
        .from('activity_log')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
      return { lead, activity: activity ?? [] }
    }
  } catch {}

  const mockLead = getMockLeadById(leadId)
  if (!mockLead) return null
  return { lead: mockLead, activity: MOCK_ACTIVITY[leadId] ?? [] }
}

interface Props {
  params: Promise<{ lead_id: string }>
}

export default async function LeadPage({ params }: Props) {
  const { lead_id } = await params
  const result = await getLead(lead_id)
  if (!result) notFound()

  return <LeadCard lead={result.lead} activity={result.activity} />
}
