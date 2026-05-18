import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Metadata } from 'next'

interface Finding {
  title: string
  severity: 'high' | 'medium' | 'low'
  details: string
}

interface Recommendation {
  priority: number
  title: string
  impact: string
  description: string
}

interface ReportContent {
  executive_summary: string
  score: number
  findings: Finding[]
  recommendations: Recommendation[]
  quick_wins: string[]
  potential_impact: string
}

const SEV: Record<string, { bar: string; label: string; bg: string; text: string; labelBg: string; labelText: string }> = {
  high:   { bar: '#EF4444', label: 'קריטי',  bg: '#FFF8F8', text: '#7F1D1D', labelBg: '#FEE2E2', labelText: '#991B1B' },
  medium: { bar: '#F59E0B', label: 'בינוני', bg: '#FFFDF5', text: '#78350F', labelBg: '#FEF3C7', labelText: '#92400E' },
  low:    { bar: '#10B981', label: 'נמוך',   bg: '#F6FEFA', text: '#064E3B', labelBg: '#D1FAE5', labelText: '#065F46' },
}

async function getData(slug: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('content')
    .select('*, companies(name, industry, contact_name, domain, score)')
    .eq('company_slug', slug)
    .single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  const name = (data?.companies as { name: string } | null)?.name ?? slug
  return { title: `דוח ניתוח דיגיטלי — ${name}` }
}

function ScoreRing({ score }: { score: number }) {
  const r     = 42
  const circ  = 2 * Math.PI * r
  const pct   = Math.min(Math.max(score, 0), 10) / 10
  const dash  = circ * pct
  const color = score <= 3 ? '#EF4444' : score <= 6 ? '#F59E0B' : '#10B981'
  const grade = score <= 3 ? 'נמוך' : score <= 6 ? 'בינוני' : 'טוב'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 108, height: 108 }}>
        <svg width="108" height="108" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="54" cy="54" r={r} fill="none" stroke="#F1F5F9" strokeWidth="8" />
          <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}50)` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontFamily: "'Frank Ruhl Libre',serif", fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.4 }}>/10</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '2px 10px', borderRadius: 12 }}>{grade}</span>
    </div>
  )
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()

  const company = data.companies as { name: string; industry: string | null; contact_name: string | null; domain: string | null; score: number | null } | null
  const parsed  = data.report_content ? JSON.parse(data.report_content as string) : null
  const report: ReportContent | null = parsed?.report ?? null
  const brand   = parsed?.page?.brand_color ?? '#4F46E5'

  const companyName = company?.name ?? slug
  const score       = report?.score ?? company?.score ?? 4
  const pageUrl     = data.page_url as string | null
  const today       = new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo','Arial',sans-serif", background: '#F7F8FA', minHeight: '100vh', color: '#1A1D2E' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500;600;700;800&display=swap" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .rp { max-width: 840px; margin: 0 auto; padding: 0 20px; }
        a { text-decoration: none; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background: brand, height: 4 }} />
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB' }}>
        <div className="rp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11, boxShadow: `0 2px 8px ${brand}50` }}>YA</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E', lineHeight: 1.1, letterSpacing: '-.01em' }}>דוח ניתוח דיגיטלי</p>
              <p style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '.03em', lineHeight: 1 }}>יוני אלוני · AI לעסקים</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{today}</span>
            {pageUrl && (
              <a href={pageUrl} style={{ fontSize: 12, fontWeight: 700, color: brand, display: 'flex', alignItems: 'center', gap: 4 }}>
                עמוד הדגמה
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="rp" style={{ padding: '24px 20px 48px' }}>

        {/* ── Score + Company card ── */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ background: `${brand}0C`, borderBottom: '1px solid #F3F4F6', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: brand, display: 'inline-block' }} />
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: brand }}>ניתוח דיגיטלי</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '22px 24px' }}>
            <ScoreRing score={score} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 26, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2, letterSpacing: '-.02em' }}>{companyName}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {company?.industry && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: `${brand}14`, color: brand, fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 999 }}>{company.industry}</span>
                )}
                {company?.domain && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#F1F5F9', color: '#64748B', fontSize: 12, fontWeight: 500, padding: '3px 12px', borderRadius: 999 }}>{company.domain.replace(/^https?:\/\//, '').split('/')[0]}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Executive summary ── */}
        {report?.executive_summary && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: brand, marginBottom: 10 }}>סיכום מנהלים</p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#374151' }}>{report.executive_summary}</p>
            {report.potential_impact && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: brand, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v4M6 7v.5M2 11h8a1 1 0 001-1V5L7 1H3a1 1 0 00-1 1v8a1 1 0 001 1z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: brand, fontWeight: 600, flex: 1 }}>{report.potential_impact}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Findings + Recommendations side by side ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {report?.findings && report.findings.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#EF4444', marginBottom: 14 }}>ממצאים</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.findings.map((f, i) => {
                  const s = SEV[f.severity] ?? SEV.low
                  return (
                    <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '12px 14px 12px 14px', borderRight: `3px solid ${s.bar}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: s.labelBg, color: s.labelText, padding: '2px 8px', borderRadius: 999 }}>{s.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: s.text, flex: 1 }}>{f.title}</span>
                      </div>
                      <p style={{ fontSize: 12, color: s.text, lineHeight: 1.6, opacity: .8 }}>{f.details}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {report?.recommendations && report.recommendations.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#10B981', marginBottom: 14 }}>המלצות</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {report.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: i < report.recommendations.length - 1 ? '1px solid #F3F4F6' : 'none', paddingBottom: i < report.recommendations.length - 1 ? 12 : 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, flexShrink: 0, marginTop: 1, fontFamily: "'Frank Ruhl Libre',serif" }}>
                      {rec.priority}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E' }}>{rec.title}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, background: `${brand}14`, color: brand, padding: '1px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>{rec.impact}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Quick wins ── */}
        {report?.quick_wins && report.quick_wins.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7C3AED', marginBottom: 14 }}>Quick Wins</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {report.quick_wins.map((w, i) => (
                <span key={i} style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#5B21B6', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" stroke="#7C3AED" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ background: brand, borderRadius: 16, padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, boxShadow: `0 4px 20px ${brand}35` }}>
          <div>
            <p style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '-.01em' }}>מוכן לפעול לפי הדוח?</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', margin: 0 }}>שיחה חינמית של 10 דקות — ללא התחייבות</p>
          </div>
          <a href="https://calendly.com/yoniautomation/30min"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 24px', borderRadius: 10, background: '#fff', color: brand, fontWeight: 800, fontSize: 14, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            קבע שיחה
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

      </div>
    </div>
  )
}
