'use client'
import { useRef, useEffect, useState } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

interface SignaturePadProps {
  label: string
  onSave: (signatureDataUrl: string) => void
  existingSignature?: string
  date?: string
}

export default function SignaturePad({
  label, onSave, existingSignature, date
}: SignaturePadProps) {
  const { theme } = useThemeStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [savedSignature, setSavedSignature] = useState(existingSignature || '')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (
    e: React.TouchEvent | React.MouseEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    setHasSignature(true)
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDraw = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setSavedSignature(dataUrl)
    onSave(dataUrl)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setSavedSignature('')
    onSave('')
  }

  const today = new Date().toLocaleDateString('fr-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      <p style={{
        color: theme.colors.textMuted, fontSize: '11px',
        letterSpacing: '1px', fontWeight: '700'
      }}>
        {label}
      </p>

      {/* INLINE CANVAS - always visible */}
      <div style={{
        border: `2px solid ${theme.colors.border}`,
        borderRadius: '12px', overflow: 'hidden',
        touchAction: 'none', background: '#ffffff',
        position: 'relative',
      }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          style={{
            width: '100%', height: '120px',
            display: 'block', cursor: 'crosshair',
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSignature && !savedSignature && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#aaa', fontSize: '13px',
            pointerEvents: 'none', fontStyle: 'italic',
          }}>
            Signez ici...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
          📅 {date || today}
        </p>
        {hasSignature && (
          <button onClick={clearSignature} style={{
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
            border: '1px solid #ef4444',
            background: 'transparent', color: '#ef4444',
            fontSize: '12px', fontWeight: '700',
          }}>🗑️ Effacer</button>
        )}
      </div>
    </div>
  )
}
