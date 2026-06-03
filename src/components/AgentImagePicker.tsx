'use client'

import { useRef } from 'react'

export type AgentImage = {
  name: string
  mediaType: string
  data: string
  previewUrl: string
}

function fileToImage(file: File): Promise<AgentImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Lecture image impossible'))
    reader.onload = () => {
      const raw = String(reader.result || '')
      const comma = raw.indexOf(',')
      resolve({
        name: file.name || 'photo-chantier.jpg',
        mediaType: file.type || 'image/jpeg',
        data: comma >= 0 ? raw.slice(comma + 1) : raw,
        previewUrl: raw,
      })
    }
    reader.readAsDataURL(file)
  })
}

export default function AgentImagePicker({ disabled, onImage }: { disabled?: boolean; onImage: (image: AgentImage) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function onChange(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const image = await fileToImage(file)
    onImage(image)
    if (inputRef.current) inputRef.current.value = ''
  }

  return <><button type="button" onClick={() => inputRef.current?.click()} disabled={disabled} title="Prendre ou joindre une photo" className="flex-shrink-0 rounded-xl px-3 text-sm font-black text-white transition-all active:scale-95 disabled:opacity-35" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)' }}>📷</button><input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => onChange(e.target.files?.[0] || null)} /></>
}
