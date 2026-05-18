'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { BulkActionBar } from '@/components/boards/BulkActionBar'
import { AutoContentRunner } from '@/components/providers/AutoContentRunner'

export function BoardsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto bg-[#F9FAFB]">
        {children}
      </main>
      <BulkActionBar />
      <AutoContentRunner />
    </div>
  )
}
