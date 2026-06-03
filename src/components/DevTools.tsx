'use client'
// src/components/DevTools.tsx

import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useClientStore } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useEmployeeInvoiceStore } from '@/store/useEmployeeInvoiceStore'
import { useCommandeStore } from '@/store/useCommandeStore'
import { useAccountingStore } from '@/store/useAccountingStore'
import { useInventoryStore } from '@/store/useInventoryStore'
import type { EmployeeInvoice } from '@/store/useEmployeeInvoiceStore'
import type { Commande } from '@/store/useCommandeStore'
import { buildFiveYearLocalDemo } from '@/lib/fiveYearLocalDemo'
import {
  SEED_EMPLOYEES, SEED_COMPANY, SEED_CLIENTS, SEED_DOCUMENTS,
  SEED_DAY_DETAILS, SEED_EMPLOYEE_INVOICES, SEED_COMMANDES,
  ALL_STORE_KEYS,
} from '@/lib/seedData'

const CATEGORIES = [
  { key: 'company',   emoji: '🏢', label: 'Compagnie',            desc: 'Hailite Xteriors — Patrick Bisaillon' },
  { key: 'employees', emoji: '👥', label: 'Employés (7)',          desc: '1 admin · 3 contracteurs · 3 salariés' },
  { key: 'clients',   emoji: '👤', label: 'Clients (3)',           desc: 'Martin Côté, Jennifer Walsh, Robert Chen' },
  { key: 'documents', emoji: '📄', label: 'Documents (5)',         desc: '3 factures · 1 devis · 1 contrat' },
  { key: 'punch',     emoji: '⏱️', label: 'Punch data (30j-emp)', desc: '10 jours × 3 contracteurs — heures réalistes' },
  { key: 'invoices',  emoji: '🧾', label: 'Invoices contracteurs', desc: '2 invoices × 3 contracteurs — sem. 1+2' },
  { key: 'commandes', emoji: '📦', label: 'Commandes PO (3)',      desc: 'Reçue · Envoyée · Brouillon' },
] as const

type CategoryKey = typeof CATEGORIES[number]['key']
type Selection = Record<CategoryKey, boolean>

const DEVTOOLS_ENABLED =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true'

export default function DevTools() {
  if (!DEVTOOLS_ENABLED) return null
  return <DevToolsPanel />
}

function DevToolsPanel() {
  const { currentEmployeeId, employees } = useEmployeeStore()
  const [open, setOpen]     = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'reset'>('idle')
  const [sel, setSel]       = useState<Selection>({
    company: true, employees: true, clients: true, documents: true,
    punch: true, invoices: true, commandes: true,
  })

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isEmpty         = employees.length === 0

  if (!isEmpty && currentEmployee?.role !== 'admin') return null

  const toggleAll = (val: boolean) =>
    setSel({ company: val, employees: val, clients: val, documents: val, punch: val, invoices: val, commandes: val })

  const noneSelected = Object.values(sel).every(v => !v)

  const handleLoad = () => {
    if (noneSelected) return
    setStatus('loading')

    if (sel.company) useCompanyStore.getState().setCompany(SEED_COMPANY)
    if (sel.employees) {
      useEmployeeStore.setState(state => ({ ...state, employees: SEED_EMPLOYEES, currentEmployeeId: 'seed-admin-001' }))
    }
    if (sel.punch) {
      useEmployeeStore.setState(state => ({ ...state, dayDetails: { ...state.dayDetails, ...SEED_DAY_DETAILS } }))
    }
    if (sel.clients) useClientStore.setState(state => ({ ...state, clients: SEED_CLIENTS }))
    if (sel.documents) useDocumentStore.setState(state => ({ ...state, documents: SEED_DOCUMENTS }))
    if (sel.invoices) {
      useEmployeeInvoiceStore.setState(state => ({ ...state, invoices: SEED_EMPLOYEE_INVOICES as unknown as EmployeeInvoice[] }))
    }
    if (sel.commandes) {
      useCommandeStore.setState(state => ({ ...state, commandes: SEED_COMMANDES as unknown as Commande[], nextNumber: SEED_COMMANDES.length + 1 }))
    }

    setStatus('loaded')
    setTimeout(() => { setOpen(false); setStatus('idle'); window.location.reload() }, 1200)
  }

  const handleFiveYearLocalDemo = () => {
    const ok = window.confirm('Injecter 5 ans de données de démonstration LOCALES SEULEMENT?\n\nAucun appel Supabase ne sera fait par ce bouton. Les données restent dans le navigateur/localStorage pour tester les statistiques, paies, dépenses, factures et inventaire.')
    if (!ok) return
    setStatus('loading')
    const demo = buildFiveYearLocalDemo()
    useCompanyStore.getState().setCompany(demo.company as any)
    useEmployeeStore.setState(state => ({ ...state, employees: demo.employees, currentEmployeeId: 'demo-admin', activeSessions: {}, dayDetails: demo.dayDetails }))
    useClientStore.setState(state => ({ ...state, clients: demo.clients as any }))
    useDocumentStore.setState(state => ({ ...state, documents: demo.documents as any }))
    useAccountingStore.setState(state => ({ ...state, clientInvoices: demo.accounting.clientInvoices as any, payrollPayments: demo.accounting.payrollPayments as any, expenses: demo.accounting.expenses as any }))
    useInventoryStore.setState(state => ({ ...state, items: demo.inventory.items as any, movements: demo.inventory.movements as any }))
    setStatus('loaded')
    setTimeout(() => { setOpen(false); setStatus('idle'); window.location.reload() }, 1200)
  }

  const handleReset = async () => {
    const ok = window.confirm('⚠️ Effacer les données LOCALES seulement?\n\nÇa efface localStorage/sessionStorage dans ce navigateur.\n\nSupabase ne sera PAS effacé par DevTools.')
    if (!ok) return
    ALL_STORE_KEYS.forEach(key => localStorage.removeItem(key))
    localStorage.removeItem('gestion-chantier-accounting-v1')
    localStorage.removeItem('inventory-store-v1')
    sessionStorage.clear()
    setStatus('reset')
    setTimeout(() => window.location.reload(), 400)
  }

  const loadBg = status === 'loaded' ? '#22c55e' : status === 'loading' ? '#1d4ed8' : noneSelected ? '#374151' : '#2563eb'

  return <>
    <button onClick={() => setOpen(o => !o)} title="Dev Tools" style={{ position: 'fixed', bottom: '90px', left: '10px', zIndex: 500, width: '34px', height: '34px', borderRadius: '50%', background: isEmpty ? '#1e3a5f' : '#111827', border: `1px solid ${isEmpty ? '#3b82f6' : '#374151'}`, color: isEmpty ? '#60a5fa' : '#6b7280', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>🧪</button>
    {open && <div style={{ position: 'fixed', bottom: '132px', left: '10px', zIndex: 500, background: '#111827', border: '1px solid #374151', borderRadius: '18px', padding: '14px', width: '268px', boxShadow: '0 8px 40px rgba(0,0,0,0.8)', fontFamily: 'system-ui, sans-serif', maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><p style={{ color: '#6b7280', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>🧪 Dev Tools</p><button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '14px', cursor: 'pointer' }}>✕</button></div>
      <div style={{ padding: '7px 10px', background: '#064e3b', border: '1px solid #10b98155', borderRadius: '10px', marginBottom: '10px' }}><p style={{ color: '#a7f3d0', fontSize: '10px', fontWeight: 800 }}>LOCAL ONLY</p><p style={{ color: '#6ee7b7', fontSize: '9px', lineHeight: 1.35 }}>DevTools ne pousse pas les données démo vers Supabase.</p></div>
      <div style={{ padding: '6px 10px', background: '#0f172a', borderRadius: '8px', textAlign: 'center', marginBottom: '10px' }}><span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 800, letterSpacing: '6px' }}>0000</span><span style={{ color: '#374151', fontSize: '9px', marginLeft: '6px' }}>PIN tous</span></div>
      <button onClick={handleFiveYearLocalDemo} disabled={status === 'loading'} style={{ width: '100%', padding: '12px', borderRadius: '11px', background: '#7c3aed', border: '1px solid #a78bfa', color: 'white', fontSize: '13px', fontWeight: 900, cursor: 'pointer', marginBottom: '10px' }}>🏗️ Injecter démo 5 ans locale</button>
      <p style={{ color: '#4b5563', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Données rapides à charger</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>{CATEGORIES.map(cat => <label key={cat.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '7px 9px', borderRadius: '9px', cursor: 'pointer', background: sel[cat.key] ? '#1e3a5f' : '#1f2937', border: `1px solid ${sel[cat.key] ? '#3b82f6' : '#374151'}` }}><input type="checkbox" checked={sel[cat.key]} onChange={e => setSel(s => ({ ...s, [cat.key]: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#3b82f6', cursor: 'pointer', flexShrink: 0 }} /><div style={{ flex: 1, minWidth: 0 }}><p style={{ color: sel[cat.key] ? '#e2e8f0' : '#6b7280', fontSize: '11px', fontWeight: 700 }}>{cat.emoji} {cat.label}</p><p style={{ color: '#4b5563', fontSize: '9px', marginTop: '1px', lineHeight: 1.3 }}>{cat.desc}</p></div></label>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}><button onClick={() => toggleAll(true)} style={{ padding: '6px', borderRadius: '7px', cursor: 'pointer', background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', fontSize: '10px', fontWeight: 700 }}>☑ Tout</button><button onClick={() => toggleAll(false)} style={{ padding: '6px', borderRadius: '7px', cursor: 'pointer', background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', fontSize: '10px', fontWeight: 700 }}>☐ Rien</button></div>
      <button onClick={handleLoad} disabled={noneSelected || status === 'loading'} style={{ width: '100%', padding: '12px', borderRadius: '11px', background: loadBg, border: 'none', color: 'white', fontSize: '13px', fontWeight: 800, cursor: noneSelected ? 'not-allowed' : 'pointer', marginBottom: '8px', opacity: noneSelected ? 0.5 : 1 }}>{status === 'loaded' ? '✅ Chargé — rechargement...' : status === 'loading' ? '⏳ Chargement...' : '📦 Charger sélection'}</button>
      <div style={{ borderTop: '1px solid #1f2937', margin: '8px 0' }} />
      <button onClick={handleReset} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>🗑️ Reset local seulement</button>
      <p style={{ color: '#1f2937', fontSize: '9px', textAlign: 'center', marginTop: '6px' }}>{isEmpty ? '⚠️ App vide' : '👑 Admin only'}</p>
    </div>}
  </>
}
