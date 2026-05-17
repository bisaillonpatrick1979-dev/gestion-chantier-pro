'use client'
// src/app/comptabilite/page.tsx

import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useEmployeeInvoiceStore } from '@/store/useEmployeeInvoiceStore'
import type { EmployeeInvoiceStatus } from '@/store/useEmployeeInvoiceStore'
import { formatCurrency } from '@/lib/formatters'

const EMP_INV_STATUS: Record<EmployeeInvoiceStatus, { label: string; labelEn: string; color: string; emoji: string }> = {
  brouillon: { label: 'Brouillon', labelEn: 'Draft', color: '#64748b', emoji: '📝' },
  envoyee:   { label: 'Envoyée',   labelEn: 'Sent',  color: '#3b82f6', emoji: '📤' },
  payee:     { label: 'Payée',     labelEn: 'Paid',  color: '#22c55e', emoji: '✅' },
}

export default function ComptabilitePage() {
  const { theme, themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { documents } = useDocumentStore()
  const { employees, dayDetails } = useEmployeeStore()
  const { invoices: empInvoices, updateStatus } = useEmployeeInvoiceStore()

  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const cardClass  = isDeco ? 'deco-card-sweep' : isQuantum ? 'quantum-card-glow' : isAventure ? 'aventure-card-glow' : ''

  const now          = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  const currentYear  = now.getFullYear().toString()

  // ── Stats documents clients ─────────────────────────────────────────────
  // ✅ FIX : 'paid' au lieu de 'paye', 'sent' au lieu de 'envoye'
  const monthDocs     = documents.filter(d => d.createdAt?.startsWith(currentMonth))
  const monthRevenue  = monthDocs.filter(d => d.status === 'paid').reduce((s, d) => s + d.total, 0)
  const monthPending  = monthDocs.filter(d => d.status === 'sent').reduce((s, d) => s + (d.balanceDue ?? d.total), 0)
  const monthInvoices = monthDocs.filter(d => d.type === 'invoice').length
  const monthQuotes   = monthDocs.filter(d => d.type === 'quote').length
  const yearDocs      = documents.filter(d => d.createdAt?.startsWith(currentYear))
  const yearRevenue   = yearDocs.filter(d => d.status === 'paid').reduce((s, d) => s + d.total, 0)
  const yearPending   = yearDocs.filter(d => d.status === 'sent').reduce((s, d) => s + (d.balanceDue ?? d.total), 0)

  // ── Stats invoices employés ─────────────────────────────────────────────
  const empInvBrouillon  = empInvoices.filter(i => i.status === 'brouillon')
  const empInvEnvoyees   = empInvoices.filter(i => i.status === 'envoyee')
  const empInvPayees     = empInvoices.filter(i => i.status === 'payee')
  const totalSalaireDu   = empInvEnvoyees.reduce((s, i) => s + i.total, 0)
  const totalSalairePaye = empInvPayees.reduce((s, i) => s + i.total, 0)
  const totalSalaireTotal = [...empInvEnvoyees, ...empInvPayees].reduce((s, i) => s + i.total, 0)

  // ── Stats par statut docs ✅ FIX nouveaux statuts ───────────────────────
  const byStatus = {
    draft:   documents.filter(d => d.status === 'draft'),
    sent:    documents.filter(d => d.status === 'sent'),
    paid:    documents.filter(d => d.status === 'paid'),
    overdue: documents.filter(d => d.status === 'overdue'),
  }

  // ── Stats par employé ───────────────────────────────────────────────────
  const employeeStats = employees.map(emp => {
    const empDetails    = Object.entries(dayDetails).filter(([key]) => key.startsWith(emp.id)).map(([, d]) => d)
    const totalRevenue  = empDetails.reduce((s, d) => s + d.totalRevenue, 0)
    const totalHours    = empDetails.reduce((s, d) => s + d.totalHours, 0)
    const totalDays     = empDetails.length
    const empInvs       = empInvoices.filter(i => i.employeeId === emp.id)
    const totalFacture  = empInvs.reduce((s, i) => s + i.total, 0)
    return { emp, totalRevenue, totalHours, totalDays, totalFacture, invCount: empInvs.length }
  }).filter(s => s.totalRevenue > 0 || s.totalHours > 0)

  // ── Graphique 6 mois ✅ FIX statuts ────────────────────────────────────
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d        = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key      = d.toISOString().slice(0, 7)
    const label    = d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { month: 'short', year: '2-digit' })
    const revenue  = documents.filter(doc => doc.createdAt?.startsWith(key) && doc.status === 'paid').reduce((s, doc) => s + doc.total, 0)
    const pending  = documents.filter(doc => doc.createdAt?.startsWith(key) && doc.status === 'sent').reduce((s, doc) => s + (doc.balanceDue ?? doc.total), 0)
    const salaires = empInvoices.filter(inv => inv.createdAt?.startsWith(key) && inv.status === 'payee').reduce((s, inv) => s + inv.total, 0)
    return { key, label, revenue, pending, salaires }
  }).reverse()

  const maxRevenue = Math.max(...last6Months.map(m => m.revenue + m.pending), 1)

  // ✅ FIX nouveaux statuts pour affichage
  const STATUS_CONFIG_DOC = {
    draft:   { label: lang === 'fr' ? 'Brouillon' : 'Draft',   color: '#64748b', emoji: '📝' },
    sent:    { label: lang === 'fr' ? 'Envoyé' : 'Sent',       color: '#3b82f6', emoji: '📤' },
    paid:    { label: lang === 'fr' ? 'Payé' : 'Paid',         color: '#f59e0b', emoji: '💰' },
    overdue: { label: lang === 'fr' ? 'En retard' : 'Overdue', color: '#ef4444', emoji: '⚠️' },
  }

  const card: React.CSSProperties = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <h1 style={{ color: theme.colors.primary, fontSize: '14px', letterSpacing: '3px', fontWeight: 700 }}>
        📊 {lang === 'fr' ? 'COMPTABILITÉ' : 'ACCOUNTING'}
      </h1>

      {/* ── REVENUS CLIENT CE MOIS ─────────────────────────────────────────── */}
      <div className={cardClass} style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>
          📅 {lang === 'fr' ? 'REVENUS CLIENTS — CE MOIS' : 'CLIENT REVENUE — THIS MONTH'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: lang === 'fr' ? 'Encaissé' : 'Collected',       value: formatCurrency(monthRevenue), color: '#22c55e',               icon: '💰' },
            { label: lang === 'fr' ? 'En attente' : 'Pending',        value: formatCurrency(monthPending), color: '#f59e0b',               icon: '⏳' },
            { label: lang === 'fr' ? 'Factures créées' : 'Invoices',  value: `${monthInvoices}`,           color: theme.colors.primary,    icon: '📄' },
            { label: lang === 'fr' ? 'Devis envoyés' : 'Quotes sent', value: `${monthQuotes}`,             color: theme.colors.primaryLight ?? theme.colors.primary, icon: '📋' },
          ].map(item => (
            <div key={item.label} style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px' }}>
              <p style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</p>
              <p style={{ color: item.color, fontSize: '18px', fontWeight: 800 }}>{item.value}</p>
              <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginTop: '2px' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SALAIRES EMPLOYÉS ──────────────────────────────────────────────── */}
      <div className={cardClass} style={{ ...card, border: `1px solid ${theme.colors.primary}44` }}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>
          👷 {lang === 'fr' ? 'SALAIRES EMPLOYÉS — AUTONOMES' : 'EMPLOYEE WAGES — CONTRACTORS'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: lang === 'fr' ? 'Dû' : 'Owed',    value: formatCurrency(totalSalaireDu),    color: '#f59e0b', count: empInvEnvoyees.length },
            { label: lang === 'fr' ? 'Payé' : 'Paid',  value: formatCurrency(totalSalairePaye),  color: '#22c55e', count: empInvPayees.length   },
            { label: 'Total',                            value: formatCurrency(totalSalaireTotal), color: theme.colors.primary, count: empInvoices.length },
          ].map(s => (
            <div key={s.label} style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <p style={{ color: s.color, fontSize: '16px', fontWeight: 900, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginTop: '4px' }}>{s.label}</p>
              <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{s.count} inv.</p>
            </div>
          ))}
        </div>

        {empInvoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: theme.colors.textMuted, fontSize: '13px' }}>
            {lang === 'fr' ? '📄 Aucune invoice employé générée' : '📄 No employee invoice generated'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...empInvoices].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10).map(inv => {
              const sc = EMP_INV_STATUS[inv.status]
              return (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.colors.surface, borderRadius: '10px', padding: '12px', borderLeft: `3px solid ${sc.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: inv.employeeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
                      {inv.employeeInitials}
                    </div>
                    <div>
                      <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700 }}>{inv.number}</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                        {inv.employeeName} · {inv.periodStart} → {inv.periodEnd}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: theme.colors.primary, fontSize: '14px', fontWeight: 800 }}>{formatCurrency(inv.total)}</p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', justifyContent: 'flex-end' }}>
                      {inv.status !== 'payee' && (
                        <button
                          onClick={() => updateStatus(inv.id, inv.status === 'brouillon' ? 'envoyee' : 'payee')}
                          style={{ padding: '3px 8px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${sc.color}`, background: `${sc.color}15`, color: sc.color, fontSize: '10px', fontWeight: 700 }}
                        >
                          {inv.status === 'brouillon' ? `→ ${lang === 'fr' ? 'Envoyée' : 'Sent'}` : `→ ${lang === 'fr' ? 'Payée' : 'Paid'}`}
                        </button>
                      )}
                      <span style={{ fontSize: '10px', fontWeight: 700, color: sc.color }}>{sc.emoji} {lang === 'fr' ? sc.label : sc.labelEn}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {empInvoices.length > 10 && (
              <p style={{ color: theme.colors.textMuted, fontSize: '11px', textAlign: 'center' }}>
                +{empInvoices.length - 10} {lang === 'fr' ? 'autres invoices' : 'more invoices'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── ANNÉE EN COURS ─────────────────────────────────────────────────── */}
      <div className={cardClass} style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>
          📆 {lang === 'fr' ? `ANNÉE ${currentYear}` : `YEAR ${currentYear}`}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '💰', value: formatCurrency(yearRevenue),                                color: '#22c55e',           label: lang === 'fr' ? 'Total encaissé (clients)' : 'Total collected (clients)' },
            { icon: '⏳', value: formatCurrency(yearPending),                                color: '#f59e0b',           label: lang === 'fr' ? 'En attente (clients)' : 'Pending (clients)' },
            { icon: '👷', value: `-${formatCurrency(totalSalaireTotal)}`,                   color: '#ef4444',           label: lang === 'fr' ? 'Salaires (autonomes)' : 'Wages (contractors)' },
            { icon: '📊', value: formatCurrency(Math.max(0, yearRevenue - totalSalaireTotal)), color: theme.colors.primary, label: lang === 'fr' ? 'Marge brute' : 'Gross margin', highlight: true },
          ].map(item => (
            <div key={item.label} style={{ background: (item as any).highlight ? `${theme.colors.primary}18` : theme.colors.surface, border: (item as any).highlight ? `1px solid ${theme.colors.primary}44` : 'none', borderRadius: '10px', padding: '12px' }}>
              <p style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</p>
              <p style={{ color: item.color, fontSize: '18px', fontWeight: 800 }}>{item.value}</p>
              <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRAPHIQUE 6 MOIS ───────────────────────────────────────────────── */}
      <div className={cardClass} style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginBottom: '16px' }}>
          📈 {lang === 'fr' ? '6 DERNIERS MOIS' : 'LAST 6 MONTHS'}
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
          {last6Months.map(m => (
            <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'flex-end' }}>
                {m.pending  > 0 && <div style={{ width: '100%', height: `${(m.pending  / maxRevenue) * 80}px`, background: '#f59e0b', borderRadius: '4px 4px 0 0', minHeight: '4px' }} />}
                {m.revenue  > 0 && <div style={{ width: '100%', height: `${(m.revenue  / maxRevenue) * 80}px`, background: '#22c55e', borderRadius: m.pending > 0 ? '0' : '4px 4px 0 0', minHeight: '4px' }} />}
                {m.salaires > 0 && <div style={{ width: '100%', height: `${(m.salaires / maxRevenue) * 30}px`, background: '#ef444455', borderRadius: '0', minHeight: '2px' }} />}
                {m.revenue === 0 && m.pending === 0 && m.salaires === 0 && <div style={{ width: '100%', height: '4px', background: theme.colors.border, borderRadius: '4px' }} />}
              </div>
              <span style={{ color: theme.colors.textMuted, fontSize: '9px', textAlign: 'center' }}>{m.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { color: '#22c55e',   label: lang === 'fr' ? 'Encaissé' : 'Collected' },
            { color: '#f59e0b',   label: lang === 'fr' ? 'En attente' : 'Pending'  },
            { color: '#ef444455', label: lang === 'fr' ? 'Salaires' : 'Wages'      },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color }} />
              <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAR STATUT DOCUMENTS ───────────────────────────────────────────── */}
      <div className={cardClass} style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>
          📋 {lang === 'fr' ? 'DOCUMENTS PAR STATUT' : 'DOCUMENTS BY STATUS'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(Object.entries(byStatus) as [keyof typeof byStatus, typeof documents][]).map(([status, docs]) => {
            const config = STATUS_CONFIG_DOC[status]
            const total  = docs.reduce((s, d) => s + d.total, 0)
            return (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.colors.surface, borderRadius: '10px', padding: '12px', borderLeft: `3px solid ${config.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{config.emoji}</span>
                  <div>
                    <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700 }}>{config.label}</p>
                    <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{docs.length} {lang === 'fr' ? 'document(s)' : 'document(s)'}</p>
                  </div>
                </div>
                <p style={{ color: config.color, fontSize: '14px', fontWeight: 800 }}>{formatCurrency(total)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── PAR EMPLOYÉ ────────────────────────────────────────────────────── */}
      {employeeStats.length > 0 && (
        <div className={cardClass} style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>
            👥 {lang === 'fr' ? 'PAR EMPLOYÉ' : 'BY EMPLOYEE'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {employeeStats.map(({ emp, totalRevenue, totalHours, totalDays, totalFacture, invCount }) => (
              <div key={emp.id} style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', borderLeft: `3px solid ${emp.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: emp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>
                      {emp.name[0]}
                    </div>
                    <div>
                      <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700 }}>{emp.name}</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{totalHours.toFixed(1)}h · {totalDays} {lang === 'fr' ? 'jour(s)' : 'day(s)'}</p>
                    </div>
                  </div>
                  <p style={{ color: emp.color, fontSize: '14px', fontWeight: 800 }}>{formatCurrency(totalRevenue)}</p>
                </div>
                {invCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: `${emp.color}10`, borderRadius: '8px', border: `1px solid ${emp.color}30` }}>
                    <p style={{ fontSize: '11px', color: theme.colors.textMuted }}>🧾 {invCount} invoice{invCount !== 1 ? 's' : ''} autonome</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>-{formatCurrency(totalFacture)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TOUS LES DOCUMENTS ─────────────────────────────────────────────── */}
      <div className={cardClass} style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>
          🗂️ {lang === 'fr' ? 'TOUS LES DOCUMENTS' : 'ALL DOCUMENTS'}
        </p>
        {documents.length === 0 ? (
          <p style={{ color: theme.colors.textMuted, textAlign: 'center', fontSize: '14px', padding: '20px' }}>
            {lang === 'fr' ? 'Aucun document' : 'No documents'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...documents].reverse().map(doc => {
              const config = STATUS_CONFIG_DOC[doc.status as keyof typeof STATUS_CONFIG_DOC]
              return (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '8px' }}>
                  <div>
                    <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700 }}>
                      {doc.number || doc.id.slice(0, 8)}
                    </p>
                    {/* ✅ FIX : doc.clientName au lieu de doc.client.name */}
                    <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                      {doc.clientName || (lang === 'fr' ? 'Client non défini' : 'Client not defined')} · {doc.date}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: 700 }}>{formatCurrency(doc.total)}</p>
                    <span style={{ color: config?.color || theme.colors.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {config?.label || doc.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
