'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'
import { FileText, Play, ExternalLink, Loader, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'

export default function ContentPage() {
  const supabase = getSupabase()
  const [leads, setLeads] = useState<Lead[]>([])
  const [generating, setGenerating] = useState<string | null>(null)
  const [streamLogs, setStreamLogs] = useState<Record<string, string[]>>({})

  useEffect(() => {
    loadLeads()
    const channel = supabase
      .channel('content-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadLeads)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .in('status', ['search_complete', 'researching', 'content_ready'])
      .order('created_at', { ascending: false })
    if (data) setLeads(data as Lead[])
  }

  async function generateContent(id: string) {
    setGenerating(id)
    setStreamLogs(l => ({ ...l, [id]: [] }))
    try {
      const res = await fetch(`/api/generate?lead_id=${id}&stream=true`)
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
              if (ev.message) setStreamLogs(l => ({ ...l, [id]: [...(l[id] ?? []), ev.message] }))
            } catch {}
          }
        }
      }
    } catch (e: unknown) {
      setStreamLogs(l => ({ ...l, [id]: [...(l[id] ?? []), `שגיאה: ${e instanceof Error ? e.message : 'Unknown'}`] }))
    } finally {
      setGenerating(null)
      loadLeads()
    }
  }

  async function generateAll() {
    const ready = leads.filter(l => l.status === 'search_complete')
    for (const lead of ready) {
      await generateContent(lead.id)
    }
  }

  const readyCount = leads.filter(l => l.status === 'search_complete').length

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }} className="fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Create Content
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted2)' }}>
            מחקר, דוח ועמוד נחיתה לכל ליד
          </p>
        </div>
        {readyCount > 0 && (
          <button
            onClick={generateAll}
            disabled={!!generating}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 7,
              background: generating ? 'rgba(34,197,94,0.3)' : 'var(--green)',
              border: 'none', color: generating ? '#4ade80' : '#000',
              fontSize: 13, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer',
              transition: 'all 150ms',
            }}>
            <Play size={13} fill={generating ? '#4ade80' : '#000'} />
            {generating ? 'מייצר...' : `הפעל הכל (${readyCount})`}
          </button>
        )}
      </div>

      {/* Cards */}
      {leads.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          אין לידים שממתינים לתוכן. אשר לידים ב-Search Board קודם.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leads.map(lead => {
            const logs = streamLogs[lead.id] ?? []
            const isGenerating = generating === lead.id
            const isDone = lead.status === 'content_ready'
            const isError = lead.status === 'error'

            return (
              <div key={lead.id} style={{
                background: 'var(--surface)', border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isError ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                borderRadius: 10, overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                  {/* Status icon */}
                  <div style={{ flexShrink: 0 }}>
                    {isDone       ? <CheckCircle size={18} color="var(--green)" /> :
                     isError      ? <AlertCircle size={18} color="var(--red)" /> :
                     isGenerating ? <Loader size={18} color="var(--yellow)" style={{ animation: 'spin 1s linear infinite' }} /> :
                                    <FileText size={18} color="var(--muted)" />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{lead.business_name}</span>
                      {lead.industry && <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{lead.industry}</span>}
                      <span className={`pill ${
                        isDone ? 'pill-green' :
                        isGenerating ? 'pill-yellow' :
                        isError ? 'pill-red' :
                        'pill-gray'
                      }`} style={{ marginRight: 'auto' }}>
                        {isDone ? 'תוכן מוכן' : isGenerating ? 'מייצר...' : isError ? 'שגיאה' : 'ממתין'}
                      </span>
                    </div>
                    {lead.weakness_summary && (
                      <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.weakness_summary}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {isDone && lead.report_url && (
                      <a href={lead.report_url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 6,
                        background: 'transparent', border: '1px solid var(--border2)',
                        color: 'var(--muted2)', fontSize: 11, fontWeight: 500, textDecoration: 'none',
                      }}>
                        דוח <ExternalLink size={10} />
                      </a>
                    )}
                    {isDone && lead.landing_page_url && (
                      <a href={lead.landing_page_url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 6,
                        background: 'transparent', border: '1px solid var(--border2)',
                        color: 'var(--muted2)', fontSize: 11, fontWeight: 500, textDecoration: 'none',
                      }}>
                        עמוד <ExternalLink size={10} />
                      </a>
                    )}
                    {isDone && (
                      <button
                        onClick={async () => {
                          await supabase.from('leads').update({ status: 'awaiting_approval' }).eq('id', lead.id)
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '6px 14px', borderRadius: 6,
                          background: 'var(--green)', border: 'none',
                          color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        }}>
                        העבר לשליחה <ChevronRight size={11} />
                      </button>
                    )}
                    {!isDone && !isGenerating && lead.status === 'search_complete' && (
                      <button
                        onClick={() => generateContent(lead.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '6px 14px', borderRadius: 6,
                          background: 'var(--surface2)', border: '1px solid var(--border2)',
                          color: 'var(--text)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        }}>
                        <Play size={10} fill="currentColor" /> ייצר
                      </button>
                    )}
                  </div>
                </div>

                {/* Stream log (visible during generation) */}
                {(isGenerating || logs.length > 0) && (
                  <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', padding: '10px 20px' }}>
                    {logs.map((l, i) => (
                      <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: i === logs.length - 1 ? 'var(--green)' : 'var(--muted)', marginBottom: 1 }}>
                        › {l}
                      </div>
                    ))}
                    {isGenerating && <div className="pulse" style={{ color: 'var(--green)', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>●</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
