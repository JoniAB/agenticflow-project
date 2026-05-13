'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface SelectionCtx {
  selected:  Set<string>
  toggle:    (id: string) => void
  selectAll: (ids: string[]) => void
  clear:     () => void
}

const Ctx = createContext<SelectionCtx>({
  selected:  new Set(),
  toggle:    () => {},
  selectAll: () => {},
  clear:     () => {},
})

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  // Clear selection when navigating between boards
  useEffect(() => { setSelected(new Set()) }, [pathname])

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids))
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])

  return (
    <Ctx.Provider value={{ selected, toggle, selectAll, clear }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSelection() {
  return useContext(Ctx)
}
