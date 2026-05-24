import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'AgenticFlow V2',
  description: 'B2B Outreach Automation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="ltr">
      <body style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
