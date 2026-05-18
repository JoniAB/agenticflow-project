'use client'

import { useState } from 'react'
import {
  CheckCircle2, XCircle, Phone, Mail, User, Globe,
  ExternalLink, BarChart2, Copy, Check,
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { PagePreview } from '@/components/ui/PagePreview'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientCardData {
  notes?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  domain?: string | null
  content?: {
    email_subject?: string | null
    email_body?: string | null
    page_url?: string | null
    report_url?: string | null
  } | null
  outreach?: {
    sent_at?: string | null
    replied?: boolean
    reply_body?: string | null
    reply_preview?: string | null
    gmail_thread_id?: string | null
    replied_at?: string | null
    recipient_email?: string | null
  } | null
}

// ─── Digital asset detection ──────────────────────────────────────────────────

interface AssetStatus { label: string; present: boolean }

export function detectAssets(notes: string | null, domain: string | null): AssetStatus[] {
  const t = (notes ?? '').toLowerCase()
  return [
    { label: 'אתר',      present: !!domain },
    { label: 'WhatsApp', present: !t.includes('חסר whatsapp') && !t.includes('אין whatsapp') && !t.includes('ללא whatsapp') },
    { label: 'ביקורות', present: (t.includes('ביקורות') || t.includes('כוכבים')) && !t.includes('אין ביקורות') },
    { label: 'הזמנה',   present: !t.includes('אין תורים') && !t.includes('אין הזמנת') && !t.includes('לא ניתן לקבוע') },
    { label: 'סושיאל',  present: t.includes('אינסטגרם') || t.includes('פייסבוק') || t.includes('instagram') || t.includes('facebook') },
    { label: 'גלריה',   present: !t.includes('אין גלריה') && !t.includes('אין תמונות') && !t.includes('מעט תמונות') },
  ]
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">{children}</p>
  )
}

// ─── Section: Research ────────────────────────────────────────────────────────

function ResearchSection({ data }: { data: ClientCardData }) {
  const assets  = detectAssets(data.notes ?? null, data.domain ?? null)
  const missing = assets.filter(a => !a.present)
  const present = assets.filter(a => a.present)

  const hasContact = !!(data.contact_name || data.contact_phone || data.contact_email || data.outreach?.recipient_email || data.domain)

  return (
    <div className="grid grid-cols-[1fr_200px_190px]" dir="rtl">

      {/* Notes */}
      <div className="px-5 py-4 border-l border-gray-100">
        <SectionLabel>למה נבחר</SectionLabel>
        {data.notes
          ? <p className="text-sm text-gray-700 leading-relaxed">{data.notes}</p>
          : <p className="text-sm text-gray-400 italic">אין נתוני מחקר</p>}
      </div>

      {/* Contact */}
      <div className="px-4 py-4 border-l border-gray-100">
        <SectionLabel>פרטי קשר</SectionLabel>
        {hasContact ? (
          <div className="space-y-1.5">
            {data.contact_name && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User size={12} className="text-gray-400 shrink-0" />
                <span>{data.contact_name}</span>
              </div>
            )}
            {data.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone size={12} className="text-gray-400 shrink-0" />
                <a href={`tel:${data.contact_phone}`} className="hover:text-indigo-600 transition-colors" dir="ltr">
                  {data.contact_phone}
                </a>
              </div>
            )}
            {(data.contact_email || data.outreach?.recipient_email) && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={12} className="text-gray-400 shrink-0" />
                <a href={`mailto:${data.contact_email ?? data.outreach?.recipient_email}`}
                  className="hover:text-indigo-600 transition-colors truncate" dir="ltr">
                  {data.contact_email ?? data.outreach?.recipient_email}
                </a>
              </div>
            )}
            {data.domain && !data.domain.includes('agenticflow-pages') && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Globe size={12} className="text-gray-400 shrink-0" />
                <a href={data.domain.startsWith('http') ? data.domain : `https://${data.domain}`}
                  target="_blank" rel="noopener noreferrer"
                  className="hover:text-indigo-600 transition-colors truncate" dir="ltr">
                  {data.domain.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">אין פרטי קשר</p>
        )}
      </div>

      {/* Digital assets — chips */}
      <div className="px-4 py-4">
        <SectionLabel>נכסים דיגיטליים</SectionLabel>
        <div className="flex flex-col gap-2">
          {missing.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {missing.map(a => (
                <span key={a.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-medium border border-red-100">
                  <XCircle size={10} className="shrink-0" />{a.label}
                </span>
              ))}
            </div>
          )}
          {present.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {present.map(a => (
                <span key={a.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                  <CheckCircle2 size={10} className="shrink-0" />{a.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

// ─── Section: Content ─────────────────────────────────────────────────────────

function ContentSection({ content }: { content: NonNullable<ClientCardData['content']> }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = [content.email_subject ? `נושא: ${content.email_subject}` : '', content.email_body ?? '']
      .filter(Boolean).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-t border-indigo-100 bg-indigo-50/25 px-5 py-4" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">תוכן שנוצר</p>
        <div className="flex items-center gap-3" dir="ltr">
          {content.page_url && (
            <PagePreview href={content.page_url}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              <ExternalLink size={11} /> עמוד נחיתה
            </PagePreview>
          )}
          {content.report_url && (
            <PagePreview href={content.report_url}
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">
              <BarChart2 size={11} /> דוח מחקר
            </PagePreview>
          )}
          {content.email_body && (
            <button onClick={copy}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
              {copied ? <><Check size={11} className="text-emerald-500" /> הועתק</> : <><Copy size={11} /> העתק מייל</>}
            </button>
          )}
        </div>
      </div>
      {content.email_subject && (
        <div className="flex items-center gap-1.5 mb-2">
          <Mail size={12} className="text-indigo-400 shrink-0" />
          <p className="text-sm font-semibold text-gray-900">{content.email_subject}</p>
        </div>
      )}
      {content.email_body && (
        <div className="bg-white rounded-lg border border-indigo-100 px-4 py-3">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content.email_body}</p>
        </div>
      )}
    </div>
  )
}

// ─── Section: Client reply ────────────────────────────────────────────────────

function ReplySection({ outreach }: { outreach: NonNullable<ClientCardData['outreach']> }) {
  if (!outreach.replied) return null
  return (
    <div className="border-t border-emerald-200 bg-emerald-50/30 px-5 py-4" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">תגובת הלקוח</p>
        {outreach.replied_at && (
          <span className="text-[10px] text-emerald-500">{formatRelativeDate(outreach.replied_at)}</span>
        )}
      </div>
      {outreach.reply_body
        ? <div className="bg-white rounded-lg border border-emerald-100 px-4 py-3">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{outreach.reply_body}</p>
          </div>
        : outreach.reply_preview
          ? <p className="text-sm text-gray-800 leading-relaxed">{outreach.reply_preview}</p>
          : outreach.gmail_thread_id
            ? <a href={`https://mail.google.com/mail/u/0/#inbox/${outreach.gmail_thread_id}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700">
                <ExternalLink size={13} /> פתח ב-Gmail
              </a>
            : <p className="text-sm text-gray-400 italic">אין תוכן תגובה שמור</p>}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ClientCardContent({ data }: { data: ClientCardData }) {
  const hasContent = !!(data.content?.email_body || data.content?.page_url)
  const hasReply   = !!data.outreach?.replied

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <ResearchSection data={data} />
      {hasContent && <ContentSection content={data.content!} />}
      {hasReply   && <ReplySection outreach={data.outreach!} />}
    </div>
  )
}

// Wrapper for table rows (renders as <td> spanning all cols)
export function ClientCardTableRow({
  data, colSpan, className,
}: { data: ClientCardData; colSpan: number; className?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className={className ?? 'px-4 pb-3 pt-0'}>
        <ClientCardContent data={data} />
      </td>
    </tr>
  )
}
