'use client'
// src/components/DevTools.tsx
// Bouton flottant admin uniquement — charger données démo ou tout réinitialiser

import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useClientStore } from '@/store/useClientStore'
import { SEED_EMPLOYEES, SEED_COMPANY, SEED_CLIENTS, ALL_STORE_KEYS } from '@/lib/seedData'

export default function DevTools() {
  const { currentEmployeeId, employees } = useEmployeeStore()
  const [open, setOpen]     = useState(false)
  const [status, setStatus] = useState<'idle' | 'loaded' | 'reset'>('idle')

  // Visible admin seulement
  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  if (currentEmployee?.role !== 'admin') return null

  // ── Charger les données démo ─────────────────────────────────────────
  const handleLoad = () => {
    // 1. Compagnie
    useCompanyStore.getState().setCompany(SEED_COMPANY)

    // 2. Employés — setState préserve les méthodes du store
    useEmployeeStore.setState(state => ({
      ...state,
      employees: SEED_EMPLOYEES,
      currentEmployeeId: 'seed-admin-001',
    }))

    // 3. Clients
    useClientStore.setState(state => ({
      ...state,
      clients: SEED_CLIENTS,
    }))

    setStatus('loaded')
    setTimeout(() => {
      setOpen(false)
      setStatus('idle')
      window.location.reload()
    }, 1200)
  }

  // ── Réinitialiser tout ───────────────────────────────────────────────
  const handleReset = () => {
    const ok = window.confirm(
      '⚠️ Effacer TOUTES les données?\n\nEmployés, clients, documents, compagnie...\n\nCette action est irréversible.'
    )
    if (!ok) return
    ALL_STORE_KEYS.forEach(key => localStorage.removeItem(key))
    setStatus('reset')
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <>
      {/* ── Bouton flottant 🧪 ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Dev Tools"
        style={{
          position: 'fixed',
          bottom: '90px',
          left: '10px',
          zIndex: 500,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: '#111827',
          border: '1px solid #374151',
          color: '#6b7280',
          fontSize: '15px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}>
        🧪
      </button>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '132px',
          left: '10px',
          zIndex: 500,
          background: '#111827',
          border: '1px solid #374151',
          borderRadius: '18px',
          padding: '16px',
          width: '210px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          fontFamily: 'system-ui, sans-serif',
        }}>

          {/* Titre */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              🧪 Dev Tools
            </p>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '14px', cursor: 'pointer', padding: '0 2px' }}>
              ✕
            </button>
          </div>

          {/* Recap données */}
          <div style={{ background: '#1f2937', borderRadius: '10px', padding: '10px', marginBottom: '12px' }}>
            <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.7 }}>
              👑 <span style={{ color: '#D6B25E' }}>Patrick Bisaillon</span><br />
              📋 Jean-François Roy <span style={{ color: '#6b7280' }}>38$/h</span><br />
              📋 Marc Leblanc <span style={{ color: '#6b7280' }}>35$/h</span><br />
              📋 Kevin Tremblay <span style={{ color: '#6b7280' }}>32$/h</span><br />
              💼 Sophie Gagnon <span style={{ color: '#6b7280' }}>28$/h</span><br />
              💼 Luc Fortin <span style={{ color: '#6b7280' }}>30$/h</span><br />
              💼 David Martin <span style={{ color: '#6b7280' }}>26$/h</span><br />
              👥 3 clients Calgary<br />
              🏢 Hailite Xteriors
            </p>
            <div style={{ marginTop: '8px', padding: '6px 8px', background: '#0f172a', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: 800, letterSpacing: '4px' }}>
                PIN : 0000
              </p>
              <p style={{ color: '#4b5563', fontSize: '9px', marginTop: '1px' }}>pour tous les employés</p>
            </div>
          </div>

          {/* Bouton Charger */}
          <button
            onClick={handleLoad}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '11px',
              background: status === 'loaded' ? '#22c55e' : '#2563eb',
              border: 'none',
              color: 'white',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              marginBottom: '8px',
              transition: 'background 0.2s',
            }}>
            {status === 'loaded' ? '✅ Données chargées !' : '📦 Charger données démo'}
          </button>

          {/* Séparateur */}
          <div style={{ borderTop: '1px solid #1f2937', margin: '10px 0' }} />

          {/* Bouton Reset */}
          <button
            onClick={handleReset}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '11px',
              background: status === 'reset' ? '#6b7280' : '#7f1d1d',
              border: `1px solid ${status === 'reset' ? '#374151' : '#991b1b'}`,
              color: status === 'reset' ? '#d1d5db' : '#fca5a5',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            {status === 'reset' ? '🔄 Rechargement...' : '🗑️ Réinitialiser tout'}
          </button>

          <p style={{ color: '#374151', fontSize: '9px', textAlign: 'center', marginTop: '8px' }}>
            Ce bouton est visible admin seulement
          </p>
        </div>
      )}
    </>
  )
}

