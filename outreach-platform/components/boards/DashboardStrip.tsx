import { Lead } from '@/lib/types'

interface Props { leads: Lead[] }

export function DashboardStrip({ leads }: Props) {
  const total      = leads.length
  const inProgress = leads.filter(l => ['in_progress', 'pending_review'].includes(l.status)).length
  const qualified  = leads.filter(l => l.status === 'qualified').length
  const contacted  = leads.filter(l => ['contacted', 'following_up'].includes(l.status)).length
  const responded  = leads.filter(l => l.status === 'responded').length
  const rejected   = leads.filter(l => ['rejected', 'archived'].includes(l.status)).length

  const stats = [
    { label: 'Total',      heb: 'סה״כ',           value: total,      color: 'text-gray-900',   dot: 'bg-gray-300' },
    { label: 'Processing', heb: 'בעיבוד',          value: inProgress, color: 'text-yellow-600', dot: 'bg-yellow-400' },
    { label: 'Qualified',  heb: 'מוסמכים',          value: qualified,  color: 'text-green-600',  dot: 'bg-green-400' },
    { label: 'Contacted',  heb: 'נוצר קשר',         value: contacted,  color: 'text-indigo-600', dot: 'bg-indigo-400' },
    { label: 'Responded',  heb: 'הגיבו',            value: responded,  color: 'text-emerald-600',dot: 'bg-emerald-400' },
    { label: 'Rejected',   heb: 'נדחו',             value: rejected,   color: 'text-red-500',    dot: 'bg-red-400' },
  ]

  return (
    <div className="grid grid-cols-6 gap-3 mb-6">
      {stats.map(({ label, heb, value, color, dot }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <p className="text-xs text-gray-500">{label}</p>
            <span className="ml-auto text-[10px] text-gray-400 font-medium" dir="rtl">{heb}</span>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
