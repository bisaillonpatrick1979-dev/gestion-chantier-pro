'use client'

import { useState, useRef, useEffect } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useCatalogueStore } from '@/store/useCatalogueStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import type { EmployeeInvoice, InvoiceLineItem } from '@/store/useInvoiceStore'
import DocumentWatermark from '@/components/DocumentWatermark'

// ─── Utilitaires ─────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n ?? 0)
}
function today() { return new Date().toISOString().split('T')[0] }
function addDays(d: string, n: number) {
  const date = new Date(d); date.setDate(date.getDate() + n); return date.toISOString().split('T')[0]
}
function fmtDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const STATUS_LABELS = { brouillon: 'Brouillon', envoye: 'Envoyé', paye: 'Payé' }
const STATUS_COLORS = { brouillon: '#6B7280', envoye: '#3b82f6', paye: '#22c55e' }

// ─── Page principale ──────────────────────────────────────────────────────────
export default function InvoicePage() {
  const { employees, currentEmployeeId, dayDetails, getNextInvoiceNumber, incrementInvoiceSequence } = useEmployeeStore()
  const { company } = useCompanyStore()
  const { materials } = useCatalogueStore()
  const { themeId } = useThemeStore()
  const invoiceStore = useInvoiceStore()

  const currentEmployee = employees.find(e => e.id === currentEmployeeId) ?? null
  const isAdmin = currentEmployee?.role === 'admin'
  const isXP = themeId === 'xp'

  // Admin peut voir les factures de tous les employés
  const [selectedEmpId, setSelectedEmpId] = useState<string>(currentEmployeeId ?? '')
  const viewEmployee = employees.find(e => e.id === selectedEmpId) ?? currentEmployee

  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showCatalogue, setShowCatalogue] = useState(false)
  const [showPunchImport, setShowPunchImport] = useState(false)
  const [catSearch, setCatSearch] = useState('')
  const [toast, setToast] = useState('')
  const sigRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const myInvoices = invoiceStore.getEmployeeInvoices(selectedEmpId)
  const openInvoice = myInvoices.find(inv => inv.id === openInvoiceId) ?? null

  // Journées disponibles pour import (depuis punch in/out)
  const punchDays = Object.entries(dayDetails)
    .filter(([key]) => key.startsWith(selectedEmpId + '-'))
    .map(([key, detail]) => ({ key, detail, date: key.replace(selectedEmpId + '-', '') }))
    .sort((a, b) => b.date.localeCompare(a.date))

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800) }

  function createNewInvoice() {
    if (!viewEmployee) return
    const number = getNextInvoiceNumber(viewEmployee.id)
    const inv = invoiceStore.createInvoice(viewEmployee.id, viewEmployee.name, number)
    incrementInvoiceSequence(viewEmployee.id)
    setOpenInvoiceId(inv.id)
    showToast('✅ Nouvelle facture créée')
  }

  function upd(updates: Partial<EmployeeInvoice>) {
    if (!openInvoiceId) return
    invoiceStore.updateInvoice(openInvoiceId, updates)
  }

  function updLine(itemId: string, field: keyof InvoiceLineItem, value: string | number) {
    if (!openInvoiceId) return
    invoiceStore.updateLineItem(openInvoiceId, itemId, { [field]: value })
  }

  // Import d'une journée depuis punch in/out
  function importPunchDay(date: string) {
    if (!openInvoiceId || !viewEmployee) return
    const detail = dayDetails[`${selectedEmpId}-${date}`]
    if (!detail) return

    const hours = detail.totalHours
    const rate = viewEmployee.hourlyRate ?? 0
    const desc = `Travail — ${fmtDate(date)}${detail.notes ? ' — ' + detail.notes : ''}`

    invoiceStore.addLineItem(openInvoiceId, {
      description: desc,
      quantity: Math.round(hours * 100) / 100,
      unitPrice: rate,
      total: hours * rate,
      date,
      fromPunch: true,
    })
    showToast(`✅ ${fmtDate(date)} importé (${hours.toFixed(2)}h)`)
    setShowPunchImport(false)
  }

  // Ajout depuis catalogue
  function addFromCatalogue(mat: { name: string; price: number; unit?: string }) {
    if (!openInvoiceId) return
    invoiceStore.addLineItem(openInvoiceId, {
      description: mat.name,
      quantity: 1,
      unitPrice: mat.price,
      total: mat.price,
    })
    showToast(`✅ ${mat.name} ajouté`)
    setShowCatalogue(false)
    setCatSearch('')
  }

  // Signature
  const sigCtx = () => sigRef.current?.getContext('2d') ?? null
  const sigRect = () => sigRef.current?.getBoundingClientRect() ?? null

  function clearSig() {
    const ctx = sigCtx()
    if (ctx && sigRef.current) ctx.clearRect(0, 0, sigRef.current.width, sigRef.current.height)
  }

  // Email
  function handleEmail() {
    if (!openInvoice || !viewEmployee) return
    const subject = encodeURIComponent(`Facture ${openInvoice.number} — ${viewEmployee.name}`)
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint ma facture ${openInvoice.number} d'un montant de ${fmt(openInvoice.total)}.\n\n${viewEmployee.name}\n${company.phone || ''}`
    )
    window.open(`mailto:${openInvoice.clientEmail || ''}?subject=${subject}&body=${body}`)
    upd({ status: 'envoye' })
    showToast('📧 Email ouvert')
  }

  // Styles
  const pc = isXP ? '#a855f7' : 'var(--primary)'
  const cardStyle: React.CSSProperties = {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '16px', marginBottom: '12px',
    position: 'relative', overflow: 'hidden',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '10px 12px', color: 'var(--text)',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '10px', color: 'var(--text-muted)',
    fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px',
  }
  const btnPrimary: React.CSSProperties = {
    background: isXP ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'linear-gradient(135deg,var(--primary),var(--secondary,#B8963E))',
    color: isXP ? '#fff' : '#000', border: 'none', borderRadius: '10px',
    padding: '13px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', width: '100%',
  }

  // ── VUE LISTE ────────────────────────────────────────────────────────────────
  if (!openInvoice) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '100px' }}>
        {toast && <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 20px', color: 'var(--text)', fontSize: '14px', fontWeight: 600, zIndex: 999, whiteSpace: 'nowrap' }}>{toast}</div>}

        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: pc }}>
                🧾 Mes Factures
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {viewEmployee?.name} — {myInvoices.length} facture{myInvoices.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={createNewInvoice} style={{
              background: `linear-gradient(135deg, ${pc}, var(--secondary, #B8963E))`,
              color: isXP ? '#fff' : '#000', border: 'none', borderRadius: '10px',
              padding: '10px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: 800,
            }}>
              + Nouvelle
            </button>
          </div>

          {/* Sélecteur employé pour admin */}
          {isAdmin && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {employees.map(emp => (
                <button key={emp.id} onClick={() => setSelectedEmpId(emp.id)} style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: selectedEmpId === emp.id ? 700 : 400,
                  border: selectedEmpId === emp.id ? `2px solid ${pc}` : '1px solid var(--border)',
                  background: selectedEmpId === emp.id ? `${pc}20` : 'transparent',
                  color: selectedEmpId === emp.id ? pc : 'var(--text-muted)',
                }}>
                  {emp.name[0]} {emp.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '16px' }}>
          {myInvoices.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧾</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                Aucune facture
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Créez votre première facture — vos journées de travail s'importent automatiquement
              </div>
              <button onClick={createNewInvoice} style={btnPrimary}>
                + Créer ma première facture
              </button>
            </div>
          ) : (
            [...myInvoices].reverse().map(inv => (
              <div key={inv.id} onClick={() => setOpenInvoiceId(inv.id)}
                style={{ ...cardStyle, cursor: 'pointer', borderLeft: `4px solid ${STATUS_COLORS[inv.status]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: pc }}>{inv.number}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {fmtDate(inv.date)} · {inv.items.length} ligne{inv.items.length !== 1 ? 's' : ''}
                    </div>
                    {inv.clientName && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>👤 {inv.clientName}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: pc }}>{fmt(inv.total)}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: STATUS_COLORS[inv.status], marginTop: '4px',
                      background: STATUS_COLORS[inv.status] + '22', padding: '2px 8px', borderRadius: '10px' }}>
                      {STATUS_LABELS[inv.status]}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ── VUE DÉTAIL FACTURE ────────────────────────────────────────────────────────
  const catFiltered = materials.filter(m =>
    m.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '120px' }}>
      {toast && <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 20px', color: 'var(--text)', fontSize: '14px', fontWeight: 600, zIndex: 999, whiteSpace: 'nowrap' }}>{toast}</div>}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setOpenInvoiceId(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}>
          ← Retour
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: pc }}>{openInvoice.number}</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{openInvoice.employeeName}</div>
        </div>
        <button onClick={() => {
          const s = openInvoice.status
          const next = s === 'brouillon' ? 'envoye' : s === 'envoye' ? 'paye' : 'brouillon'
          upd({ status: next })
        }} style={{
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: STATUS_COLORS[openInvoice.status] + '22',
          color: STATUS_COLORS[openInvoice.status],
          border: '1px solid ' + STATUS_COLORS[openInvoice.status] + '44',
          cursor: 'pointer',
        }}>
          {STATUS_LABELS[openInvoice.status]} ▾
        </button>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── Info de base ── */}
        <div style={cardStyle}>
          <DocumentWatermark
            type="FACTURE"
            employeeName={openInvoice.employeeName}
            opacity={0.07}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: pc, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              📋 Informations
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={lbl}>Date</label>
                <input type="date" value={openInvoice.date} onChange={e => upd({ date: e.target.value })} style={inputStyle}/>
              </div>
              <div>
                <label style={lbl}>Échéance</label>
                <input type="date" value={openInvoice.dueDate} onChange={e => upd({ dueDate: e.target.value })} style={inputStyle}/>
              </div>
            </div>
          </div>
        </div>

        {/* ── Client / Payeur ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: '11px', color: pc, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            👤 Facturer à
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={lbl}>Nom</label>
            <input value={openInvoice.clientName} onChange={e => upd({ clientName: e.target.value })} placeholder="Hailite Xteriors" style={inputStyle}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={lbl}>Courriel</label>
              <input type="email" value={openInvoice.clientEmail} onChange={e => upd({ clientEmail: e.target.value })} placeholder="patron@compagnie.com" style={inputStyle}/>
            </div>
            <div>
              <label style={lbl}>Téléphone</label>
              <input type="tel" value={openInvoice.clientPhone} onChange={e => upd({ clientPhone: e.target.value })} placeholder="780-555-0000" style={inputStyle}/>
            </div>
          </div>
        </div>

        {/* ── Articles / Lignes ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: pc, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🔧 Articles & Heures
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setShowPunchImport(!showPunchImport)} style={{
                padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                background: '#22c55e18', border: '1px solid #22c55e44', color: '#22c55e',
                fontSize: '11px', fontWeight: 700,
              }}>
                ⏱ Punch
              </button>
              <button onClick={() => setShowCatalogue(!showCatalogue)} style={{
                padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                background: `${pc}18`, border: `1px solid ${pc}44`, color: pc,
                fontSize: '11px', fontWeight: 700,
              }}>
                📦 Catalogue
              </button>
            </div>
          </div>

          {/* Import depuis punch in/out */}
          {showPunchImport && (
            <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '12px', marginBottom: '12px', border: '1px solid #22c55e44' }}>
              <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase' }}>
                ⏱ Importer une journée de travail
              </div>
              {punchDays.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  Aucune journée enregistrée
                </p>
              ) : punchDays.map(({ date, detail }) => (
                <button key={date} onClick={() => importPunchDay(date)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 12px', color: 'var(--text)',
                  cursor: 'pointer', marginBottom: '6px', textAlign: 'left',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{fmtDate(date)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {detail.totalHours.toFixed(2)}h · {fmt(detail.totalRevenue)}
                    </div>
                  </div>
                  <span style={{ color: '#22c55e', fontSize: '18px' }}>+</span>
                </button>
              ))}
            </div>
          )}

          {/* Recherche catalogue */}
          {showCatalogue && (
            <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '12px', marginBottom: '12px', border: `1px solid ${pc}44` }}>
              <input
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                placeholder="🔍 Rechercher dans le catalogue..."
                style={{ ...inputStyle, marginBottom: '8px' }}
              />
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {catFiltered.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Aucun résultat</p>
                ) : catFiltered.map(mat => (
                  <button key={mat.id} onClick={() => addFromCatalogue(mat)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--border)', padding: '8px 4px',
                    color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{ fontSize: '13px' }}>{mat.emoji} {mat.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fmt(mat.price)}/{mat.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lignes */}
          {openInvoice.items.map((item, idx) => (
            <div key={item.id} style={{ background: 'var(--surface)', borderRadius: '10px', padding: '12px', marginBottom: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Ligne {idx + 1}{item.fromPunch ? ' ⏱' : ''}
                  {item.date ? ` · ${fmtDate(item.date)}` : ''}
                </span>
                {openInvoice.items.length > 1 && (
                  <button onClick={() => invoiceStore.removeLineItem(openInvoice.id, item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', fontSize: '18px' }}>
                    ✕
                  </button>
                )}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={lbl}>Description</label>
                <input value={item.description} onChange={e => updLine(item.id, 'description', e.target.value)}
                  placeholder="Description du travail ou matériau..." style={inputStyle}/>
              </div>
              {item.address !== undefined && (
                <div style={{ marginBottom: '8px' }}>
                  <label style={lbl}>Adresse du chantier</label>
                  <input value={item.address || ''} onChange={e => updLine(item.id, 'address', e.target.value)}
                    placeholder="123 rue Exemple, Calgary" style={inputStyle}/>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={lbl}>Qté / Heures</label>
                  <input type="number" value={item.quantity} min="0" step="0.25"
                    onChange={e => updLine(item.id, 'quantity', Number(e.target.value))} style={inputStyle}/>
                </div>
                <div>
                  <label style={lbl}>Prix unit.</label>
                  <input type="number" value={item.unitPrice} min="0" step="0.01"
                    onChange={e => updLine(item.id, 'unitPrice', Number(e.target.value))} style={inputStyle}/>
                </div>
                <div>
                  <label style={lbl}>Total</label>
                  <input value={fmt(item.total)} readOnly style={{ ...inputStyle, opacity: 0.6 }}/>
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => invoiceStore.addLineItem(openInvoice.id)} style={{
            width: '100%', padding: '12px', background: 'transparent',
            border: '2px dashed var(--border)', borderRadius: '10px',
            color: pc, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
          }}>
            + Ajouter une ligne
          </button>
        </div>

        {/* ── Totaux ── */}
        <div style={cardStyle}>
          <DocumentWatermark type="FACTURE" employeeName={openInvoice.employeeName} opacity={0.05}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: pc, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              💰 Totaux
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Dépôt reçu ($)</label>
              <input type="number" value={openInvoice.deposit} min="0" step="0.01"
                onChange={e => { upd({ deposit: Number(e.target.value) }); invoiceStore.calculateTotals(openInvoice.id) }}
                style={inputStyle}/>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>Sous-total</span><span>{fmt(openInvoice.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>GST (5%)</span><span>{fmt(openInvoice.gstAmount)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 800, color: pc, marginBottom: '10px' }}>
                  <span>TOTAL</span><span>{fmt(openInvoice.total)}</span>
                </div>
                {openInvoice.deposit > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#3b82f6', marginBottom: '6px' }}>
                      <span>Dépôt</span><span>−{fmt(openInvoice.deposit)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>
                      <span>Solde dû</span><span>{fmt(openInvoice.balanceDue)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: '11px', color: pc, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            📝 Notes
          </div>
          <textarea value={openInvoice.notes} onChange={e => upd({ notes: e.target.value })}
            rows={3} placeholder="Merci pour la confiance..." style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}/>
        </div>

        {/* ── Signature tactile ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: '11px', color: pc, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            ✍️ Signature
          </div>
          <canvas ref={sigRef} width={320} height={110}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', touchAction: 'none', display: 'block', width: '100%' }}
            onMouseDown={() => { setIsDrawing(true); sigCtx()?.beginPath() }}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            onMouseMove={e => {
              if (!isDrawing) return
              const ctx = sigCtx(); const r = sigRect(); if (!ctx || !r) return
              const sx = (sigRef.current?.width ?? 320) / r.width
              const sy = (sigRef.current?.height ?? 110) / r.height
              ctx.strokeStyle = pc; ctx.lineWidth = 2; ctx.lineCap = 'round'
              ctx.lineTo((e.clientX - r.left) * sx, (e.clientY - r.top) * sy)
              ctx.stroke(); ctx.beginPath()
              ctx.moveTo((e.clientX - r.left) * sx, (e.clientY - r.top) * sy)
            }}
            onTouchStart={e => { e.preventDefault(); setIsDrawing(true); sigCtx()?.beginPath() }}
            onTouchEnd={() => setIsDrawing(false)}
            onTouchMove={e => {
              e.preventDefault()
              if (!isDrawing) return
              const ctx = sigCtx(); const r = sigRect(); if (!ctx || !r) return
              const t = e.touches[0]
              const sx = (sigRef.current?.width ?? 320) / r.width
              const sy = (sigRef.current?.height ?? 110) / r.height
              ctx.strokeStyle = pc; ctx.lineWidth = 2; ctx.lineCap = 'round'
              ctx.lineTo((t.clientX - r.left) * sx, (t.clientY - r.top) * sy)
              ctx.stroke(); ctx.beginPath()
              ctx.moveTo((t.clientX - r.left) * sx, (t.clientY - r.top) * sy)
            }}
          />
          <button onClick={clearSig} style={{ marginTop: '8px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>
            🗑️ Effacer
          </button>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button style={btnPrimary} onClick={() => { showToast('✅ Facture sauvegardée!') }}>
            💾 Sauvegarder
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={handleEmail} style={{ padding: '13px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #3b82f644', background: '#3b82f608', color: '#3b82f6', fontWeight: 700, fontSize: '14px' }}>
              📧 Email
            </button>
            <button onClick={() => setShowPreview(true)} style={{ padding: '13px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${pc}44`, background: `${pc}08`, color: pc, fontWeight: 700, fontSize: '14px' }}>
              👁️ Aperçu
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => window.print()} style={{ padding: '13px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #f59e0b44', background: '#f59e0b08', color: '#f59e0b', fontWeight: 700, fontSize: '14px' }}>
              🖨️ PDF
            </button>
            <button onClick={() => { if (confirm('Supprimer cette facture?')) { invoiceStore.deleteInvoice(openInvoice.id); setOpenInvoiceId(null) } }}
              style={{ padding: '13px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #ef444444', background: '#ef444408', color: '#ef4444', fontWeight: 600, fontSize: '13px' }}>
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* ── APERÇU PDF ───────────────────────────────────────────────────────── */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, overflowY: 'auto' }}
          onClick={() => setShowPreview(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', color: '#111', margin: '20px auto', maxWidth: '600px',
            borderRadius: '12px', padding: '32px', position: 'relative', overflow: 'hidden',
          }}>

            {/* Filigrane : NOM EMPLOYÉ + FACTURE */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(-22deg)',
              pointerEvents: 'none', zIndex: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px',
              opacity: 0.15, userSelect: 'none', textAlign: 'center',
            }}>
              <div style={{ fontSize: '52px', fontWeight: 900, color: '#000', letterSpacing: '2px', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                {openInvoice.employeeName.toUpperCase()}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#000', letterSpacing: '14px', textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: '4px' }}>
                FACTURE
              </div>
            </div>

            {/* Contenu */}
            <div style={{ position: 'relative', zIndex: 1 }}>

              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  {/* Logo compagnie petit */}
                  {company.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt="" style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '8px', display: 'block' }}/>
                  )}
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{company.name}</div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{company.phone}</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{company.email}</div>
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{openInvoice.employeeName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Employé / Sous-traitant</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase' }}>FACTURE</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{openInvoice.number}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Date: {openInvoice.date}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Échéance: {openInvoice.dueDate}</div>
                </div>
              </div>

              {/* Facturer à */}
              {openInvoice.clientName && (
                <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Facturer à</div>
                  <div style={{ fontWeight: 700 }}>{openInvoice.clientName}</div>
                  {openInvoice.clientEmail && <div style={{ fontSize: '12px', color: '#555' }}>{openInvoice.clientEmail}</div>}
                  {openInvoice.clientPhone && <div style={{ fontSize: '12px', color: '#555' }}>{openInvoice.clientPhone}</div>}
                </div>
              )}

              {/* Tableau articles */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'rgba(17,17,17,0.85)', color: '#fff' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px' }}>Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>Qté</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px' }}>Prix unit.</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {openInvoice.items.map((item, i) => (
                    <tr key={item.id} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                        {item.description || '—'}
                        {item.address && <div style={{ fontSize: '11px', color: '#888' }}>📍 {item.address}</div>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px' }}>{fmt(item.unitPrice)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div style={{ marginLeft: 'auto', maxWidth: '240px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: '#666' }}>Sous-total</span><span>{fmt(openInvoice.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#666' }}>
                  <span>GST (5%)</span><span>{fmt(openInvoice.gstAmount)}</span>
                </div>
                <div style={{ borderTop: '2px solid #111', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800 }}>
                  <span>TOTAL</span><span style={{ color: '#f59e0b' }}>{fmt(openInvoice.total)}</span>
                </div>
                {openInvoice.deposit > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: '#3b82f6' }}>
                      <span>Dépôt</span><span>−{fmt(openInvoice.deposit)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '15px', fontWeight: 700, color: '#ef4444' }}>
                      <span>Solde dû</span><span>{fmt(openInvoice.balanceDue)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Infos paiement compagnie */}
              {(company.etransferEmail || company.bankName) && (
                <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(59,130,246,0.06)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '6px' }}>Paiement</div>
                  {company.etransferEmail && <div style={{ fontSize: '13px' }}>Interac: <strong>{company.etransferEmail}</strong></div>}
                  {company.bankName && <div style={{ fontSize: '13px' }}>{company.bankName}{company.bankAccount && ' — ' + company.bankAccount}</div>}
                </div>
              )}

              {openInvoice.notes && (
                <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>Notes</div>
                  <div style={{ fontSize: '13px' }}>{openInvoice.notes}</div>
                </div>
              )}

              {/* Zone signature */}
              <div style={{ borderTop: '2px solid #111', paddingTop: '10px', marginTop: '24px' }}>
                <div style={{ height: '60px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', marginBottom: '8px' }}/>
                <div style={{ fontSize: '11px', color: '#888' }}>{openInvoice.employeeName}</div>
              </div>

              {/* Boutons */}
              <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowPreview(false)} style={{ flex: 1, padding: '12px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                  ✕ Fermer
                </button>
                <button onClick={() => window.print()} style={{ flex: 1, padding: '12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                  🖨️ Imprimer / PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
