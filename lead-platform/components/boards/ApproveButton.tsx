'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

interface ApproveButtonProps {
  companyId: string
  companyName: string
  onApproved?: () => void
}

export function ApproveButton({ companyId, companyName, onApproved }: ApproveButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    startTransition(async () => {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Key': 'yoni-agent-key-2025',
        },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (!res.ok) return
      setDone(true)
      setTimeout(() => {
        onApproved?.()
        router.refresh()
      }, 500)
    })
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <CheckCircle size={13} />
        Approved
      </span>
    )
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-60"
      style={{
        backgroundColor: isPending ? '#E8E8F8' : '#5B5BD6',
        color: isPending ? '#5B5BD6' : '#FFFFFF',
      }}
      onMouseEnter={(e) => {
        if (!isPending) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4A4AC5'
      }}
      onMouseLeave={(e) => {
        if (!isPending) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5B5BD6'
      }}
      title={`Approve outreach for ${companyName}`}
    >
      {isPending ? (
        <>
          <Loader2 size={12} className="animate-spin" />
          Approving…
        </>
      ) : (
        <>
          <CheckCircle size={12} />
          Approve &amp; Send
        </>
      )}
    </button>
  )
}
