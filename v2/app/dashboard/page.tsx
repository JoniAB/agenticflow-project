'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Lead, AgentLog } from '@/lib/types'
import { ArrowRight, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PipelineStat { label: string; count: number; href: string; color: string }

export default function DashboardPage() {
  const supabase = getSupabase()
  const [leads, setLeads] = useState<Lead[]>([])
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [leadsRes, logsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(12),
      ])
      if (leadsRes.data) setLeads(leadsRes.data as Lead[])
      if (logsRes.data) setLogs(logsRes.data as AgentLog[])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_logs' }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const count = (statuses: string[]) => leads.filter(l => statuses.includes(l.status)).length
  const total = leads.length

  const pipeline: PipelineStat[] = [
    { label: 'Search',          count: count(['new_lead','search_complete']),   href: '/search',  color: 'var(--blue)'   },
    { label: 'Create Content',  count: count(['researching','content_ready']),  href: '/content', color: 'var(--yellow)' },
    { label: 'Ready to Send',   count: count(['awaiting_approval']),            href: '/send',    color: 'var(--green)'  },
    { label: 'Sent',            count: count(['sent','replied','no_reply','converted']), href: '/send', color: 'var(--muted)' },
  ]

  const sent      = count(['sent','replied','no_reply','converted'])
  const converted = count(['converted'])
  const pending   = count(['awaiting_approval'])
  const errors    = count(['error'])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>טוען...</div>
    </div>
  )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }} className="fade-up">

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted2)' }}>
          {total} לידים סה״כ · מתעדכן בזמן אמת
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }} className="fade-up-1">
        {[
          { label: 'סה״כ לידים',        value: total,     icon: TrendingUp,    color: 'var(--blue)'   },
          { label: 'ממתינים לאישור',     value: pending,   icon: Clock,         color: 'var(--yellow)' },
          { label: 'נשלחו',             value: sent,      icon: CheckCircle,   color: 'var(--green)'  },
          { label: 'שגיאות',            value: errors,    icon: AlertCircle,   color: 'var(--red)'    },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 500 }}>{label}</span>
              <Icon size={14} color={color} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline flow */}
      <div style={{ marginBottom: 32 }} className="fade-up-2">
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          Pipeline Flow
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {pipeline.map(({ label, count: c, href, color }, i) => (
            <Link key={label} href={href} style={{ textDecoration: 'none', flex: 1 }}>
              <div style={{
                padding: '20px 24px',
                borderRight: i < pipeline.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</span>
                  {i < pipeline.length - 1 && <ArrowRight size={10} color="var(--muted)" style={{ marginLeft: 'auto' }} />}
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{c}</div>
                <div style={{ height: 2, background: color, marginTop: 12, borderRadius: 1, opacity: c > 0 ? 1 : 0.2 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Conversion */}
      {sent > 0 && (
        <div style={{ marginBottom: 32, display: 'flex', gap: 12 }} className="fade-up-3">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px', flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 8 }}>שיעור המרה</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
              {sent > 0 ? Math.round((converted / sent) * 100) : 0}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{converted} מתוך {sent} שנשלחו</div>
          </div>
        </div>
      )}

      {/* Activity log */}
      <div className="fade-up-3">
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          Activity Log
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              אין פעילות עדיין
            </div>
          ) : logs.map((log, i) => (
            <div key={log.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 20px',
              borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div className={`dot ${log.error ? 'dot-red' : 'dot-green'}`} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{log.agent_name}</span>
                <span style={{ fontSize: 12, color: 'var(--muted2)', marginRight: 6 }}> · {log.action}</span>
                {log.error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{log.error}</span>}
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                {new Date(log.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
