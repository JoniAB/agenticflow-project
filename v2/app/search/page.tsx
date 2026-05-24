'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'
import { Search, Play, Globe, MapPin, Sliders, ChevronRight } from 'lucide-react'

interface SearchParams {
  industry: string
  location: string
  no_website: boolean
  old_website: boolean
  weak_socials: boolean
  max_results: number
}

const DEFAULT_PARAMS: SearchParams = {
  industry:     '',
  location:     'ישראל',
  no_website:   true,
  old_website:  true,
  weak_socials: true,
  max_results:  20,
}

const INDUSTRIES = [
  'מוסך / מכניקה', 'קליניקה / רפואה', 'מספרה / סלון יופי', 'מסעדה / קפה',
  'וטרינר', 'ניקיון / שירותי בית', 'אינסטלציה / חשמל', 'צלם',
  'ספורט / כושר', 'ייעוץ עסקי', 'חינוך / הדרכה', 'אחר',
]

export default function SearchPage() {
  const supabase = getSupabase()
  const [leads, setLeads] = useState<Lead[]>([])
  const [params, setParams] = useState<SearchParams>(DEFAULT_PARAMS)
  const [running, setRunning] = useState(false)
  const [showParams, setShowParams] = useState(false)
  const [streamLog, setStreamLog] = useState<string[]>([])

  useEffect(() => {
    loadLeads()
    const channel = supabase
      .channel('search-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadLeads)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .in('status', ['new_lead', 'search_complete'])
      .order('created_at', { ascending: false })
    if (data) setLeads(data as Lead[])
  }

  async function runSearch() {
    setRunning(true)
    setStreamLog([])
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, stream: true }),
      })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const ev = JSON.parse(line.slice(6))
              if (ev.message) setStreamLog(l => [...l, ev.message])
            } catch {}
          }
        }
      }
    } catch (e: unknown) {
      setStreamLog(l => [...l, `שגיאה: ${e instanceof Error ? e.message : 'Unknown'}`])
    } finally {
      setRunning(false)
      loadLeads()
    }
  }

  async function advanceLead(id: string) {
    await supabase.from('leads').update({ status: 'search_complete' }).eq('id', id)
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }} className="fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Search
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted2)' }}>
            חיפוש עסקים ישראלים עם נוכחות דיגיטלית חלשה
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowParams(!showParams)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 7,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--muted2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
            <Sliders size={13} />
            פרמטרים
          </button>
          <button
            onClick={runSearch}
            disabled={running}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 7,
              background: running ? 'rgba(34,197,94,0.3)' : 'var(--green)',
              border: 'none', color: running ? '#4ade80' : '#000',
              fontSize: 13, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
              transition: 'all 150ms',
            }}>
            <Play size={13} fill={running ? '#4ade80' : '#000'} />
            {running ? 'מחפש...' : 'הפעל חיפוש'}
          </button>
        </div>
      </div>

      {/* Params panel */}
      {showParams && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '20px 24px', marginBottom: 24,
        }} className="fade-up">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>תחום</label>
              <select
                value={params.industry}
                onChange={e => setParams(p => ({ ...p, industry: e.target.value }))}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}>
                <option value="">— כל התחומים —</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>מיקום</label>
              <input
                value={params.location}
                onChange={e => setParams(p => ({ ...p, location: e.target.value }))}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>קריטריונים</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'no_website',   label: 'ללא אתר אינטרנט' },
                  { key: 'old_website',  label: 'אתר ישן / לא מעודכן' },
                  { key: 'weak_socials', label: 'נכסים דיגיטליים חלשים' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={params[key as keyof SearchParams] as boolean}
                      onChange={e => setParams(p => ({ ...p, [key]: e.target.checked }))}
                      style={{ accentColor: 'var(--green)', width: 14, height: 14 }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--muted2)' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>מקסימום תוצאות</label>
              <input
                type="number" min={5} max={50}
                value={params.max_results}
                onChange={e => setParams(p => ({ ...p, max_results: +e.target.value }))}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stream log */}
      {streamLog.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontFamily: 'monospace', fontSize: 12 }}>
          {streamLog.map((l, i) => (
            <div key={i} style={{ color: i === streamLog.length - 1 ? 'var(--green)' : 'var(--muted2)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--muted)' }}>›</span> {l}
            </div>
          ))}
          {running && <div className="pulse" style={{ color: 'var(--green)', marginTop: 4 }}>●</div>}
        </div>
      )}

      {/* Leads table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={13} color="var(--muted)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted2)' }}>
            לידים שנמצאו — {leads.length}
          </span>
        </div>
        {leads.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            לא נמצאו לידים עדיין. לחץ על &quot;הפעל חיפוש&quot; כדי להתחיל.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['שם העסק', 'תחום', 'עיר', 'ציון', 'אתר', 'סטטוס', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lead.business_name}</div>
                    {lead.contact_name && <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{lead.contact_name}</div>}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--muted2)' }}>{lead.industry ?? '—'}</td>
                  <td style={{ padding: '13px 16px' }}>
                    {lead.city && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} color="var(--muted)" />
                        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{lead.city}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {lead.score !== null && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                        background: lead.score <= 3 ? 'rgba(239,68,68,.15)' : lead.score <= 6 ? 'rgba(245,158,11,.15)' : 'rgba(34,197,94,.15)',
                        color: lead.score <= 3 ? '#f87171' : lead.score <= 6 ? '#fbbf24' : '#4ade80',
                      }}>{lead.score}</div>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {lead.website_url ? (
                      <a href={lead.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue)', textDecoration: 'none', fontSize: 12 }}>
                        <Globe size={11} /> קיים
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span className={`pill ${lead.status === 'search_complete' ? 'pill-green' : 'pill-gray'}`}>
                      {lead.status === 'search_complete' ? 'מוכן' : 'חדש'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'left' }}>
                    {lead.status === 'new_lead' && (
                      <button
                        onClick={() => advanceLead(lead.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '5px 12px', borderRadius: 6,
                          background: 'transparent', border: '1px solid var(--border2)',
                          color: 'var(--muted2)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                        }}>
                        אשר <ChevronRight size={11} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
