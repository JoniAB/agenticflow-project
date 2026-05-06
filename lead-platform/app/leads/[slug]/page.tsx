import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Metadata } from 'next'
import { HairSalonTemplate }    from '@/components/lead-templates/HairSalonTemplate'
import { VetClinicTemplate }    from '@/components/lead-templates/VetClinicTemplate'
import { BeautyTemplate }       from '@/components/lead-templates/BeautyTemplate'
import { AutoTemplate }         from '@/components/lead-templates/AutoTemplate'
import { PhotographerTemplate } from '@/components/lead-templates/PhotographerTemplate'

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

  // ── Generic template — clean light with brand accent ─────────────────────
  const accent = brand || '#4f46e5'
  const lightBg = light || '#f5f3ff'

  return (
    <div dir="rtl" style={{ fontFamily: "'Plus Jakarta Sans','Arial',sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .gp { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        a { text-decoration: none; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: 0 }}>
        <div className="gp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>YA</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', letterSpacing: '-.01em' }}>יוני אלוני | AI לעסקים</span>
          </div>
          {reportUrl && (
            <a href={reportUrl} style={{ fontSize: 13, fontWeight: 600, color: accent }}>צפה בדוח ←</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #fff 0%, ${lightBg} 100%)`, padding: '64px 0 56px', borderBottom: '1px solid #e2e8f0' }}>
        <div className="gp">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${accent}12`, border: `1px solid ${accent}30`, color: accent, padding: '5px 14px', borderRadius: 30, fontSize: 12, fontWeight: 700, marginBottom: 22, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, background: accent, borderRadius: '50%', display: 'inline-block' }} />
            ניתוח אישי עבור {companyName}
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4.5vw,48px)', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', maxWidth: 680, marginBottom: 18, letterSpacing: '-.03em' }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          <div style={{ width: 48, height: 3, background: accent, borderRadius: 2, marginBottom: 24 }} />
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 17, color: '#475569', lineHeight: 1.8, maxWidth: 540, marginBottom: 32 }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: accent, color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: `0 4px 14px ${accent}35` }}>
              קבע שיחת ייעוץ חינם →
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, border: '1px solid #cbd5e1' }}>
                דוח מלא
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '56px 0', background: '#fff' }}>
          <div className="gp">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 8 }}>מה זיהינו</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 8, letterSpacing: '-.02em' }}>האתגרים שמעכבים אותך</h2>
            <div style={{ width: 48, height: 3, background: '#ef4444', borderRadius: 2, marginBottom: 32 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '22px', position: 'relative', overflow: 'hidden', borderRight: '3px solid #ef4444' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{i + 1}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 6, letterSpacing: '-.01em' }}>{p.title}</h3>
                  <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '56px 0', background: lightBg }}>
          <div className="gp">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>הפתרון שלנו</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 8, letterSpacing: '-.02em' }}>מה נעשה עבורך</h2>
            <div style={{ width: 48, height: 3, background: accent, borderRadius: 2, marginBottom: 32 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${accent}20`, borderRadius: 12, padding: '22px', borderTop: `3px solid ${accent}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>✓</div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 6, letterSpacing: '-.01em' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '36px 0', background: accent, borderTop: `1px solid ${accent}` }}>
          <div className="gp" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
              🎯 {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '60px 0', background: '#fff', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <div className="gp">
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 12, letterSpacing: '-.02em' }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 16, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
            שיחה של 10 דקות — ללא התחייבות. ניתוח כנה של מה שאפשר לשפר.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 10, background: accent, color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: `0 4px 16px ${accent}40` }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 20, fontSize: 12, color: '#94a3b8' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
