'use client'

import { useEffect, useRef, useState } from 'react'
import AgentVoiceControls, { speakText, stopSpeech } from './AgentVoiceControls'
import { useEmployeeStore } from '@/store/useEmployeeStore'

type ChatMessage = {
  id: string
  role: 'user' | 'agent'
  content: string
}

const WELCOME = 'Bonjour ! Je suis l’agent IA de Gestion Chantier Pro. Pose-moi une question sur le chantier, les matériaux, le punch, la paie ou la facturation.'

function parseSSEChunk(chunk: string): string {
  let result = ''
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const data = line.slice(6).trim()
    if (!data || data === '[DONE]') continue
    try {
      const event = JSON.parse(data) as Record<string, unknown>
      const delta = event.delta as { type?: string; text?: string } | undefined
      if (event.type === 'content_block_delta' && delta?.type === 'text_delta') result += delta.text || ''
      else if (typeof event.text === 'string') result += event.text
      else if (typeof event.content === 'string') result += event.content
    } catch {
      result += ''
    }
  }
  return result
}

function renderText(text: string) {
  return text.split('\n').map((line, i) => <p key={i} className="mb-1 whitespace-pre-wrap break-words">{line || ' '}</p>)
}

export default function AgentChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'agent', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { employees, currentEmployeeId } = useEmployeeStore()
  const currentEmployee = employees.find(e => e.id === currentEmployeeId)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages])

  function closeChat() {
    stopSpeech()
    setOpen(false)
  }

  function clearConversation() {
    stopSpeech()
    setMessages([{ id: 'welcome', role: 'agent', content: WELCOME }])
    setSessionId(null)
  }

  function speakLastAnswer() {
    const last = [...messages].reverse().find(m => m.role === 'agent' && m.content.trim())
    if (last) speakText(last.content)
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    const userId = `u-${Date.now()}`
    const agentId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: userId, role: 'user', content: text }, { id: agentId, role: 'agent', content: '' }])
    setInput('')
    setLoading(true)

    try {
      const history = messages.filter(m => m.id !== 'welcome' && m.content.trim()).slice(-20).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          history,
          userContext: {
            role: currentEmployee ? 'employee' : 'admin',
            name: currentEmployee?.name ?? 'Administrateur',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
          },
        }),
      })

      const newSid = res.headers.get('X-Session-Id')
      if (newSid) setSessionId(newSid)

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => 'Erreur inconnue')
        setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Erreur IA: ${detail}` } : m))
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
          if (chunk) setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: m.content + chunk } : m))
        }
      }
      if (buffer) {
        const chunk = parseSSEChunk(buffer)
        if (chunk) setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: m.content + chunk } : m))
      }
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Erreur réseau: ${String(error)}` } : m))
    } finally {
      setLoading(false)
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
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fermer l'agent IA" : "Ouvrir l'agent IA"}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 focus:outline-none"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 45%, #d97706 100%)',
          boxShadow: open ? '0 0 0 3px rgba(251,191,36,0.4), 0 8px 24px rgba(251,191,36,0.35)' : '0 4px 20px rgba(251,191,36,0.4)',
        }}
      >
        <span className="select-none text-2xl">{open ? '✕' : '✨'}</span>
        {unreadDot && <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black" />}
      </button>

      {open && (
        <div
          className="fixed z-50 flex flex-col rounded-3xl border border-amber-400/20 backdrop-blur-xl"
          style={{
            bottom: '6rem',
            right: '1rem',
            width: 'min(380px, calc(100vw - 2rem))',
            height: 'min(560px, calc(100vh - 12rem))',
            background: 'rgba(12, 12, 22, 0.97)',
            boxShadow: '0 0 0 1px rgba(251,191,36,0.15), 0 24px 60px rgba(0,0,0,0.65), 0 0 40px rgba(251,191,36,0.08)',
          }}
        >
          <div className="flex flex-shrink-0 items-center gap-2 rounded-t-3xl border-b border-amber-400/15 px-4 py-3" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.13), rgba(217,119,6,0.06))' }}>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>🤖</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black leading-none text-amber-300">Agent Chantier Pro</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{currentEmployee ? `Bonjour ${currentEmployee.name ?? 'employé'}` : 'Espace administrateur'}</p>
            </div>
            <button onClick={speakLastAnswer} title="Lire la dernière réponse" className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/10">🔊</button>
            <button onClick={clearConversation} title="Nouvelle conversation" className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/10">🗑️</button>
            <button onClick={closeChat} title="Fermer" className="rounded-lg px-3 py-1 text-sm font-black text-white hover:bg-white/10">✕</button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(217,119,6,0.15))', border: '1px solid rgba(251,191,36,0.28)', color: '#fef3c7' }
                    : { background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)', color: '#e2e8f0' }}
                >
                  {m.content ? renderText(m.content) : loading ? <span className="text-amber-300">Analyse...</span> : null}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-shrink-0 gap-2 rounded-b-3xl border-t border-white/[0.07] p-3">
            <AgentVoiceControls disabled={loading} onText={text => setInput(text)} />
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pose ta question ou utilise le micro…"
              disabled={loading}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.065)', border: '1px solid rgba(255,255,255,0.11)', maxHeight: '100px' }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} className="flex-shrink-0 rounded-xl px-4 text-sm font-black text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
