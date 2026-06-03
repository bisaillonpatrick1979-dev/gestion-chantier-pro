'use client'

import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useClientStore } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useAccountingStore } from '@/store/useAccountingStore'
import { useInventoryStore } from '@/store/useInventoryStore'
import { buildFiveYearLocalDemo } from '@/lib/fiveYearLocalDemo'

const extraKeys = [
  'gestion-chantier-accounting-v1',
  'inventory-store-v1',
  'supplier-store-v1',
  'assignment-store-v1',
  'motivation-store-v1',
]

export default function DevTools() {
  const { employees, currentEmployeeId } = useEmployeeStore()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const current = employees.find(e => e.id === currentEmployeeId)
  const canSee = employees.length === 0 || current?.role === 'admin' || current?.role === 'accountant'
  if (!canSee) return null

  function injectFiveYears() {
    const ok = window.confirm('Injecter 5 ans de données de démonstration locales? Les données restent seulement dans ce navigateur.')
    if (!ok) return
    setBusy(true)
    const demo = buildFiveYearLocalDemo()
    useCompanyStore.getState().setCompany(demo.company as any)
    useEmployeeStore.setState(state => ({ ...state, employees: demo.employees, currentEmployeeId: 'demo-admin', activeSessions: {}, dayDetails: demo.dayDetails }))
    useClientStore.setState(state => ({ ...state, clients: demo.clients as any }))
    useDocumentStore.setState(state => ({ ...state, documents: demo.documents as any }))
    useAccountingStore.setState(state => ({ ...state, clientInvoices: demo.accounting.clientInvoices as any, payrollPayments: demo.accounting.payrollPayments as any, expenses: demo.accounting.expenses as any }))
    useInventoryStore.setState(state => ({ ...state, items: demo.inventory.items as any, movements: demo.inventory.movements as any }))
    setTimeout(() => window.location.reload(), 500)
  }

  function resetLocal() {
    const ok = window.confirm('Effacer les données locales de test dans ce navigateur?')
    if (!ok) return
    try {
      extraKeys.forEach(k => localStorage.removeItem(k))
      sessionStorage.clear()
    } catch {}
    setTimeout(() => window.location.href = '/', 300)
  }

  return <>
    <button onClick={() => setOpen(v => !v)} title="DevTools" style={{ position: 'fixed', left: 12, bottom: 148, zIndex: 9999, width: 48, height: 48, borderRadius: 999, border: '1px solid #60a5fa', background: 'linear-gradient(135deg,#0f172a,#1d4ed8)', color: 'white', fontSize: 22, boxShadow: '0 0 18px rgba(59,130,246,.65)', display: 'grid', placeItems: 'center' }}>🧪</button>
    {open && <div style={{ position: 'fixed', left: 10, bottom: 205, zIndex: 9999, width: 'min(320px, calc(100vw - 20px))', maxHeight: '70vh', overflowY: 'auto', borderRadius: 18, border: '1px solid #334155', background: '#0f172a', padding: 14, boxShadow: '0 12px 40px rgba(0,0,0,.75)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}><b style={{ color: 'white', fontSize: 16 }}>🧪 DevTools local</b><button onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', color: 'white', fontSize: 20 }}>×</button></div>
      <p style={{ marginTop: 8, color: '#86efac', fontSize: 13, lineHeight: 1.35 }}>Mode test local. La démo sert à remplir les statistiques, paies, dépenses, factures et inventaire pour vérifier l’application.</p>
      <button onClick={injectFiveYears} disabled={busy} style={{ marginTop: 12, width: '100%', minHeight: 52, borderRadius: 14, border: '1px solid #a78bfa', background: '#7c3aed', color: 'white', fontSize: 15, fontWeight: 900 }}>{busy ? 'Chargement...' : '🏗️ Injecter démo 5 ans locale'}</button>
      <button onClick={resetLocal} style={{ marginTop: 10, width: '100%', minHeight: 48, borderRadius: 14, border: '1px solid #991b1b', background: '#7f1d1d', color: '#fecaca', fontSize: 14, fontWeight: 900 }}>🗑️ Reset local seulement</button>
      <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 12 }}>PIN démo: 0000. Visible pour admin/comptable ou app vide.</p>
    </div>}
  </>
}
