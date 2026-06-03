'use client'

import { useEffect, useRef, useState } from 'react'

type RecEvent = Event & {
  resultIndex: number
  results: {
    length: number
    [index: number]: { isFinal: boolean; 0: { transcript: string } }
  }
}

type Rec = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: RecEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => Rec
    webkitSpeechRecognition?: new () => Rec
  }
}

export function speakText(text: string) {
  if (!('speechSynthesis' in window) || !text.trim()) return
  window.speechSynthesis.cancel()
  const voice = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, '').slice(0, 3500))
  voice.lang = 'fr-CA'
  voice.rate = 1
  window.speechSynthesis.speak(voice)
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export default function AgentVoiceControls({ disabled, onText }: { disabled?: boolean; onText: (text: string) => void }) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef = useRef<Rec | null>(null)

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
    return () => recRef.current?.abort()
  }, [])

  function toggle() {
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }
    const R = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!R) return
    const rec = new R()
    recRef.current = rec
    rec.lang = 'fr-CA'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1
    let finalText = ''
    rec.onresult = event => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0]?.transcript ?? ''
        if (event.results[i].isFinal) finalText += t
        else interim += t
      }
      onText((finalText || interim).trim())
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    setListening(true)
    rec.start()
  }

  return <button type="button" onClick={toggle} disabled={!supported || disabled} title={supported ? 'Dicter un message' : 'Reconnaissance vocale non supportée'} className="flex-shrink-0 rounded-xl px-3 text-sm font-black text-white transition-all active:scale-95 disabled:opacity-35" style={{ background: listening ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)' }}>{listening ? '⏹️' : '🎙️'}</button>
}
