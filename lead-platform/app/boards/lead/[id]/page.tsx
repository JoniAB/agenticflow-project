import { getSupabaseAdmin } from '@/lib/supabase'
import { getMockCompanyById } from '@/lib/mock-data'
import { LeadDetail } from '@/components/boards/LeadDetail'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'

type Params = { params: Promise<{ id: string }> }

async function getCompany(id: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*, content(*), outreach(*), agent_log(*)')
    .eq('id', id)
    .single()
  if (data) return data
  return getMockCompanyById(id)
}

export default async function LeadDetailPage({ params }: Params) {
  const { id } = await params
  const company = await getCompany(id)
  if (!company) notFound()

  const content = Array.isArray(company.content)
    ? (company.content[0] ?? null)
    : (company.content ?? null)

  return (
    <ViewTransition>
      <LeadDetail company={company} content={content} />
    </ViewTransition>
  )
}
