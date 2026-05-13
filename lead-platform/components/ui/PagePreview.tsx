'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const PREVIEW_W = 340
const PREVIEW_H = 210
const IFRAME_W  = 1360
const IFRAME_H  = 840
const SCALE     = PREVIEW_W / IFRAME_W

interface PagePreviewProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function PagePreview({ href, children, className }: PagePreviewProps) {
  const [pos,     setPos]     = useState<{ x: number; y: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!anchorRef.current) return
      const r          = anchorRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - r.bottom
      const y = spaceBelow > PREVIEW_H + 16 ? r.bottom + 8 : r.top - PREVIEW_H - 8
      const x = Math.min(Math.max(r.left, 8), window.innerWidth - PREVIEW_W - 8)
      setPos({ x, y })
    }, 350)
  }, [])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPos(null)
  }, [])

  return (
    <>
      <a
        ref={anchorRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </a>

      {mounted && pos && createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.y,
            left: pos.x,
            width: PREVIEW_W,
            height: PREVIEW_H,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10 bg-white"
        >
          {/* URL bar */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 border-b border-gray-200">
            <div className="flex gap-0.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <span className="text-[9px] text-gray-400 truncate ml-1 flex-1">{href.replace(/^https?:\/\//, '')}</span>
          </div>
          {/* Scaled iframe */}
          <div
            style={{
              width: IFRAME_W,
              height: IFRAME_H,
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
            }}
          >
            <iframe
              src={href}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Page preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
