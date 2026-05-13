'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Save, RotateCcw, Loader2, CheckCircle2, SlidersHorizontal, Tag, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchSettings } from '@/app/api/settings/route'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ── Tag chip ──────────────────────────────────────────────────────────────────

function TagChip({
  label, color, onRemove,
}: { label: string; color: 'indigo' | 'red'; onRemove: () => void }) {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300',
    red:    'bg-red-50 text-red-700 border-red-100 hover:border-red-300',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
      styles[color]
    )}>
      {label}
      <button
        onClick={onRemove}
        className="rounded-full hover:bg-black/10 transition-colors p-0.5 -mr-0.5"
      >
        <X size={11} />
      </button>
    </span>
  )
}

// ── Add tag input ─────────────────────────────────────────────────────────────

function AddTagInput({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [val, setVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commit() {
    const trimmed = val.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setVal('')
    inputRef.current?.focus()
  }

  return (
    <div className="inline-flex items-center gap-1 border border-dashed border-gray-200 rounded-full px-3 py-1.5 bg-white hover:border-gray-300 transition-colors">
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
        placeholder={placeholder}
        className="text-sm text-gray-600 placeholder:text-gray-300 outline-none bg-transparent w-36"
        dir="rtl"
      />
      <button
        onClick={commit}
        disabled={!val.trim()}
        className="text-gray-300 hover:text-indigo-500 transition-colors disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

// ── Score slider ──────────────────────────────────────────────────────────────

function ScoreSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={1} max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-48 accent-indigo-600"
      />
      <div className="flex items-center gap-1">
        <span className="text-2xl font-bold text-indigo-600">{value}</span>
        <span className="text-sm text-gray-400">/ 10</span>
      </div>
      <p className="text-xs text-gray-400">
        {value <= 3 ? 'רק עסקים חלשים מאוד' : value <= 5 ? 'עסקים עם נוכחות חלשה' : 'כולל עסקים בינוניים'}
      </p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SearchCriteriaBoard() {
  const [settings,   setSettings]   = useState<SearchSettings | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    if (!settings) return
    setSaveStatus('saving')
    try {
      await fetch('/api/settings', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(settings),
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  async function reset() {
    setLoading(true)
    const res = await fetch('/api/settings')
    const defaults = await res.json()
    setSettings(defaults)
    setLoading(false)
  }

  function addIndustry(v: string) {
    setSettings(s => s ? { ...s, industries: [...s.industries, v] } : s)
  }
  function removeIndustry(i: number) {
    setSettings(s => s ? { ...s, industries: s.industries.filter((_, idx) => idx !== i) } : s)
  }
  function addCriteria(v: string) {
    setSettings(s => s ? { ...s, weakness_criteria: [...s.weakness_criteria, v] } : s)
  }
  function removeCriteria(i: number) {
    setSettings(s => s ? { ...s, weakness_criteria: s.weakness_criteria.filter((_, idx) => idx !== i) } : s)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
        <Loader2 size={16} className="animate-spin" /> טוען הגדרות...
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="px-10 pt-8 pb-16 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal size={20} className="text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">Search Criteria</h1>
          </div>
          <p className="text-sm text-gray-400">הגדר לפי מה הסוכנים מחפשים ובוחרים עסקים</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw size={13} /> ברירת מחדל
          </button>
          <button
            onClick={save}
            disabled={saveStatus === 'saving'}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors',
              saveStatus === 'saving' ? 'bg-indigo-400 cursor-wait' :
              saveStatus === 'saved'  ? 'bg-emerald-500 cursor-default' :
              saveStatus === 'error'  ? 'bg-red-500' :
                                        'bg-indigo-600 hover:bg-indigo-700'
            )}
          >
            {saveStatus === 'saving' ? <><Loader2 size={13} className="animate-spin" /> שומר...</> :
             saveStatus === 'saved'  ? <><CheckCircle2 size={13} /> נשמר</> :
                                       <><Save size={13} /> שמור שינויים</>}
          </button>
        </div>
      </div>

      {/* Section: Industries */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={15} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">תעשיות לחיפוש אוטומטי</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">כשהסוכן רץ במצב אוטו, הוא בוחר תעשייה אקראית מהרשימה הזו</p>
        <div className="flex flex-wrap gap-2">
          {settings.industries.map((ind, i) => (
            <TagChip key={i} label={ind} color="indigo" onRemove={() => removeIndustry(i)} />
          ))}
          <AddTagInput placeholder="הוסף תעשייה..." onAdd={addIndustry} />
        </div>
      </section>

      <div className="border-t border-gray-100 mb-10" />

      {/* Section: Weakness criteria */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Tag size={15} className="text-red-500" />
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">קריטריוני חולשה דיגיטלית</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">הסוכן מחפש עסקים שסובלים מהחסרים האלה — ככל שיש יותר, ציון נמוך יותר</p>
        <div className="flex flex-wrap gap-2">
          {settings.weakness_criteria.map((crit, i) => (
            <TagChip key={i} label={crit} color="red" onRemove={() => removeCriteria(i)} />
          ))}
          <AddTagInput placeholder="הוסף קריטריון..." onAdd={addCriteria} />
        </div>
      </section>

      <div className="border-t border-gray-100 mb-10" />

      {/* Section: Score threshold */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-800 uppercase tracking-wider">ציון מקסימלי להכנסה לפייפליין</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">עסקים עם ציון גבוה מזה לא ייחשבו כמועמדים</p>
        <ScoreSlider
          value={settings.max_score}
          onChange={v => setSettings(s => s ? { ...s, max_score: v } : s)}
        />
      </section>

      {/* Info box */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-700">
        <strong>איך זה עובד:</strong> בכל חיפוש אוטומטי, הסוכן קורא את ההגדרות האלה ומשתמש בהן לבניית הפרומפט. שינויים נכנסים לתוקף בחיפוש הבא.
      </div>
    </div>
  )
}
