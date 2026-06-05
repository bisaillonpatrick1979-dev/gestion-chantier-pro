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

// ── Voice selection — prefer neural/cloud voices ───────────────────────────

function pickVoice(lang: 'fr' | 'en'): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const isFr = lang === 'fr'

  // Ranked preference list — cloud/neural voices first
  const prefs = isFr
    ? ['Google Français', 'Thomas', 'Amélie', 'Caroline', 'Microsoft Paul', 'Microsoft Guillaume', 'Microsoft Hortense', 'Zosia']
    : ['Google US English', 'Samantha', 'Microsoft Aria', 'Microsoft Guy', 'Alex', 'Daniel', 'Karen', 'Google UK English Female']

  for (const name of prefs) {
    const v = voices.find(v => v.name.includes(name))
    if (v) return v
  }

  // Fall back to any matching-language voice
  return voices.find(v => v.lang.startsWith(isFr ? 'fr' : 'en')) ?? null
}

// ── Detect text language (simple heuristic) ────────────────────────────────

function detectLang(text: string): 'fr' | 'en' {
  const frWords = /\b(le|la|les|de|du|des|est|dans|je|tu|il|elle|nous|vous|ils|pas|que|qui|une|pour|sur|avec|vous|mais|tout|plus)\b/gi
  const matches = (text.match(frWords) ?? []).length
  return matches >= 3 ? 'fr' : 'en'
}

export function speakText(text: string, lang?: 'fr' | 'en') {
  if (!('speechSynthesis' in window) || !text.trim()) return
  window.speechSynthesis.cancel()

  const clean = text.replace(/[#*_`]/g, '').replace(/\n{2,}/g, '. ').slice(0, 4000)
  const resolvedLang = lang ?? detectLang(clean)

  const utter = new SpeechSynthesisUtterance(clean)
  utter.lang   = resolvedLang === 'en' ? 'en-CA' : 'fr-CA'
  utter.rate   = 0.93   // slightly slower than default — more natural
  utter.pitch  = 1.05   // fractionally higher — warmer tone
  utter.volume = 1.0

  // Voices load asynchronously — try immediately, retry after load event
  const tryVoice = () => {
    const v = pickVoice(resolvedLang)
    if (v) utter.voice = v
    window.speechSynthesis.speak(utter)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    tryVoice()
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null
      tryVoice()
    }
  }
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

// ── Mic component ──────────────────────────────────────────────────────────

export default function AgentVoiceControls({
  disabled,
  onText,
  onVoiceEnd,
}: {
  disabled?: boolean
  onText: (text: string) => void
  onVoiceEnd?: (finalText: string) => void
}) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef  = useRef<Rec | null>(null)
  const finalRef = useRef('')   // accumulate final text across pauses

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
    // Pre-warm voice list so first TTS call has no delay
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices()
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
    finalRef.current = ''

    // Detect language from first few words — default fr-CA
    rec.lang           = 'fr-CA'
    rec.interimResults = true
    rec.continuous     = false   // stops after natural pause → triggers onend
    rec.maxAlternatives = 1

    rec.onresult = event => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0]?.transcript ?? ''
        if (event.results[i].isFinal) {
          finalRef.current += segment + ' '
        } else {
          interim += segment
        }
      }
      const display = (finalRef.current + interim).trim()
      onText(display)

      // Switch recognition language if English detected mid-stream
      if (finalRef.current.length > 20) {
        const detected = detectLang(finalRef.current)
        if (detected === 'en' && rec.lang !== 'en-CA') rec.lang = 'en-CA'
      }
    }

    rec.onerror = () => setListening(false)

    rec.onend = () => {
      setListening(false)
      const text = finalRef.current.trim()
      if (text && onVoiceEnd) {
        onVoiceEnd(text)
      }
    }

    setListening(true)
    rec.start()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!supported || disabled}
      title={supported ? 'Dicter un message (auto-envoi)' : 'Reconnaissance vocale non supportée'}
      className="flex-shrink-0 rounded-xl px-3 text-sm font-black text-white transition-all active:scale-95 disabled:opacity-35"
      style={{
        background: listening
          ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
          : 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.12)',
        animation: listening ? 'pulse 1s infinite' : 'none',
      }}
    >
      {listening ? '⏹️' : '🎙️'}
    </button>
  )
}
