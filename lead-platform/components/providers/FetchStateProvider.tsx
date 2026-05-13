'use client'

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react'

export interface FetchResult {
  name: string; domain?: string; industry?: string
  contact_phone?: string; contact_email?: string
  score?: number; weakness_summary?: string; city?: string
}

interface FetchState {
  loading:       boolean
  autoMode:      boolean
  results:       FetchResult[]
  industry:      string | null
  error:         string | null
  open:          boolean
  added:         Set<string>
  adding:        string | null
  statusMessage: string | null
  statusStep:    number
}

interface FetchStateCtx extends FetchState {
  run:    (mode: 'manual' | 'auto', query?: string) => void
  addToDB:(biz: FetchResult) => Promise<void>
  setOpen:(v: boolean) => void
  clearResults: () => void
}

const Ctx = createContext<FetchStateCtx | null>(null)

export function FetchStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FetchState>({
    loading: false, autoMode: false, results: [], industry: null,
    error: null, open: false, added: new Set(), adding: null,
    statusMessage: null, statusStep: 0,
  })

  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(async (mode: 'manual' | 'auto', query = '') => {
    if (state.loading) return
    if (mode === 'manual' && !query.trim()) return

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState(s => ({
      ...s, loading: true, autoMode: mode === 'auto',
      error: null, results: [], open: true,
      statusMessage: 'מתחיל...', statusStep: 0,
    }))

    try {
      const res = await fetch('/api/fetch-businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'auto'
            ? { mode: 'auto', stream: true }
            : { query, stream: true }
        ),
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        setState(s => ({
          ...s, loading: false, statusMessage: null, statusStep: 0,
          error: data.error === 'no_credits'
            ? 'אין קרדיטים ב-Anthropic API — הוסף כדי להפעיל את הסוכנים'
            : (data.error ?? 'שגיאה'),
        }))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // SSE events are separated by \n\n
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.trim()) continue
          const lines = part.split('\n')
          let eventType = ''
          let eventData = ''
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7)
            else if (line.startsWith('data: ')) eventData = line.slice(6)
          }
          if (!eventType || !eventData) continue
          try {
            const payload = JSON.parse(eventData)
            if (eventType === 'progress') {
              setState(s => ({ ...s, statusMessage: payload.message, statusStep: payload.step ?? s.statusStep }))
            } else if (eventType === 'done') {
              setState(s => ({
                ...s, loading: false, statusMessage: null, statusStep: 0,
                results: payload.businesses ?? [],
                industry: payload.auto_industry ?? null,
                added: new Set(),
              }))
            } else if (eventType === 'error') {
              setState(s => ({
                ...s, loading: false, statusMessage: null, statusStep: 0,
                error: payload.error === 'no_credits'
                  ? 'אין קרדיטים ב-Anthropic API — הוסף כדי להפעיל את הסוכנים'
                  : (payload.error ?? 'שגיאה'),
              }))
            }
          } catch { /* ignore malformed SSE data */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error)?.name === 'AbortError') return
      setState(s => ({ ...s, loading: false, statusMessage: null, statusStep: 0, error: 'שגיאת רשת — נסה שוב' }))
    }
  }, [state.loading])

  const addToDB = useCallback(async (biz: FetchResult) => {
    setState(s => {
      if (s.adding === biz.name || s.added.has(biz.name)) return s
      return { ...s, adding: biz.name }
    })
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Agent-Key': 'yoni-agent-key-2025' },
        body: JSON.stringify({
          name: biz.name, domain: biz.domain, industry: biz.industry,
          contact_phone: biz.contact_phone, contact_email: biz.contact_email,
          score: biz.score, notes: biz.weakness_summary,
          source: 'google_maps',
          status: 'high_score',
        }),
      })
      if (res.ok) {
        setState(s => ({ ...s, added: new Set([...s.added, biz.name]) }))
      }
    } finally {
      setState(s => ({ ...s, adding: null }))
    }
  }, [])

  const setOpen = useCallback((v: boolean) => setState(s => ({ ...s, open: v })), [])
  const clearResults = useCallback(() => setState(s => ({ ...s, results: [], open: false, error: null })), [])

  return (
    <Ctx.Provider value={{ ...state, run, addToDB, setOpen, clearResults }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFetchState() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFetchState must be used inside FetchStateProvider')
  return ctx
}
