import { Sidebar } from '@/components/layout/Sidebar'

export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#f4f5f9] p-6">
        {children}
      </main>
    </div>
  )
}
