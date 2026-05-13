'use client'

import { useEffect, useRef } from 'react'

/**
 * Runs silently in BoardsShell.
 * When there are content_ready leads without content, auto-generates them
 * one by one using EventSource (GET /api/generate-content/next).
 * Dispatches:
 *   'auto-gen-start'   — { name?: string }  when a generation begins
 *   'auto-gen-done'    — { name: string, remaining: number }  after each
 *   'auto-gen-idle'    — {}  when queue is empty
 *   'boards-refresh'   — after each completion (sidebar counts update)
 */
export function AutoContentRunner() {
  const runningRef = useRef(false)
  const esRef      = useRef<EventSource | null>(null)

  useEffect(() => {
    function checkAndRun() {
      if (runningRef.current) return
      fetch('/api/stats/counts')
        .then(r => r.json())
        .then((d: { content?: number }) => {
          if ((d.content ?? 0) > 0) startRun()
        })
        .catch(() => {})
    }

    function startRun() {
      if (runningRef.current) return
      runningRef.current = true
      window.dispatchEvent(new CustomEvent('auto-gen-start'))
      runNext()
    }

    function runNext() {
      esRef.current?.close()
      const es = new EventSource('/api/generate-content/next')
      esRef.current = es

      es.addEventListener('progress', (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data) as { message?: string }
          window.dispatchEvent(new CustomEvent('auto-gen-progress', { detail: d }))
        } catch { /* ignore */ }
      })

      es.addEventListener('done', (e: MessageEvent) => {
        es.close()
        window.dispatchEvent(new CustomEvent('boards-refresh'))

        try {
          const d = JSON.parse(e.data) as {
            message?: string
            company?: { name?: string }
            queue_remaining?: number
          }

          if (d.message === 'no_pending') {
            finish()
          } else {
            window.dispatchEvent(new CustomEvent('auto-gen-done', {
              detail: { name: d.company?.name, remaining: d.queue_remaining ?? 0 },
            }))
            if ((d.queue_remaining ?? 0) > 0) {
              setTimeout(runNext, 800)
            } else {
              finish()
            }
          }
        } catch { finish() }
      })

      es.addEventListener('error', () => {
        es.close()
        finish()
      })
    }

    function finish() {
      runningRef.current = false
      esRef.current = null
      window.dispatchEvent(new CustomEvent('auto-gen-idle'))
    }

    // Initial check + periodic poll every 15s
    checkAndRun()
    const interval = setInterval(checkAndRun, 15_000)

    // Re-check after any board move (a new lead may have just arrived in Content)
    window.addEventListener('boards-refresh', checkAndRun)

    return () => {
      clearInterval(interval)
      window.removeEventListener('boards-refresh', checkAndRun)
      esRef.current?.close()
    }
  }, [])

  return null
}
