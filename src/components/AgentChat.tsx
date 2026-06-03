'use client'

import { useEffect, useRef, useState } from 'react'
import AgentVoiceControls, { speakText, stopSpeech } from './AgentVoiceControls'
import AgentImagePicker, { type AgentImage } from './AgentImagePicker'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useAISettingsStore } from '@/store/useAISettingsStore'

type ChatMessage = { id: string; role: 'user' | 'agent'; content: string; imageUrl?: string }
type Pos = { x: number; y: number }

const WELCOME = 'Bonjour ! Je suis l’agent IA de Gestion Chantier Pro. Tu peux écrire, parler, ou joindre une photo de chantier pour demander conseil.'
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

function parseSSEChunk(chunk: string): string {
  let result = ''
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const data = line.slice(6).trim()
    if (!data || data === '[DONE]') continue
    try {
      const event = JSON.parse(data) as any
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') result += event.delta.text || ''
      else if (typeof event.text === 'string') result += event.text
      else if (typeof event.content === 'string') result += event.content
      else if (event.choices?.[0]?.delta?.content) result += event.choices[0].delta.content
      else if (event.candidates?.[0]?.content?.parts?.[0]?.text) result += event.candidates[0].content.parts[0].text
    } catch {}
  }
  return result
}

function renderText(text: string) {
  return text.split('\n').map((line, i) => <p key={i} className="mb-1 whitespace-pre-wrap break-words">{line || ' '}</p>)
}

export default function AgentChat() {
  const aiSettings = useAISettingsStore(s => s.settings)
  const aiEnabled = aiSettings.enabled && aiSettings.mode !== 'disabled'
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'agent', content: WELCOME }])
  const [input, setInput] = useState('')
  const [image, setImage] = useState<AgentImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)
  const dragRef = useRef<{ dx: number; dy: number; moved: boolean } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { employees, currentEmployeeId } = useEmployeeStore()
  const currentEmployee = employees.find(e => e.id === currentEmployeeId)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ai-button-pos-v1')
      if (raw) setPos(JSON.parse(raw))
      else setPos({ x: Math.max(16, window.innerWidth - 72), y: Math.max(90, window.innerHeight - 170) })
    } catch { setPos({ x: 16, y: 140 }) }
    setReady(true)
  }, [])

  useEffect(() => { if (open) { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => inputRef.current?.focus(), 100) } }, [open, messages, image])
  if (!aiEnabled) return null

  function savePos(next: Pos) { setPos(next); try { localStorage.setItem('ai-button-pos-v1', JSON.stringify(next)) } catch {} }
  function pointerDown(e: React.PointerEvent<HTMLButtonElement>) { ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, moved: false } }
  function pointerMove(e: React.PointerEvent<HTMLButtonElement>) { const d = dragRef.current; if (!d || !ready) return; const next = { x: clamp(e.clientX - d.dx, 8, window.innerWidth - 66), y: clamp(e.clientY - d.dy, 72, window.innerHeight - 82) }; if (Math.abs(next.x - pos.x) > 2 || Math.abs(next.y - pos.y) > 2) d.moved = true; savePos(next) }
  function pointerUp() { const moved = dragRef.current?.moved; dragRef.current = null; if (!moved) setOpen(o => !o) }
  function closeChat() { stopSpeech(); setOpen(false) }
  function clearConversation() { stopSpeech(); setMessages([{ id: 'welcome', role: 'agent', content: WELCOME }]); setSessionId(null); setImage(null) }
  function speakLastAnswer() { const last = [...messages].reverse().find(m => m.role === 'agent' && m.content.trim()); if (last) speakText(last.content) }

  async function sendMessage() {
    const text = input.trim()
    if ((!text && !image) || loading) return
    if (image && !aiSettings.allowPhotoAnalysis) { setMessages(prev => [...prev, { id: `warn-${Date.now()}`, role: 'agent', content: 'Analyse photo désactivée dans les réglages IA.' }]); return }
    const safeText = text || 'Analyse cette photo de chantier et conseille-moi.'
    const userId = `u-${Date.now()}`
    const agentId = `a-${Date.now()}`
    const attachedImage = image
    setMessages(prev => [...prev, { id: userId, role: 'user', content: safeText, imageUrl: attachedImage?.previewUrl }, { id: agentId, role: 'agent', content: '' }])
    setInput(''); setImage(null); setLoading(true)
    try {
      const history = messages.filter(m => m.id !== 'welcome' && m.content.trim()).slice(-20).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/agent/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: safeText, image: attachedImage ? { mediaType: attachedImage.mediaType, data: attachedImage.data, name: attachedImage.name } : undefined, sessionId, history, aiSettings: { mode: aiSettings.mode, provider: aiSettings.provider, model: aiSettings.model, allowPhotoAnalysis: aiSettings.allowPhotoAnalysis }, userContext: { role: currentEmployee ? 'employee' : 'admin', name: currentEmployee?.name ?? 'Administrateur', page: typeof window !== 'undefined' ? window.location.pathname : undefined } }) })
      const newSid = res.headers.get('X-Session-Id'); if (newSid) setSessionId(newSid)
      if (!res.ok || !res.body) { const detail = await res.text().catch(() => 'Erreur inconnue'); setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Erreur IA: ${detail}` } : m)); return }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
      while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const blocks = buffer.split('\n\n'); buffer = blocks.pop() ?? ''; for (const block of blocks) { const chunk = parseSSEChunk(block); if (chunk) setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: m.content + chunk } : m)) } }
      if (buffer) { const chunk = parseSSEChunk(buffer); if (chunk) setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: m.content + chunk } : m)) }
    } catch (error) { setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Erreur réseau: ${String(error)}` } : m)) }
    finally { setLoading(false) }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }
  const unreadDot = !open && messages.length > 1
  const panelLeft = ready ? clamp(pos.x - 320, 8, Math.max(8, window.innerWidth - Math.min(380, window.innerWidth - 32) - 8)) : 8
  const panelTop = ready ? clamp(pos.y - 570, 72, Math.max(72, window.innerHeight - Math.min(560, window.innerHeight - 140) - 88)) : 90

  return <>
    <button onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} aria-label={open ? "Fermer l'agent IA" : "Ouvrir l'agent IA"} className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 focus:outline-none" style={{ left: ready ? pos.x : undefined, top: ready ? pos.y : undefined, right: ready ? undefined : '1rem', bottom: ready ? undefined : '6rem', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 45%, #d97706 100%)', boxShadow: open ? '0 0 0 3px rgba(251,191,36,0.4), 0 8px 24px rgba(251,191,36,0.35)' : '0 4px 20px rgba(251,191,36,0.4)', touchAction: 'none' }}><span className="select-none text-2xl">{open ? '✕' : '✨'}</span>{unreadDot && <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black" />}</button>
    {open && <div className="fixed z-50 flex flex-col rounded-3xl border border-amber-400/20 backdrop-blur-xl" style={{ left: panelLeft, top: panelTop, width: 'min(380px, calc(100vw - 2rem))', height: 'min(560px, calc(100vh - 12rem))', background: 'rgba(12, 12, 22, 0.97)', boxShadow: '0 0 0 1px rgba(251,191,36,0.15), 0 24px 60px rgba(0,0,0,0.65), 0 0 40px rgba(251,191,36,0.08)' }}>
      <div className="flex flex-shrink-0 items-center gap-2 rounded-t-3xl border-b border-amber-400/15 px-4 py-3" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.13), rgba(217,119,6,0.06))' }}><div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>🤖</div><div className="min-w-0 flex-1"><p className="text-sm font-black leading-none text-amber-300">Agent Chantier Pro</p><p className="mt-0.5 truncate text-xs text-slate-400">{aiSettings.provider} · {aiSettings.model}</p></div><button onClick={speakLastAnswer} title="Lire la dernière réponse" className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/10">🔊</button><button onClick={clearConversation} title="Nouvelle conversation" className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/10">🗑️</button><button onClick={closeChat} title="Fermer" className="rounded-lg px-3 py-1 text-sm font-black text-white hover:bg-white/10">✕</button></div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">{messages.map(m => <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className="max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed" style={m.role === 'user' ? { background: 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(217,119,6,0.15))', border: '1px solid rgba(251,191,36,0.28)', color: '#fef3c7' } : { background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)', color: '#e2e8f0' }}>{m.imageUrl && <img src={m.imageUrl} alt="Photo envoyée à l’agent" className="mb-2 max-h-44 rounded-xl object-cover" />}{m.content ? renderText(m.content) : loading ? <span className="text-amber-300">Analyse...</span> : null}</div></div>)}<div ref={bottomRef} /></div>
      {image && <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-white/[0.05] p-2"><img src={image.previewUrl} alt="Aperçu" className="h-12 w-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-amber-200">{image.name}</p><p className="text-[11px] text-slate-400">Photo prête à envoyer</p></div><button onClick={() => setImage(null)} className="rounded-lg px-2 text-slate-300 hover:bg-white/10">✕</button></div>}
      <div className="flex flex-shrink-0 gap-2 rounded-b-3xl border-t border-white/[0.07] p-3"><AgentImagePicker disabled={loading || !aiSettings.allowPhotoAnalysis} onImage={img => { setOpen(true); setImage(img); if (!input.trim()) setInput('Analyse cette photo de chantier et donne-moi les causes possibles, les risques, et les solutions.') }} /><AgentVoiceControls disabled={loading || !aiSettings.allowVoice} onText={text => setInput(text)} /><textarea ref={inputRef} rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Pose ta question, parle, ou ajoute une photo…" disabled={loading} className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.065)', border: '1px solid rgba(255,255,255,0.11)', maxHeight: '100px' }} /><button onClick={sendMessage} disabled={loading || (!input.trim() && !image)} className="flex-shrink-0 rounded-xl px-4 text-sm font-black text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>{loading ? '⏳' : '➤'}</button></div>
    </div>}
  </>
}
