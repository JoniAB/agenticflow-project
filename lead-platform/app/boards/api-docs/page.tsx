'use client'

import { useState } from 'react'
import { BookOpen, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Field { name: string; type: string; required: boolean; desc: string }
interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH'
  path: string
  desc: string
  auth: 'agent-key' | 'cowork-secret' | 'cron-key' | 'none'
  params?: { name: string; desc: string }[]
  body?: Field[]
  response?: string
  curl?: string
}
interface Section { id: string; title: string; endpoints: Endpoint[] }

// ─── Data ─────────────────────────────────────────────────────────────────────

const BASE = 'https://lead-platform-yoni.vercel.app'

const SECTIONS: Section[] = [
  {
    id: 'companies',
    title: 'Companies (Leads)',
    endpoints: [
      {
        method: 'GET', path: '/api/companies', desc: 'List companies with optional filters',
        auth: 'none',
        params: [
          { name: 'status', desc: 'Filter by status (e.g. new, potential, awaiting_approval)' },
          { name: 'source', desc: 'Filter by source (cowork_api, cowork_webhook, linkedin, other)' },
          { name: 'limit',  desc: 'Max results (default: 100)' },
          { name: 'offset', desc: 'Pagination offset (default: 0)' },
        ],
        response: `[{ "id": "uuid", "name": "...", "status": "new", "current_board": "B-01", ... }]`,
        curl: `curl "${BASE}/api/companies?status=awaiting_approval&limit=20"`,
      },
      {
        method: 'POST', path: '/api/companies', desc: 'Create a new lead manually',
        auth: 'agent-key',
        body: [
          { name: 'name',   type: 'string',  required: true,  desc: 'Company name' },
          { name: 'source', type: 'string',  required: false, desc: 'Source (default: other)' },
          { name: 'website',type: 'string',  required: false, desc: 'Company website URL' },
          { name: 'contact_email', type: 'string', required: false, desc: 'Contact email' },
        ],
        response: `{ "id": "uuid", "name": "...", "status": "new", "current_board": "B-01", ... }`,
        curl: `curl -X POST "${BASE}/api/companies" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Acme Ltd","source":"other","website":"https://acme.co.il"}'`,
      },
      {
        method: 'GET', path: '/api/companies/:id', desc: 'Get a single company by UUID',
        auth: 'none',
        response: `{ "id": "uuid", "name": "...", "status": "...", "current_board": "B-03", "scoring_result": 3, ... }`,
        curl: `curl "${BASE}/api/companies/YOUR_COMPANY_ID"`,
      },
      {
        method: 'PATCH', path: '/api/companies/:id', desc: 'Update company — status, board, scoring, fields',
        auth: 'agent-key',
        body: [
          { name: 'status',         type: 'CompanyStatus', required: false, desc: 'New status (see Status Reference)' },
          { name: 'current_board',  type: 'BoardId',       required: false, desc: 'New board (B-01 to B-10)' },
          { name: 'scoring_result', type: 'integer 1–10',  required: false, desc: 'Numeric score' },
          { name: 'scoring_notes',  type: 'string',        required: false, desc: 'Scoring rationale' },
          { name: 'contact_email',  type: 'string',        required: false, desc: 'Update contact email' },
          { name: 'rejection_reason', type: 'string',      required: false, desc: 'Reason when rejecting' },
        ],
        response: `{ "id": "uuid", "status": "potential", "current_board": "B-03", ... }`,
        curl: `curl -X PATCH "${BASE}/api/companies/COMPANY_ID" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"status":"potential","current_board":"B-03","scoring_result":3,"scoring_notes":"No website, low reviews"}'`,
      },
      {
        method: 'GET', path: '/api/companies/:id/history', desc: 'Company details + full agent log history',
        auth: 'none',
        response: `{ "company": {...}, "logs": [{ "agent_name":"research", "action":"...", "status":"success", "created_at":"..." }] }`,
        curl: `curl "${BASE}/api/companies/COMPANY_ID/history"`,
      },
    ],
  },
  {
    id: 'research',
    title: 'Research',
    endpoints: [
      {
        method: 'POST', path: '/api/research', desc: 'Submit deep research results for a company',
        auth: 'agent-key',
        body: [
          { name: 'company_id',     type: 'uuid',     required: true,  desc: 'Target company' },
          { name: 'linkedin_data',  type: 'JSON',     required: false, desc: 'LinkedIn company data' },
          { name: 'website_data',   type: 'JSON',     required: false, desc: 'Website audit results' },
          { name: 'google_reviews', type: 'JSON',     required: false, desc: 'Google reviews analysis' },
          { name: 'google_business',type: 'JSON',     required: false, desc: 'Google Business profile' },
          { name: 'news_data',      type: 'JSON',     required: false, desc: 'News mentions' },
          { name: 'pain_points',    type: 'string[]', required: false, desc: '3–7 specific pain points (required to advance)' },
          { name: 'missing_sources',type: 'string[]', required: false, desc: 'Sources that failed to scan' },
        ],
        response: `{ "id": "uuid", "company_id": "...", "pain_points": ["..."], ... }`,
        curl: `curl -X POST "${BASE}/api/research" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"company_id":"COMPANY_ID","pain_points":["No mobile site","Reviews unanswered","No booking system"],"website_data":{"score":2}}'`,
      },
      {
        method: 'GET', path: '/api/research/:company_id', desc: 'Get research data for a company',
        auth: 'none',
        response: `{ "id": "uuid", "pain_points": ["..."], "linkedin_data": {...}, "missing_sources": ["news"] }`,
        curl: `curl "${BASE}/api/research/COMPANY_ID"`,
      },
      {
        method: 'PATCH', path: '/api/research/:company_id', desc: 'Update existing research record',
        auth: 'agent-key',
        body: [
          { name: 'pain_points',     type: 'string[]', required: false, desc: 'Updated pain points' },
          { name: 'missing_sources', type: 'string[]', required: false, desc: 'Sources that failed' },
        ],
        curl: `curl -X PATCH "${BASE}/api/research/COMPANY_ID" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"pain_points":["Updated pain point 1","Pain point 2","Pain point 3"]}'`,
      },
    ],
  },
  {
    id: 'content',
    title: 'Content',
    endpoints: [
      {
        method: 'POST', path: '/api/content', desc: 'Create content record (landing page + email draft)',
        auth: 'agent-key',
        body: [
          { name: 'company_id',         type: 'uuid',   required: true,  desc: 'Target company' },
          { name: 'company_slug',        type: 'string', required: false, desc: 'URL slug for landing page' },
          { name: 'report_url',          type: 'string', required: false, desc: 'URL to the generated report' },
          { name: 'page_url',            type: 'string', required: false, desc: 'Landing page URL (after deploy)' },
          { name: 'page_status',         type: 'string', required: false, desc: 'draft | deployed | failed' },
          { name: 'landing_page_failed', type: 'boolean',required: false, desc: 'True if Vercel deploy failed' },
          { name: 'email_subject',       type: 'string', required: false, desc: 'Email subject line' },
          { name: 'email_body',          type: 'string', required: false, desc: 'Full email body (Hebrew)' },
          { name: 'followup_subject',    type: 'string', required: false, desc: 'Follow-up email subject' },
          { name: 'followup_body',       type: 'string', required: false, desc: 'Follow-up email body' },
        ],
        curl: `curl -X POST "${BASE}/api/content" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"company_id":"COMPANY_ID","company_slug":"acme-ltd","email_subject":"הכנתי משהו עבור Acme","email_body":"שלום,...","page_url":"https://lead-platform-yoni.vercel.app/leads/acme-ltd"}'`,
      },
      {
        method: 'GET',   path: '/api/content/:company_id', desc: 'Get content for a company',
        auth: 'none',
        curl: `curl "${BASE}/api/content/COMPANY_ID"`,
      },
      {
        method: 'PATCH', path: '/api/content/:company_id', desc: 'Update content (page deploy, email edits, follow-up)',
        auth: 'agent-key',
        body: [
          { name: 'page_status',      type: 'string',  required: false, desc: 'Update deploy status' },
          { name: 'page_url',         type: 'string',  required: false, desc: 'Final deployed URL' },
          { name: 'landing_page_failed', type: 'boolean', required: false, desc: 'Mark deploy as failed' },
          { name: 'followup_subject', type: 'string',  required: false, desc: 'Set follow-up subject' },
          { name: 'followup_body',    type: 'string',  required: false, desc: 'Set follow-up body' },
        ],
        curl: `curl -X PATCH "${BASE}/api/content/COMPANY_ID" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"page_status":"deployed","page_url":"https://lead-platform-yoni.vercel.app/leads/acme-ltd"}'`,
      },
    ],
  },
  {
    id: 'outreach',
    title: 'Outreach',
    endpoints: [
      {
        method: 'POST', path: '/api/outreach', desc: 'Record a sent email (after Gmail send)',
        auth: 'agent-key',
        body: [
          { name: 'company_id',      type: 'uuid',   required: true,  desc: 'Target company' },
          { name: 'content_id',      type: 'uuid',   required: true,  desc: 'Content record ID' },
          { name: 'recipient_email', type: 'string', required: true,  desc: 'Email address sent to' },
          { name: 'gmail_message_id',type: 'string', required: false, desc: 'Gmail message ID for reply tracking' },
          { name: 'gmail_thread_id', type: 'string', required: false, desc: 'Gmail thread ID for reply tracking' },
          { name: 'sent_at',         type: 'ISO8601',required: false, desc: 'Send timestamp (default: now)' },
        ],
        curl: `curl -X POST "${BASE}/api/outreach" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"company_id":"COMPANY_ID","content_id":"CONTENT_ID","recipient_email":"ceo@acme.co.il","gmail_thread_id":"thread_abc123"}'`,
      },
      {
        method: 'PATCH', path: '/api/outreach/:id', desc: 'Update outreach — record reply or follow-up',
        auth: 'agent-key',
        body: [
          { name: 'replied',         type: 'boolean', required: false, desc: 'Mark as replied' },
          { name: 'replied_at',      type: 'ISO8601', required: false, desc: 'Reply timestamp' },
          { name: 'reply_body',      type: 'string',  required: false, desc: 'Full reply email body' },
          { name: 'reply_preview',   type: 'string',  required: false, desc: 'Short preview of reply' },
          { name: 'follow_up_count', type: 'integer', required: false, desc: 'Increment after follow-up sent' },
          { name: 'last_follow_up_at', type: 'ISO8601', required: false, desc: 'Timestamp of last follow-up' },
        ],
        curl: `curl -X PATCH "${BASE}/api/outreach/OUTREACH_ID" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"replied":true,"replied_at":"2026-05-05T09:00:00Z","reply_body":"נשמע מעניין, בואו נדבר"}'`,
      },
      {
        method: 'GET', path: '/api/outreach', desc: 'List outreach records',
        auth: 'none',
        params: [
          { name: 'replied', desc: 'true/false — filter by replied status' },
          { name: 'days',    desc: 'Number of past days to include' },
        ],
        curl: `curl "${BASE}/api/outreach?replied=false&days=7"`,
      },
    ],
  },
  {
    id: 'logs',
    title: 'Agent Log',
    endpoints: [
      {
        method: 'POST', path: '/api/agent-log', desc: 'Write an agent log entry',
        auth: 'agent-key',
        body: [
          { name: 'agent_name',  type: 'string', required: true,  desc: 'Name of the agent (e.g. research, content)' },
          { name: 'action',      type: 'string', required: true,  desc: 'Action performed' },
          { name: 'status',      type: 'string', required: true,  desc: 'success | error | skipped' },
          { name: 'company_id',  type: 'uuid',   required: false, desc: 'Associated company' },
          { name: 'payload',     type: 'JSON',   required: false, desc: 'Any structured data' },
          { name: 'error_message', type: 'string', required: false, desc: 'Error details if status=error' },
        ],
        curl: `curl -X POST "${BASE}/api/agent-log" \\\n  -H "X-Agent-Key: $AGENT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"agent_name":"research","action":"website_scan","status":"success","company_id":"COMPANY_ID","payload":{"score":2}}'`,
      },
      {
        method: 'GET', path: '/api/agent-log', desc: 'List agent log entries (last 100)',
        auth: 'none',
        curl: `curl "${BASE}/api/agent-log"`,
      },
    ],
  },
  {
    id: 'webhooks',
    title: 'Webhooks & Crons',
    endpoints: [
      {
        method: 'POST', path: '/api/v1/webhook/cowork', desc: 'Cowork sends new company/contact — creates lead in B-01',
        auth: 'cowork-secret',
        body: [
          { name: 'company.id',     type: 'string', required: true,  desc: 'Cowork company ID (used for dedup)' },
          { name: 'company.name',   type: 'string', required: true,  desc: 'Company name' },
          { name: 'company.website',type: 'string', required: false, desc: 'Website URL' },
          { name: 'contact.email',  type: 'string', required: false, desc: 'Contact email' },
          { name: 'contact.phone',  type: 'string', required: false, desc: 'Contact phone' },
        ],
        response: `{ "created": true, "id": "uuid" } or { "skipped": true, "reason": "duplicate" }`,
        curl: `curl -X POST "${BASE}/api/v1/webhook/cowork" \\\n  -H "X-Cowork-Secret: $COWORK_WEBHOOK_SECRET" \\\n  -H "Content-Type: application/json" \\\n  -d '{"company":{"id":"cowork-123","name":"Acme Ltd","website":"https://acme.co.il"},"contact":{"email":"ceo@acme.co.il","phone":"050-1234567"}}'`,
      },
      {
        method: 'POST', path: '/api/v1/cron/daily-pull', desc: 'Trigger daily pull from Cowork API (runs at 08:00 IL)',
        auth: 'cron-key',
        response: `{ "created": 5, "skipped": 2, "errors": [] }`,
        curl: `curl -X POST "${BASE}/api/v1/cron/daily-pull" \\\n  -H "X-Cron-Key: $CRON_SECRET"`,
      },
      {
        method: 'POST', path: '/api/v1/cron/followup-check', desc: 'Check replies + queue follow-ups (runs 08:00/13:00/18:00 IL)',
        auth: 'cron-key',
        response: `{ "replies_detected": 1, "followups_queued": 2, "exhausted": 0, "errors": [] }`,
        curl: `curl -X POST "${BASE}/api/v1/cron/followup-check" \\\n  -H "X-Cron-Key: $CRON_SECRET"`,
      },
      {
        method: 'GET', path: '/api/stats/weekly', desc: 'Weekly pipeline stats — 7-day chart data, health, activity feed',
        auth: 'none',
        response: `{ "days": [...], "totals": {...}, "pipeline": [...], "health": {...}, "recent_activity": [...] }`,
        curl: `curl "${BASE}/api/stats/weekly"`,
      },
    ],
  },
]

const STATUS_REFERENCE = [
  { status: 'new',                        board: 'B-01', desc: 'Just arrived from Cowork' },
  { status: 'scoring',                    board: 'B-02', desc: 'Being scored by Research Agent' },
  { status: 'insufficient_data',          board: 'B-01', desc: 'Not enough data to score — stays in B-01' },
  { status: 'potential',                  board: 'B-03', desc: 'Score 1–5 — primary outreach target' },
  { status: 'high_score',                 board: 'B-04', desc: 'Score 6–10 — saved for future' },
  { status: 'in_research',               board: 'B-05', desc: 'Deep research in progress' },
  { status: 'research_incomplete',        board: 'B-03', desc: 'Fewer than 3 pain points found' },
  { status: 'awaiting_approval',          board: 'B-06', desc: 'Email ready — waiting for Yoni' },
  { status: 'awaiting_followup_approval', board: 'B-06', desc: 'Follow-up ready — waiting for Yoni' },
  { status: 'approved',                   board: 'B-06', desc: 'Yoni approved — agent will send' },
  { status: 'edit_required',             board: 'B-06', desc: 'Yoni requested edits' },
  { status: 'sent',                       board: 'B-07', desc: 'Email sent, awaiting reply' },
  { status: 'send_failed',               board: 'B-07', desc: 'Send failed after 3 retries' },
  { status: 'replied',                    board: 'B-08', desc: 'Got a real reply' },
  { status: 'followup_sent',             board: 'B-09', desc: 'Follow-up sent, waiting' },
  { status: 'exhausted',                  board: 'B-10', desc: '3 follow-ups sent, no reply' },
  { status: 'rejected',                   board: 'B-10', desc: 'Rejected by Yoni' },
]

// ─── UI Components ────────────────────────────────────────────────────────────

const METHOD_STYLE: Record<string, string> = {
  GET:   'bg-blue-50 text-blue-600',
  POST:  'bg-emerald-50 text-emerald-700',
  PATCH: 'bg-amber-50 text-amber-700',
}

const AUTH_LABELS: Record<string, { label: string; color: string }> = {
  'agent-key':     { label: 'X-Agent-Key',       color: 'bg-indigo-50 text-indigo-600' },
  'cowork-secret': { label: 'X-Cowork-Secret',   color: 'bg-violet-50 text-violet-600' },
  'cron-key':      { label: 'X-Cron-Key',        color: 'bg-slate-100 text-slate-600' },
  'none':          { label: 'Public',            color: 'bg-gray-100 text-gray-500' },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false)
  const auth = AUTH_LABELS[ep.auth]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded font-mono w-14 text-center shrink-0', METHOD_STYLE[ep.method])}>
          {ep.method}
        </span>
        <code className="text-sm text-gray-700 font-mono flex-1">{ep.path}</code>
        <span className={cn('text-[11px] px-2 py-0.5 rounded shrink-0', auth.color)}>{auth.label}</span>
        {open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
          <p className="text-sm text-gray-600">{ep.desc}</p>

          {ep.params && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Query Params</p>
              <div className="space-y-1">
                {ep.params.map(p => (
                  <div key={p.name} className="flex gap-3 text-sm">
                    <code className="text-indigo-600 font-mono w-32 shrink-0">{p.name}</code>
                    <span className="text-gray-500">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ep.body && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Request Body</p>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 uppercase tracking-wider w-36">Field</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 uppercase tracking-wider w-28">Type</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 uppercase tracking-wider w-16">Req</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ep.body.map((f, i) => (
                      <tr key={f.name} className={i < ep.body!.length - 1 ? 'border-b border-gray-50' : ''}>
                        <td className="px-3 py-2 font-mono text-indigo-600">{f.name}</td>
                        <td className="px-3 py-2 text-gray-500 font-mono">{f.type}</td>
                        <td className="px-3 py-2">{f.required ? <span className="text-red-500 font-bold">yes</span> : <span className="text-gray-300">no</span>}</td>
                        <td className="px-3 py-2 text-gray-500">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {ep.response && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Response</p>
              <code className="block text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 whitespace-pre-wrap">{ep.response}</code>
            </div>
          )}

          {ep.curl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">curl Example</p>
                <CopyButton text={ep.curl} />
              </div>
              <pre className="text-xs font-mono bg-[#1C1D2E] text-emerald-300 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap">{ep.curl}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('companies')

  return (
    <div className="flex h-full">
      {/* Side TOC */}
      <aside className="w-48 shrink-0 border-r border-gray-200 py-6 px-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2">Sections</p>
        <nav className="space-y-0.5">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'w-full text-left text-[13px] px-3 py-1.5 rounded-lg transition-colors',
                activeSection === s.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              )}
            >
              {s.title}
            </button>
          ))}
          <div className="border-t border-gray-200 my-2" />
          <button
            onClick={() => setActiveSection('status-ref')}
            className={cn(
              'w-full text-left text-[13px] px-3 py-1.5 rounded-lg transition-colors',
              activeSection === 'status-ref'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            )}
          >
            Status Reference
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-12">
        <div className="flex items-start gap-3 mb-6">
          <BookOpen size={20} className="text-gray-400 mt-0.5" strokeWidth={1.5} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              REST endpoints for agent communication ·{' '}
              <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">Base: {BASE}</code>
            </p>
          </div>
        </div>

        {/* Auth box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-indigo-800 mb-2">Authentication</p>
          <div className="space-y-1 text-sm text-indigo-700">
            <p><code className="font-mono bg-white/60 px-1 rounded">X-Agent-Key: YOUR_AGENT_KEY</code> — all write endpoints</p>
            <p><code className="font-mono bg-white/60 px-1 rounded">X-Cowork-Secret: YOUR_SECRET</code> — Cowork webhook</p>
            <p><code className="font-mono bg-white/60 px-1 rounded">X-Cron-Key: YOUR_CRON_SECRET</code> — scheduled crons</p>
            <p className="text-indigo-500 text-xs mt-2">Set these as environment variables in Vercel. GET endpoints are public (no auth required).</p>
          </div>
        </div>

        {/* Section endpoints */}
        {activeSection !== 'status-ref' && (() => {
          const section = SECTIONS.find(s => s.id === activeSection)
          if (!section) return null
          return (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.endpoints.map((ep, i) => (
                  <EndpointCard key={i} ep={ep} />
                ))}
              </div>
            </div>
          )
        })()}

        {/* Status reference */}
        {activeSection === 'status-ref' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Reference</h2>
            <p className="text-sm text-gray-500 mb-4">When updating a company, always set <code className="font-mono bg-gray-100 px-1 rounded">current_board</code> together with <code className="font-mono bg-gray-100 px-1 rounded">status</code>.</p>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-64">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-20">Board</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {STATUS_REFERENCE.map((r, i) => (
                    <tr key={r.status} className={i < STATUS_REFERENCE.length - 1 ? 'border-b border-gray-50' : ''}>
                      <td className="px-4 py-2.5">
                        <code className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{r.status}</code>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-mono font-semibold text-gray-500">{r.board}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
