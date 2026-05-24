'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Search, FileText, Send, Zap,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard, board: 1 },
  { href: '/search',    label: 'Search',          icon: Search,          board: 2 },
  { href: '/content',   label: 'Create Content',  icon: FileText,        board: 3 },
  { href: '/send',      label: 'Ready to Send',   icon: Send,            board: 4 },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: '#0a1628',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--green)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="#000" fill="#000" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.01em' }}>
              AgenticFlow
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
              v2
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>
          Pipeline
        </div>
        {NAV.map(({ href, label, icon: Icon, board }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6,
                background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                border: active ? '1px solid rgba(34,197,94,0.15)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}>
                <Icon size={15} color={active ? 'var(--green)' : 'var(--muted)'} />
                <span style={{
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text)' : 'var(--muted2)',
                  flex: 1,
                }}>
                  {label}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: 'var(--muted)',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 4, padding: '1px 6px',
                }}>
                  {board}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 500, color: 'var(--muted2)' }}>יוני אלוני</div>
          <div>aloni.yoni@gmail.com</div>
        </div>
      </div>
    </aside>
  )
}
