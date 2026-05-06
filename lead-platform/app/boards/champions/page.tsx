import { getSupabaseAdmin } from '@/lib/supabase'
import { Company } from '@/lib/types'
import { MOCK_CHAMPIONS } from '@/lib/mock-data'
import { ChampionsTable } from '@/components/boards/ChampionsTable'
import { ViewTransition } from 'react'

async function getChampions(): Promise<Company[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .in('status', ['potential', 'high_score'])
    .order('score', { ascending: true })
    .order('created_at', { ascending: false })
  if (!data || data.length === 0) return MOCK_CHAMPIONS
  return data
}

export default async function ChampionsPage() {
  const companies = await getChampions()
  return (
    <ViewTransition>
      <ChampionsTable companies={companies} />
    </ViewTransition>
  )
}
