import { getSupabaseAdmin } from '@/lib/supabase'
import { StandbyBoard } from '@/components/boards/StandbyBoard'

export const dynamic = 'force-dynamic'

export default async function StandbyPage() {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('companies')
    .select('id, name, industry, domain, contact_name, contact_phone, contact_email, notes, score, status, created_at, updated_at')
    .eq('status', 'standby')
    .order('updated_at', { ascending: false })

  return <StandbyBoard companies={data ?? []} />
}
