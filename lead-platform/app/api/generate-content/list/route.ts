import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()

  // Query from companies side so the status filter works reliably.
  // Filtering on embedded tables via .eq('companies.status', ...) is silently unreliable in PostgREST.
  const { data, error } = await supabase
    .from('companies')
    .select('name, industry, status, notes, contact_name, contact_email, contact_phone, domain, content(*)')
    .eq('status', 'content_ready')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items = (data ?? []).flatMap((company) => {
    const contents = Array.isArray(company.content) ? company.content : []
    return contents
      .filter((c: { email_subject?: string | null }) => c.email_subject)
      .map((c: Record<string, unknown>) => ({
        ...c,
        companies: { name: company.name, industry: company.industry, status: company.status },
      }))
  })

  return NextResponse.json(items)
}
