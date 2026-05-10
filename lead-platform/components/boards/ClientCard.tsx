'use client'

import { useState } from 'react'
import {
  Globe2, MessageCircle, Star, CalendarCheck, Image,
  CheckCircle2, XCircle, Phone, Mail, User, Globe,
  ExternalLink, BarChart2, Copy, Check,
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientCardData {
  // Research layer (always present)
  notes?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  domain?: string | null
  // Content layer
  content?: {
    email_subject?: string | null
    email_body?: string | null
    page_url?: string | null
    report_url?: string | null
  } | null
  // Outreach layer
  outreach?: {
    sent_at?: string | null
    replied?: boolean
    reply_body?: string | null
    reply_preview?: string | null
    gmail_thread_id?: string | null
    replied_at?: string | null
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

// ─── Section: Research ────────────────────────────────────────────────────────

function ResearchSection({ data }: { data: ClientCardData }) {
  const assets  = detectAssets(data.notes ?? null, data.domain ?? null)
  const missing = assets.filter(a => !a.present)
  const present = assets.filter(a => a.present)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Why chosen */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">למה נבחר</p>
        {data.notes
          ? <p className="text-sm text-gray-700 leading-relaxed">{data.notes}</p>
          : <p className="text-sm text-gray-400 italic">אין נתוני מחקר</p>}
      </div>

      {/* Contact */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">פרטי קשר</p>
        <div className="space-y-1.5">
          {data.contact_name && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User size={13} className="text-gray-400 shrink-0" />{data.contact_name}
            </div>
          )}
          {data.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone size={13} className="text-gray-400 shrink-0" />
              <a href={`tel:${data.contact_phone}`} className="hover:text-indigo-600">{data.contact_phone}</a>
            </div>
          )}
          {data.contact_email && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail size={13} className="text-gray-400 shrink-0" />
              <a href={`mailto:${data.contact_email}`} className="hover:text-indigo-600 truncate">{data.contact_email}</a>
            </div>
          )}
          {data.domain && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Globe size={13} className="text-gray-400 shrink-0" />
              <a href={data.domain.startsWith('http') ? data.domain : `https://${data.domain}`}
                target="_blank" rel="noopener noreferrer"
                className="hover:text-indigo-600 truncate">
                {data.domain.replace(/^https?:\/\//, '').split('/')[0]}
              </a>
            </div>
          )}
          {!data.contact_name && !data.contact_phone && !data.contact_email && !data.domain && (
            <p className="text-sm text-gray-400 italic">אין פרטי קשר</p>
          )}
        </div>
      </div>

      {/* Digital assets */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">נכסים דיגיטליים</p>
        <div className="space-y-1.5">
          {missing.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-red-400 font-medium">חסר:</p>
              {missing.map(a => (
                <div key={a.label} className="flex items-center gap-1.5 text-xs text-red-500">
                  <XCircle size={12} className="shrink-0" />{a.label}
                </div>
              ))}
            </div>
          )}
          {present.length > 0 && (
            <div className="space-y-1 mt-1">
              <p className="text-[10px] text-emerald-500 font-medium">קיים:</p>
              {present.map(a => (
                <div key={a.label} className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 size={12} className="shrink-0" />{a.label}
                </div>
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
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">📄 תוכן שנוצר</p>
        <div className="flex items-center gap-3">
          {content.page_url && (
            <a href={content.page_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              <ExternalLink size={11} /> עמוד נחיתה
            </a>
          )}
          {content.report_url && (
            <a href={content.report_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium">
              <BarChart2 size={11} /> דוח מחקר
            </a>
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
        <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
          <Mail size={13} className="text-gray-400 shrink-0" />{content.email_subject}
        </p>
      )}
      {content.email_body && (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content.email_body}</p>
      )}
    </div>
  )
}

// ─── Section: Client reply ────────────────────────────────────────────────────

function ReplySection({ outreach }: { outreach: NonNullable<ClientCardData['outreach']> }) {
  if (!outreach.replied) return null
  return (
    <div className="border-t border-emerald-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">💬 תגובת הלקוח</p>
        {outreach.replied_at && (
          <span className="text-[10px] text-emerald-400">{formatRelativeDate(outreach.replied_at)}</span>
        )}
      </div>
      {outreach.reply_body
        ? <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{outreach.reply_body}</p>
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
  const hasContent  = !!(data.content?.email_body || data.content?.page_url)
  const hasReply    = !!data.outreach?.replied

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <ResearchSection data={data} />
      {hasContent  && <ContentSection content={data.content!} />}
      {hasReply    && <ReplySection outreach={data.outreach!} />}
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
