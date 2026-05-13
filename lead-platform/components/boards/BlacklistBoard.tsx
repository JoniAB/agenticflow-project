'use client'

import { useState, useEffect, useRef } from 'react'
import { Trash2, Plus, RotateCcw, ShieldOff, Search, ExternalLink, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlacklistCompany } from '@/app/api/blacklist/route'
import type { SearchQuery } from '@/app/api/queries/route'

type Tab = 'blacklist' | 'queries'

// ── Shared ─────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' })
    + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

// ── Blacklist Tab ──────────────────────────────────────────────────────────────

function BlacklistTab() {
  const [companies, setCompanies] = useState<BlacklistCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  async function sync() {
    setSyncing(true)
    const res = await fetch('/api/blacklist/sync', { method: 'POST' })
    const result = await res.json()
    setSyncing(false)
    if (result.added > 0) await load()
    else alert(`הרשימה כבר מעודכנת (${result.total} עסקים)`)
  }

  async function load() {
    setLoading(true)
    const res = await fetch('/api/blacklist')
    const { companies } = await res.json()
    setCompanies(companies)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openForm() {
    setShowForm(true)
    setTimeout(() => nameRef.current?.focus(), 50)
  }

  async function add() {
    if (!name.trim()) return
    setAdding(true)
    const res = await fetch('/api/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, domain }),
    })
    const item = await res.json()
    setCompanies(prev => [item, ...prev])
    setName('')
    setDomain('')
    setShowForm(false)
    setAdding(false)
  }

  async function remove(id: string) {
    setCompanies(prev => prev.filter(c => c.id !== id))
    await fetch('/api/blacklist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-800">
            Blocked Companies {!loading && `(${companies.length})`}
          </h2>
          <button onClick={load} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <RotateCcw size={13} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            סנכרן מהפייפליין
          </button>
          <button
            onClick={openForm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={13} /> Add Company
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Company Name *</label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="e.g. Acme Corp"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Website Domain</label>
            <input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="e.g. acme.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setName(''); setDomain('') }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={add}
              disabled={!name.trim() || adding}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={16} className="animate-spin" /> טוען...
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShieldOff size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">אין חברות חסומות</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {['COMPANY NAME', 'WEBSITE DOMAIN', 'ADDED', ''].map((h, i) => (
                <th key={i} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 first:pl-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((c, i) => (
              <tr key={c.id} className={cn('group hover:bg-gray-50 transition-colors', i < companies.length - 1 && 'border-b border-gray-100')}>
                <td className="py-3.5 pl-0 pr-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-3 py-3.5">
                  {c.domain
                    ? <a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        {c.domain} <ExternalLink size={11} />
                      </a>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-3 py-3.5 text-xs text-gray-400 whitespace-nowrap">{formatDate(c.added_at)}</td>
                <td className="px-3 py-3.5 text-right">
                  <button
                    onClick={() => remove(c.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Queries Tab ────────────────────────────────────────────────────────────────

function QueriesTab() {
  const [fresh, setFresh] = useState<SearchQuery[]>([])
  const [bank, setBank] = useState<SearchQuery[]>([])
  const [used, setUsed] = useState<SearchQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addText, setAddText] = useState('')
  const [adding, setAdding] = useState(false)
  const addRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/queries')
    const data = await res.json()
    setFresh(data.fresh ?? [])
    setBank(data.bank ?? [])
    setUsed(data.used ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addFresh() {
    if (!addText.trim()) return
    setAdding(true)
    const res = await fetch('/api/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: addText }),
    })
    const q = await res.json()
    setFresh(prev => [q, ...prev])
    setAddText('')
    setShowAdd(false)
    setAdding(false)
  }

  async function updateStatus(id: string, status: 'fresh' | 'bank' | 'used') {
    const from = [...fresh, ...bank, ...used].find(q => q.id === id)
    if (!from) return

    // Optimistic update
    const updated = { ...from, status }
    const remove = (list: SearchQuery[]) => list.filter(q => q.id !== id)
    if (from.status === 'fresh') setFresh(remove)
    else if (from.status === 'bank') setBank(remove)
    else setUsed(remove)

    if (status === 'fresh') setFresh(prev => [updated, ...prev])
    else if (status === 'bank') setBank(prev => [updated, ...prev])
    else setUsed(prev => [updated, ...prev])

    await fetch(`/api/queries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function deleteQuery(id: string, fromStatus: 'fresh' | 'bank' | 'used') {
    if (fromStatus === 'fresh') setFresh(prev => prev.filter(q => q.id !== id))
    else if (fromStatus === 'bank') setBank(prev => prev.filter(q => q.id !== id))
    else setUsed(prev => prev.filter(q => q.id !== id))

    await fetch(`/api/queries/${id}`, { method: 'DELETE' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
        <Loader2 size={16} className="animate-spin" /> טוען שאילתות...
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Fresh Queue */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-800">Fresh Queue ({fresh.length})</h3>
            <p className="text-xs text-gray-400">— סקור ואשר לבנק, או מחק</p>
          </div>
          <button
            onClick={() => { setShowAdd(true); setTimeout(() => addRef.current?.focus(), 50) }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {showAdd && (
          <div className="mb-3 flex gap-2">
            <input
              ref={addRef}
              value={addText}
              onChange={e => setAddText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFresh()}
              placeholder='"Tel Aviv coffee shop no booking site"'
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <button
              onClick={() => { setShowAdd(false); setAddText('') }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={addFresh}
              disabled={!addText.trim() || adding}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} הוסף
            </button>
          </div>
        )}

        {fresh.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">אין שאילתות בתור — הסוכן יוסיף כאן</p>
        ) : (
          <div className="space-y-1">
            {fresh.map(q => (
              <div key={q.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="flex-1 text-sm text-gray-700 font-mono">"{q.text}"</span>
                <button
                  onClick={() => updateStatus(q.id, 'bank')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <CheckCircle2 size={12} /> Approve → Bank
                </button>
                <button
                  onClick={() => deleteQuery(q.id, 'fresh')}
                  className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bank */}
      {bank.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
            <h3 className="text-sm font-semibold text-gray-800">Query Bank ({bank.length})</h3>
            <p className="text-xs text-gray-400">— ממתינות לשימוש הסוכן</p>
          </div>
          <div className="space-y-1">
            {bank.map(q => (
              <div key={q.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="flex-1 text-sm text-gray-700 font-mono">"{q.text}"</span>
                <button
                  onClick={() => deleteQuery(q.id, 'bank')}
                  className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Used Queries */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
          <h3 className="text-sm font-semibold text-gray-800">Used Queries ({used.length})</h3>
          <button onClick={load} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <RotateCcw size={12} />
          </button>
        </div>

        {used.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">אין שאילתות שנוצלו עדיין</p>
        ) : (
          <div className="space-y-1">
            {used.map(q => (
              <div key={q.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(q.added_at)}</span>
                <span className="flex-1 text-sm text-gray-500 font-mono">"{q.text}"</span>
                <button
                  onClick={() => updateStatus(q.id, 'bank')}
                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium opacity-0 group-hover:opacity-100 transition-all"
                >
                  Restore
                </button>
                <button
                  onClick={() => deleteQuery(q.id, 'used')}
                  className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Main Board ──────────────────────────────────────────────────────────────────

export function BlacklistBoard() {
  const [tab, setTab] = useState<Tab>('blacklist')

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'blacklist', label: 'Companies Blacklist', icon: ShieldOff },
    { id: 'queries',   label: 'Search Queries',      icon: Search    },
  ]

  return (
    <div className="px-10 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Blacklist & Queries</h1>
        <p className="text-sm text-gray-400 mt-1">Manage company blacklist and search query bank for outreach agents</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              tab === id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {tab === 'blacklist' ? <BlacklistTab /> : <QueriesTab />}
      </div>
    </div>
  )
}
