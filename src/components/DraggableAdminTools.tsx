'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

type Pos = { x: number; y: number }

export default function DraggableAdminTools() {
  const { employees, currentEmployeeId } = useEmployeeStore()
  const current = employees.find(e => e.id === currentEmployeeId)
  const canSee = employees.length === 0 || current?.role === 'admin' || current?.role === 'accountant' || current?.role === 'secretary'
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos>({ x: 16, y: 160 })
  const dragRef = useRef<{ dx: number; dy: number; moved: boolean } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin-tools-pos-v1')
      if (raw) setPos(JSON.parse(raw))
    } catch {}
  }, [])

  if (!canSee) return null

  function save(next: Pos) {
    setPos(next)
    try { localStorage.setItem('admin-tools-pos-v1', JSON.stringify(next)) } catch {}
  }

  function down(e: React.PointerEvent<HTMLButtonElement>) {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, moved: false }
  }
  function move(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragRef.current
    if (!d) return
    d.moved = true
    save({ x: clamp(e.clientX - d.dx, 8, window.innerWidth - 70), y: clamp(e.clientY - d.dy, 70, window.innerHeight - 150) })
  }
  function up() {
    const moved = dragRef.current?.moved
    dragRef.current = null
    if (!moved) setOpen(v => !v)
  }

  return <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9998 }}>
    <button onPointerDown={down} onPointerMove={move} onPointerUp={up} style={{ width: 58, height: 58, borderRadius: 999, border: '1px solid rgba(250,204,21,.6)', background: 'linear-gradient(135deg,#b45309,#7c3aed)', color: 'white', fontSize: 24, fontWeight: 950, boxShadow: '0 0 22px rgba(250,204,21,.45),0 12px 28px rgba(0,0,0,.55)', touchAction: 'none' }}>⚡</button>
    {open && <div style={{ position: 'absolute', left: 0, top: 66, width: 240, borderRadius: 18, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(15,23,42,.97)', padding: 10, boxShadow: '0 18px 45px rgba(0,0,0,.7)' }}>
      <b style={{ color: 'white', fontSize: 15 }}>Outils admin</b>
      <Tool href="/motivation" label="🏆 Motivation" />
      <Tool href="/suppliers" label="🏬 Fournisseurs" />
      <Tool href="/commandes" label="📦 Commandes / PO" />
      <Tool href="/assignments" label="✅ Assignations" />
      <Tool href="/inventory" label="📦 Inventaire" />
      <Tool href="/file-storage" label="☁️ Stockage fichiers" />
    </div>}
  </div>
}

function Tool({ href, label }: { href: string; label: string }) {
  return <Link href={href} style={{ display: 'block', marginTop: 8, minHeight: 44, borderRadius: 12, padding: '12px 12px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.10)', color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: 14 }}>{label}</Link>
}
