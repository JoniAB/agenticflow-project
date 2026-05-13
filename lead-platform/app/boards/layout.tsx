import { Sidebar } from '@/components/layout/Sidebar'
import { FetchStateProvider } from '@/components/providers/FetchStateProvider'

export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FetchStateProvider>
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </FetchStateProvider>
  )
}
