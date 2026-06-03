'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useMotivationStore } from '@/store/useMotivationStore'
import { useSupplierStore } from '@/store/useSupplierStore'
import { useAssignmentStore } from '@/store/useAssignmentStore'
import { useAccountingStore } from '@/store/useAccountingStore'
import { useInventoryStore } from '@/store/useInventoryStore'
import { useFileStorageStore } from '@/store/useFileStorageStore'
import { formatCurrency } from '@/lib/formatters'

export default function AdminHomeWorkspace() {
  const pathname = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const current = employees.find(e => e.id === currentEmployeeId)
  const isAdminWorkspace = pathname === '/' && (!!current && (current.role === 'admin' || current.role === 'accountant' || current.role === 'secretary'))
  const goals = useMotivationStore(s => s.goals)
  const suppliers = useSupplierStore(s => s.suppliers)
  const assignments = useAssignmentStore(s => s.assignments)
  const { clientInvoices, payrollPayments, expenses } = useAccountingStore()
  const inventoryItems = useInventoryStore(s => s.items)
  const fileRefs = useFileStorageStore(s => s.files)

  useEffect(() => {
    document.body.classList.toggle('admin-home-mode', isAdminWorkspace)
    return () => document.body.classList.remove('admin-home-mode')
  }, [isAdminWorkspace])

  if (!isAdminWorkspace) return null

  const activeGoals = goals.filter(g => g.status === 'active')
  const openAssignments = assignments.filter(a => a.status !== 'completed')
  const lowStock = inventoryItems.filter(i => i.quantity - i.reserved <= i.minQuantity)
  const activeSuppliers = suppliers.filter(s => s.active)
  const invoiced = clientInvoices.reduce((s, i) => s + i.amount + i.taxAmount, 0)
  const collected = clientInvoices.reduce((s, i) => s + i.paidAmount, 0)
  const payrollDue = payrollPayments.filter(p => p.status !== 'paid' && p.status !== 'refused').reduce((s, p) => s + p.amount, 0)
  const expenseTotal = expenses.reduce((s, e) => s + e.amount + e.taxAmount, 0)

  return <section style={{ maxWidth: 1180, margin: '12px auto 110px', padding: '0 16px' }}>
    <style>{`
      body.admin-home-mode main > div > .admin-hide-for-management { display:none!important; }
    `}</style>
    <div style={{ border: '1px solid var(--border)', background: 'var(--card)', borderRadius: 22, padding: 18 }}>
      <h1 style={{ color: 'var(--text)', fontSize: 30, fontWeight: 950, lineHeight: 1.05 }}>👑 Centre administration</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 6 }}>Accueil de gestion sans punch-in. Les employés et sous-traitants gardent leur interface terrain; l’administration utilise les modules de gestion.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 10, marginTop: 14 }}>
        <Metric title="Facturé" value={formatCurrency(invoiced)} sub={`Encaissé ${formatCurrency(collected)}`} />
        <Metric title="Paies dues" value={formatCurrency(payrollDue)} sub="À approuver / payer" />
        <Metric title="Dépenses" value={formatCurrency(expenseTotal)} sub="Matériaux et frais" />
        <Metric title="Bas stock" value={`${lowStock.length}`} sub="À recommander" danger={lowStock.length > 0} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10, marginTop: 14 }}>
        <Tool href="/calendar" title="📅 Calendrier" sub="Rendez-vous et journées" />
        <Tool href="/assignments" title="✅ Assignations" sub={`${openAssignments.length} ouverte(s)`} />
        <Tool href="/motivation" title="🏆 Motivation" sub={`${activeGoals.length} objectif(s) actif(s)`} />
        <Tool href="/suppliers" title="🏬 Fournisseurs" sub={`${activeSuppliers.length} enregistré(s)`} />
        <Tool href="/commandes" title="📦 Commandes / PO" sub="Créer et suivre les commandes" />
        <Tool href="/inventory" title="📦 Inventaire" sub={`${inventoryItems.length} item(s)`} />
        <Tool href="/paye" title="💵 Paies" sub="Contrôle admin des paies" />
        <Tool href="/accounting" title="📊 Comptabilité" sub="Marges, dépenses, revenus" />
        <Tool href="/file-storage" title="☁️ Stockage fichiers" sub={`${fileRefs.length} référence(s) hors DB`} />
        <Tool href="/stats" title="📈 Statistiques" sub="Compagnie et travailleurs" />
        <Tool href="/contracts" title="📄 Contrats / devis" sub="Documents clients" />
        <Tool href="/settings" title="⚙️ Réglages" sub="Configuration app" />
      </div>
      <div style={{ marginTop: 14, border: '1px solid rgba(34,197,94,.25)', background: 'rgba(34,197,94,.08)', borderRadius: 16, padding: 12 }}>
        <b style={{ color: 'var(--text)', fontSize: 16 }}>Accès vérifiés</b>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Motivation, Fournisseurs, Commandes/PO, Inventaire, Stockage fichiers et Statistiques sont accessibles depuis ce panneau même si un bouton flottant est déplacé ou caché.</p>
      </div>
    </div>
  </section>
}

function Metric({ title, value, sub, danger }: { title: string; value: string; sub: string; danger?: boolean }) {
  return <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 16, padding: 14 }}><p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 900 }}>{title}</p><p style={{ color: danger ? 'var(--warning)' : 'var(--primary)', fontSize: 26, fontWeight: 950, marginTop: 5, lineHeight: 1.05 }}>{value}</p><p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 5 }}>{sub}</p></div>
}

function Tool({ href, title, sub }: { href: string; title: string; sub: string }) {
  return <Link href={href} style={{ display: 'block', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 18, padding: 16, minHeight: 92, textDecoration: 'none' }}><b style={{ color: 'var(--text)', fontSize: 19 }}>{title}</b><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{sub}</p></Link>
}
