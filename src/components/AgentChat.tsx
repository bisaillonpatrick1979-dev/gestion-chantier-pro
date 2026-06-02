'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useAIConfigStore } from '@/store/useAIConfigStore'

type Role = 'user' | 'agent'

type Message = {
  id: string
  role: Role
  content: string
}

const WELCOME =
  'Bonjour ! 👷 Je suis l\'agent IA de **Gestion Chantier Pro**.\n\nJe peux t\'aider avec :\n- Punch in/out et calculs de paie\n- Questions techniques de chantier\n- Listes de matériaux et prix\n- Facturation et comptabilité\n- Objectifs et motivation\n\nPose-moi n\'importe quelle question !'

// ─── Rendu Markdown simple (sans dépendances externes) ──────────────────────

function inlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-amber-300">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-amber-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('### ')) {
      return (
        <div key={i} className="mb-0.5 mt-2 font-bold text-amber-300">
          {inlineMarkdown(line.slice(4))}
        </div>
      )
    }
    if (line.startsWith('## ')) {
      return (
        <div key={i} className="mb-0.5 mt-2 text-base font-bold text-amber-200">
          {inlineMarkdown(line.slice(3))}
        </div>
      )
    }
    if (line.startsWith('# ')) {
      return (
        <div key={i} className="mb-1 mt-2 text-lg font-bold text-amber-200">
          {inlineMarkdown(line.slice(2))}
        </div>
      )
    }
    if (line === '---' || line === '***') {
      return <div key={i} className="my-2 border-t border-white/10" />
    }
    const listMatch = line.match(/^([-*•]) (.+)/)
    if (listMatch) {
      return (
        <div key={i} className="flex gap-1 pl-1">
          <span className="flex-shrink-0 text-amber-400">•</span>
          <span>{inlineMarkdown(listMatch[2])}</span>
        </div>
      )
    }
    const numberedMatch = line.match(/^(\d+)\. (.+)/)
    if (numberedMatch) {
      return (
        <div key={i} className="flex gap-1 pl-1">
          <span className="flex-shrink-0 text-amber-400">{numberedMatch[1]}.</span>
          <span>{inlineMarkdown(numberedMatch[2])}</span>
        </div>
      )
    }
    if (line.trim() === '') {
      return <div key={i} className="h-1" />
    }
    return <div key={i}>{inlineMarkdown(line)}</div>
  })
}

// ─── Parser SSE (Managed Agents + Messages API) ─────────────────────────────

function parseSSEChunk(chunk: string): string {
  let result = ''
  const lines = chunk.split('\n')
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    const data = line.slice(6).trim()
    if (!data || data === '[DONE]') continue
    try {
      const event = JSON.parse(data) as Record<string, unknown>
      const type = event.type as string | undefined
      // Messages API streaming format
      if (type === 'content_block_delta') {
        const delta = event.delta as Record<string, unknown> | undefined
        if (delta?.type === 'text_delta') result += (delta.text ?? '') as string
      }
      // Managed Agents format
      else if (type === 'assistant' || type === 'text') {
        result += (event.text ?? event.content ?? '') as string
      }
      // OpenAI chat completions streaming format
      else if (event.choices) {
        const choices = event.choices as Array<{ delta?: { content?: string } }>
        result += choices[0]?.delta?.content ?? ''
      } else if (typeof event.text === 'string') {
        result += event.text
      }
    } catch {
      // skip non-JSON lines
    }
  }
  return result
}

// ─── Composant Principal ─────────────────────────────────────────────────────

export default function AgentChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'agent', content: WELCOME },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { employees, currentEmployeeId } = useEmployeeStore()
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const { provider, apiKey, model } = useAIConfigStore()

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (open) scrollBottom()
  }, [messages, open, scrollBottom])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  function clearConversation() {
    setMessages([{ id: 'welcome', role: 'agent', content: WELCOME }])
    setSessionId(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsgId = `u-${Date.now()}`
    const agentMsgId = `a-${Date.now() + 1}`

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: agentMsgId, role: 'agent', content: '' },
    ])
    setInput('')
    setLoading(true)

    try {
      // Historique (sans le message de bienvenue et sans les messages vides)
      const history = messages
        .filter((m) => m.id !== 'welcome' && m.content.trim())
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          history,
          userContext: {
            role: currentEmployee ? 'employee' : 'admin',
            name:
              (currentEmployee as { name?: string } | undefined)?.name ?? 'Administrateur',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
          },
          aiConfig: apiKey ? { provider, apiKey, model } : undefined,
        }),
      })

      const newSid = res.headers.get('X-Session-Id')
      if (newSid) setSessionId(newSid)

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => 'Erreur inconnue')
        let detail = err
        try {
          const parsed = JSON.parse(err) as { error?: string }
          detail = parsed.error ?? err
        } catch {
          /* keep raw */
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId ? { ...m, content: `⚠️ ${detail}` } : m
          )
        )
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split('\n\n')
        buffer = blocks.pop() ?? ''

        for (const block of blocks) {
          const chunk = parseSSEChunk(block)
          if (chunk) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentMsgId ? { ...m, content: m.content + chunk } : m
              )
            )
          }
        }
      }

      // Flush du reste
      if (buffer) {
        const chunk = parseSSEChunk(buffer)
        if (chunk) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId ? { ...m, content: m.content + chunk } : m
            )
          )
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentMsgId
            ? { ...m, content: `⚠️ Erreur réseau : ${String(err)}` }
            : m
        )
      )
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const unreadDot = !open && messages.length > 1

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer l'agent IA" : "Ouvrir l'agent IA"}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 focus:outline-none"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)',
          boxShadow: open
            ? '0 0 0 3px rgba(251,191,36,0.4), 0 8px 24px rgba(251,191,36,0.35)'
            : '0 4px 20px rgba(251,191,36,0.4)',
        }}
      >
        <span className="select-none text-2xl">{open ? '✕' : '✨'}</span>
        {/* Indicateur de nouvelles réponses */}
        {unreadDot && (
          <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black" />
        )}
      </button>

      {/* Panneau de chat */}
      {open && (
        <div
          className="fixed z-50 flex flex-col rounded-3xl border border-amber-400/20 backdrop-blur-xl"
          style={{
            bottom: '6rem',
            right: '1rem',
            width: 'min(380px, calc(100vw - 2rem))',
            height: 'min(560px, calc(100vh - 12rem))',
            background: 'rgba(12, 12, 22, 0.97)',
            boxShadow:
              '0 0 0 1px rgba(251,191,36,0.15), 0 24px 60px rgba(0,0,0,0.65), 0 0 40px rgba(251,191,36,0.08)',
          }}
        >
          {/* Header */}
          <div
            className="flex flex-shrink-0 items-center gap-3 rounded-t-3xl border-b border-amber-400/15 px-4 py-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(251,191,36,0.13) 0%, rgba(217,119,6,0.06) 100%)',
            }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
            >
              🤖
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black leading-none text-amber-300">Agent Chantier Pro</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {currentEmployee
                  ? `Bonjour ${
                      (currentEmployee as { name?: string }).name ?? 'employé'
                    } 👋`
                  : 'Espace administrateur'}
              </p>
            </div>
            {/* Bouton effacer */}
            <button
              onClick={clearConversation}
              title="Nouvelle conversation"
              className="flex-shrink-0 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
            >
              🗑️
            </button>
            {/* Indicateur en ligne */}
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className="max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                  style={
                    m.role === 'user'
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(217,119,6,0.15))',
                          border: '1px solid rgba(251,191,36,0.28)',
                          color: '#fef3c7',
                        }
                      : {
                          background: 'rgba(255,255,255,0.055)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          color: '#e2e8f0',
                        }
                  }
                >
                  {m.role === 'user' ? (
                    <span className="whitespace-pre-wrap break-words">{m.content}</span>
                  ) : m.content ? (
                    <div className="space-y-0.5 break-words">{renderMarkdown(m.content)}</div>
                  ) : loading ? (
                    /* Animation de chargement */
                    <span className="flex items-center gap-1 py-0.5">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex flex-shrink-0 gap-2 rounded-b-3xl border-t border-white/[0.07] p-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pose ta question… (Entrée pour envoyer)"
              disabled={loading}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.065)',
                border: '1px solid rgba(255,255,255,0.11)',
                maxHeight: '100px',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 rounded-xl px-4 text-sm font-black text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
