export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Company } from '@/lib/types'
import { ChampionsTable } from '@/components/boards/ChampionsTable'
import { ViewTransition } from 'react'

async function getChampions(): Promise<Company[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .in('status', ['potential', 'new'])
    .order('score', { ascending: true })
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function ChampionsPage() {
  const companies = await getChampions()
  return (
    <ViewTransition>
      <ChampionsTable companies={companies} />
    </ViewTransition>
  )
}
