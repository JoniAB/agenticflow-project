import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Metadata } from 'next'
import { HairSalonTemplate }    from '@/components/lead-templates/HairSalonTemplate'
import { VetClinicTemplate }    from '@/components/lead-templates/VetClinicTemplate'
import { BeautyTemplate }       from '@/components/lead-templates/BeautyTemplate'
import { AutoTemplate }         from '@/components/lead-templates/AutoTemplate'
import { PhotographerTemplate } from '@/components/lead-templates/PhotographerTemplate'
import { GenericTemplate }      from '@/components/lead-templates/GenericTemplate'

interface PageContent {
  template_type?: string
  brand_color?: string
  brand_light?: string
  tagline: string
  hero_description: string
  pain_points: { title: string; description: string }[]
  solutions: { title: string; description: string }[]
  result_promise: string
}

async function getData(slug: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('content')
    .select('*, companies(name, industry, contact_name, domain)')
    .eq('company_slug', slug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  const name = (data?.companies as { name: string } | null)?.name ?? slug
  return { title: `${name} — ניתוח דיגיטלי מותאם אישית` }
}

export default async function LeadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()

  const company = data.companies as { name: string; industry: string | null; contact_name: string | null } | null
  const parsed  = data.report_content ? JSON.parse(data.report_content as string) : null
  const page: PageContent | null = parsed?.page ?? null

  const companyName = company?.name ?? slug
  const contactName = company?.contact_name
  const reportUrl   = data.report_url as string | null
  const brand       = page?.brand_color ?? '#4F46E5'
  const light       = page?.brand_light ?? '#F0F0FF'
  const tpl         = page?.template_type ?? 'generic'

  const templateProps = { companyName, contactName: contactName ?? null, reportUrl, brand, page }

  if (tpl === 'hair-salon')    return <HairSalonTemplate    {...templateProps} />
  if (tpl === 'vet-clinic')    return <VetClinicTemplate    {...templateProps} />
  if (tpl === 'beauty')        return <BeautyTemplate       {...templateProps} />
  if (tpl === 'auto')          return <AutoTemplate         {...templateProps} />
  if (tpl === 'photographer')  return <PhotographerTemplate {...templateProps} />

  return <GenericTemplate {...templateProps} />
}
