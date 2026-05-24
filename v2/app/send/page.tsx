'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'
import { Send, Edit3, ExternalLink, CheckCircle, Clock, X } from 'lucide-react'

type Tab = 'pending' | 'sent'

export default function SendPage() {
  const supabase = getSupabase()
  const [leads, setLeads] = useState<Lead[]>([])
  const [tab, setTab] = useState<Tab>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    loadLeads()
    const channel = supabase
      .channel('send-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadLeads)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .in('status', ['awaiting_approval', 'sent', 'replied', 'no_reply', 'converted'])
      .order('updated_at', { ascending: false })
    if (data) setLeads(data as Lead[])
  }

  async function saveEdit(id: string) {
    await supabase.from('leads').update({ email_draft: editBody, email_subject: editSubject }).eq('id', id)
    setEditId(null)
    loadLeads()
  }

  async function sendEmail(lead: Lead) {
    setSending(lead.id)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id }),
      })
      if (!res.ok) throw new Error(await res.text())
      setConfirmId(null)
    } catch (e: unknown) {
      alert(`שגיאה בשליחה: ${e instanceof Error ? e.message : 'Unknown'}`)
    } finally {
      setSending(null)
      loadLeads()
    }
  }

  const pending = leads.filter(l => l.status === 'awaiting_approval')
  const sent = leads.filter(l => ['sent', 'replied', 'no_reply', 'converted'].includes(l.status))
  const shown = tab === 'pending' ? pending : sent

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }} className="fade-up">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Ready to Send
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted2)' }}>
          סקור, ערוך ואשר שליחת מייל — אישור ידני נדרש לכל שליחה
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'pending', label: `ממתינים לאישור`, count: pending.length },
          { key: 'sent',    label: `נשלחו`,          count: sent.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
              background: tab === key ? 'var(--surface2)' : 'transparent',
              color: tab === key ? 'var(--text)' : 'var(--muted2)',
              fontWeight: tab === key ? 600 : 400,
              transition: 'all 150ms',
            }}>
            {label}
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: tab === key && key === 'pending' && count > 0 ? 'var(--green)' : 'rgba(255,255,255,0.08)',
              color: tab === key && key === 'pending' && count > 0 ? '#000' : 'var(--muted2)',
              borderRadius: 99, padding: '1px 7px',
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          {tab === 'pending' ? 'אין לידים שממתינים לאישור.' : 'לא נשלחו מיילים עדיין.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map(lead => {
            const isExpanded = expanded === lead.id
            const isEditing  = editId   === lead.id
            const isConfirm  = confirmId === lead.id
            const isSending  = sending   === lead.id

            return (
              <div key={lead.id} style={{
                background: 'var(--surface)',
                border: `1px solid ${isConfirm ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                borderRadius: 10, overflow: 'hidden',
                transition: 'border-color 200ms',
              }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{lead.business_name}</span>
                      {lead.contact_name && <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{lead.contact_name}</span>}
                      <span className={`pill ${
                        lead.status === 'awaiting_approval' ? 'pill-yellow' :
                        lead.status === 'sent' ? 'pill-blue' :
                        lead.status === 'replied' ? 'pill-green' :
                        lead.status === 'converted' ? 'pill-green' :
                        'pill-gray'
                      }`}>
                        {lead.status === 'awaiting_approval' ? 'ממתין לאישור' :
                         lead.status === 'sent' ? 'נשלח' :
                         lead.status === 'replied' ? 'הגיב' :
                         lead.status === 'converted' ? 'לקוח' : 'אין תגובה'}
                      </span>
                    </div>
                    {lead.email_subject && (
                      <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4 }}>
                        <span style={{ color: 'var(--muted)' }}>נושא: </span>{lead.email_subject}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {lead.report_url && (
                      <a href={lead.report_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : lead.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}>
                      {isExpanded ? 'סגור' : 'הצג מייל'}
                    </button>
                    {lead.status === 'awaiting_approval' && !isConfirm && (
                      <>
                        <button
                          onClick={() => { setEditId(lead.id); setEditBody(lead.email_draft ?? ''); setEditSubject(lead.email_subject ?? ''); setExpanded(lead.id) }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 6,
                            background: 'transparent', border: '1px solid var(--border2)',
                            color: 'var(--muted2)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                          }}>
                          <Edit3 size={10} /> ערוך
                        </button>
                        <button
                          onClick={() => setConfirmId(lead.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 16px', borderRadius: 6,
                            background: 'var(--surface2)', border: '1px solid rgba(34,197,94,0.3)',
                            color: 'var(--green)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>
                          <Send size={11} /> שלח
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Double-confirm panel */}
                {isConfirm && (
                  <div style={{
                    borderTop: '1px solid rgba(34,197,94,0.2)',
                    background: 'rgba(34,197,94,0.05)',
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                        אישור סופי — שולחים את המייל?
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted2)' }}>
                        פעולה זו לא ניתנת לביטול. המייל יישלח לעסק.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setConfirmId(null)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 6,
                          background: 'transparent', border: '1px solid var(--border2)',
                          color: 'var(--muted2)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        }}>
                        <X size={11} /> בטל
                      </button>
                      <button
                        onClick={() => sendEmail(lead)}
                        disabled={!!isSending}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 6,
                          background: isSending ? 'rgba(34,197,94,0.4)' : 'var(--green)',
                          border: 'none', color: '#000', fontSize: 12, fontWeight: 700,
                          cursor: isSending ? 'not-allowed' : 'pointer',
                        }}>
                        <CheckCircle size={12} />
                        {isSending ? 'שולח...' : 'כן, שלח עכשיו'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Email preview / edit */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'rgba(0,0,0,0.2)' }}>
                    {isEditing ? (
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>נושא</label>
                        <input
                          value={editSubject}
                          onChange={e => setEditSubject(e.target.value)}
                          style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 6, padding: '8px 10px', fontSize: 13, marginBottom: 12 }}
                        />
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>גוף המייל</label>
                        <textarea
                          value={editBody}
                          onChange={e => setEditBody(e.target.value)}
                          rows={8}
                          style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 6, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button onClick={() => setEditId(null)} style={{ padding: '7px 14px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--muted2)', fontSize: 12, cursor: 'pointer' }}>ביטול</button>
                          <button onClick={() => saveEdit(lead.id)} style={{ padding: '7px 16px', borderRadius: 6, background: 'var(--green)', border: 'none', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>שמור</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right' }}>
                        {lead.email_draft ?? '(אין טיוטה)'}
                      </div>
                    )}
                  </div>
                )}

                {/* Sent timestamp */}
                {lead.status !== 'awaiting_approval' && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={11} color="var(--muted)" />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {new Date(lead.updated_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
