'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Bot, User, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AGENTS, type AgentDef } from '@/lib/agents'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ─── Agent Selector ───────────────────────────────────────────────────────────

function AgentCard({ agent, active, onClick }: {
  agent: AgentDef; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 rounded-xl border transition-all',
        active
          ? `${agent.bgColor} ${agent.borderColor} shadow-sm`
          : 'bg-transparent border-transparent hover:bg-white/5'
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn('w-2 h-2 rounded-full shrink-0', agent.dotColor)} />
        <div className="min-w-0">
          <p className={cn('text-[13px] font-semibold leading-tight truncate', active ? agent.textColor : 'text-white')}>
            {agent.name}
          </p>
          <p className={cn('text-[11px] leading-tight truncate mt-0.5', active ? 'text-gray-500' : 'text-[#5B6080]')}>
            {agent.role}
          </p>
        </div>
      </div>
      {active && (
        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed pl-[18px]">{agent.desc}</p>
      )}
    </button>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, agent }: { msg: Message; agent: AgentDef }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-3 items-start', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'bg-indigo-600' : agent.bgColor
      )}>
        {isUser
          ? <User size={13} className="text-white" />
          : <Bot size={13} className={agent.textColor} />}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
      )}>
        {msg.content}
      </div>
    </div>
  )
}

function TypingBubble({ agent }: { agent: AgentDef }) {
  return (
    <div className="flex gap-3 items-start">
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', agent.bgColor)}>
        <Bot size={13} className={agent.textColor} />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Chat Window ──────────────────────────────────────────────────────────────

function ChatWindow({ agent }: { agent: AgentDef }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Reset when agent changes
  useEffect(() => {
    setMessages([])
    setInput('')
    setStreamingText('')
  }, [agent.id])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg: Message = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setStreaming(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setStreamingText(full)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessages(prev => [...prev, { role: 'assistant', content: `שגיאה: ${msg}` }])
    } finally {
      setStreaming(false)
      setStreamingText('')
      textareaRef.current?.focus()
    }
  }, [input, streaming, messages, agent.id])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0 && !streaming

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-5 py-3.5 border-b border-gray-200', agent.bgColor)}>
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2.5 h-2.5 rounded-full animate-pulse', agent.dotColor)} />
          <div>
            <p className={cn('text-sm font-semibold', agent.textColor)}>{agent.name}</p>
            <p className="text-[11px] text-gray-500">{agent.role}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={12} />
            נקה שיחה
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gray-50">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-4', agent.bgColor)}>
              <Bot size={24} className={agent.textColor} />
            </div>
            <p className="text-sm font-semibold text-gray-700">{agent.name}</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">{agent.desc}</p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
              {getSuggestedPrompts(agent.id).map(p => (
                <button
                  key={p}
                  onClick={() => { setInput(p); textareaRef.current?.focus() }}
                  className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 text-right hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} agent={agent} />
        ))}

        {streaming && !streamingText && <TypingBubble agent={agent} />}

        {streaming && streamingText && (
          <MessageBubble msg={{ role: 'assistant', content: streamingText }} agent={agent} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`שלח הודעה ל-${agent.name}...`}
            rows={1}
            disabled={streaming}
            dir="rtl"
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-right focus:outline-none focus:border-indigo-400 disabled:opacity-50 max-h-32 bg-gray-50"
            style={{ lineHeight: '1.5' }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
              input.trim() && !streaming
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            )}
          >
            {streaming
              ? <Loader2 size={15} className="animate-spin" />
              : <Send size={15} />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">Enter לשלוח · Shift+Enter לשורה חדשה</p>
      </div>
    </div>
  )
}

function getSuggestedPrompts(agentId: string): string[] {
  const map: Record<string, string[]> = {
    research:  ['נתח את קליניקת פסגות — מה הציון שלה?', 'מהם הכאבים הנפוצים בקרב רופאי שיניים?', 'מה לחפש כשסורקים פרופיל Google Business?'],
    content:   ['כתוב מייל ראשוני לקליניקה וטרינרית', 'תן לי דוגמה לנושא מייל חזק', 'כיצד לפתוח מייל שמראה שעשיתי שיעורי בית?'],
    followup:  ['כתוב follow-up ראשון שונה מהמייל הראשון', 'איך לזהות auto-reply?', 'מתי לוותר על ליד ולהעביר לארכיב?'],
    pipeline:  ['מה המצב הנוכחי של הפייפליין?', 'על מה כדאי להתמקד עכשיו?', 'אילו לידים מחכים לאישור?'],
    analyst:   ['מה שיעור התגובה הממוצע שלנו?', 'אילו תעשיות מגיבות הכי טוב?', 'כמה זמן לוקח בממוצע מליד לשליחה?'],
  }
  return map[agentId] ?? []
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgentChat() {
  const [activeId, setActiveId] = useState(AGENTS[0].id)
  const activeAgent = AGENTS.find(a => a.id === activeId)!

  return (
    <div className="flex h-full">
      {/* Agent list — uses the dark sidebar style */}
      <aside className="w-56 shrink-0 bg-[#1C1D2E] flex flex-col border-r border-white/[0.06]">
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3D4060]">סוכנים</p>
          <p className="text-xs text-[#5B6080] mt-0.5">בחר סוכן לשליחת הודעה</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {AGENTS.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              active={agent.id === activeId}
              onClick={() => setActiveId(agent.id)}
            />
          ))}
        </div>
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <p className="text-[10px] text-[#3D4060]">Powered by Claude Sonnet</p>
        </div>
      </aside>

      {/* Chat window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow key={activeId} agent={activeAgent} />
      </div>
    </div>
  )
}
