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

const SEV: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  high:   { dot: '#EF4444', label: 'קריטי',  bg: '#FFF0F0', text: '#991B1B' },
  medium: { dot: '#F59E0B', label: 'בינוני', bg: '#FFFBEB', text: '#92400E' },
  low:    { dot: '#10B981', label: 'נמוך',   bg: '#F0FDF4', text: '#065F46' },
}

async function getData(slug: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('content')
    .select('*, companies(name, industry, contact_name, score)')
    .eq('company_slug', slug)
    .single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  const name = (data?.companies as { name: string } | null)?.name ?? slug
  return { title: `דוח — ${name}` }
}

function ScoreRing({ score }: { score: number }) {
  const r     = 38
  const circ  = 2 * Math.PI * r
  const dash  = circ * Math.min(Math.max(score, 0), 10) / 10
  const color = score <= 3 ? '#EF4444' : score <= 6 ? '#F59E0B' : '#10B981'
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#E5E7EB" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: '#9CA3AF' }}>/10</span>
      </div>
    </div>
  )
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()

  const company = data.companies as { name: string; industry: string | null; score: number | null } | null
  const parsed  = data.report_content ? JSON.parse(data.report_content as string) : null
  const report: ReportContent | null = parsed?.report ?? null
  const brand   = parsed?.page?.brand_color ?? '#4F46E5'

  const companyName = company?.name ?? slug
  const score       = report?.score ?? company?.score ?? 4
  const pageUrl     = data.page_url as string | null
  const today       = new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo','Arial',sans-serif", background: '#F7F8FA', minHeight: '100vh', color: '#1A1D2E' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" />
      <style>{`* { box-sizing: border-box; } .rp { max-width: 820px; margin: 0 auto; padding: 0 20px; }`}</style>

      {/* ── Top bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '0' }}>
        <div className="rp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11 }}>YA</div>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1D2E' }}>דוח ניתוח דיגיטלי</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{today}</span>
            {pageUrl && (
              <a href={pageUrl} style={{ fontSize: 12, fontWeight: 600, color: brand, textDecoration: 'none' }}>← עמוד הדגמה</a>
            )}
          </div>
        </div>
      </div>

      <div className="rp" style={{ padding: '24px 20px' }}>

        {/* ── Title + Score ── */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <ScoreRing score={score} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 }}>ניתוח דיגיטלי</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>{companyName}</h1>
            {company?.industry && (
              <span style={{ display: 'inline-block', background: `${brand}18`, color: brand, fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>{company.industry}</span>
            )}
          </div>
        </div>

        {/* ── Executive summary ── */}
        {report?.executive_summary && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: brand, marginBottom: 8 }}>סיכום</p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#374151', margin: 0 }}>{report.executive_summary}</p>
            {report.potential_impact && (
              <p style={{ fontSize: 13, lineHeight: 1.6, color: brand, marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6', fontWeight: 600 }}>
                💡 {report.potential_impact}
              </p>
            )}
          </div>
        )}

        {/* ── Findings + Recommendations side by side ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Findings */}
          {report?.findings && report.findings.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#EF4444', marginBottom: 12 }}>ממצאים</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.findings.map((f, i) => {
                  const s = SEV[f.severity] ?? SEV.low
                  return (
                    <div key={i} style={{ background: s.bg, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.dot }}>{s.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: s.text, flex: 1 }}>{f.title}</span>
                      </div>
                      <p style={{ fontSize: 12, color: s.text, lineHeight: 1.55, margin: '0 0 0 13px', opacity: .85 }}>{f.details}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report?.recommendations && report.recommendations.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#10B981', marginBottom: 12 }}>המלצות</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', borderBottom: i < report.recommendations.length - 1 ? '1px solid #F3F4F6' : 'none', paddingBottom: i < report.recommendations.length - 1 ? 10 : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 1 }}>
                      {rec.priority}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 3px', color: '#1A1D2E' }}>{rec.title}</p>
                      <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Quick wins ── */}
        {report?.quick_wins && report.quick_wins.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7C3AED', marginBottom: 12 }}>quick wins</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {report.quick_wins.map((w, i) => (
                <span key={i} style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#5B21B6', fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>⚡</span>{w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ background: brand, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>מוכן לפעול לפי הדוח?</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', margin: 0 }}>שיחה חינמית של 10 דקות — ללא התחייבות</p>
          </div>
          <a href="https://calendly.com/yoniautomation/30min"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 9, background: '#fff', color: brand, fontWeight: 800, fontSize: 14, textDecoration: 'none', flexShrink: 0 }}>
            קבע שיחה →
          </a>
        </div>

      </div>
    </div>
  )
}
