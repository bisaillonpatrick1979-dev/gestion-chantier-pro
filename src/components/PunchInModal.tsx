'use client'

import { useState, useMemo } from 'react'
import { useProjectStore } from '@/store/useProjectStore'
import { useClientStore } from '@/store/useClientStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useCatalogueStore } from '@/store/useCatalogueStore'

interface Props {
  employeeId: string
  employeeName: string
  employeeHourlyRate: number
  mode: 'in' | 'out'
  onComplete: () => void
  onCancel: () => void
}

type PayMode = 'hourly' | 'sqft' | 'job'

interface SqftEntry {
  id: string
  materialName: string
  materialId: string
  sqft: number
  ratePerSqft: number
  total: number
}

type ChantierSource = 'recent' | 'project' | 'client' | 'new'

const uid = () => Math.random().toString(36).slice(2, 10)
const fmt = (n: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n ?? 0)
const fmtH = (sec: number) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${h}h${m.toString().padStart(2, '0')}`
}
const fmtHours = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h${mm.toString().padStart(2, '0')}`
}

// Styles
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(0,0,0,0.90)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '16px 16px 80px',
}
const modal: React.CSSProperties = {
  width: '100%', maxWidth: '480px',
  background: 'var(--surface,#111)',
  border: '1px solid var(--border,#222)',
  borderRadius: '20px',
  display: 'flex', flexDirection: 'column',
  maxHeight: 'calc(100dvh - 100px)',
  overflow: 'hidden',
}
const inp: React.CSSProperties = {
  width: '100%', background: 'var(--card,#1a1a1a)',
  border: '1px solid var(--border,#333)', borderRadius: '10px',
  padding: '12px 14px', color: 'var(--text,#fff)',
  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 800,
  letterSpacing: '1.5px', textTransform: 'uppercase',
  color: 'var(--text-muted,#888)', marginBottom: '8px',
}

export default function PunchInModal({
  employeeId, employeeName, employeeHourlyRate,
  mode, onComplete, onCancel,
}: Props) {
  const { projects, getActiveLogForEmployee, punchInVirtual, punchOut } = useProjectStore()
  const { clients } = useClientStore()
  const { employees, activeSessions, dayDetails, getNextInvoiceNumber, incrementInvoiceSequence } = useEmployeeStore()
  const invoiceStore = useInvoiceStore()
  const { materials: catalogue } = useCatalogueStore()

  const emp = employees.find(e => e.id === employeeId)
  const activeEntry = getActiveLogForEmployee(employeeId)
  const activeSession = activeSessions[employeeId]

  // ── Punch In state ─────────────────────────────────────────────────────────
  const [source, setSource] = useState<ChantierSource>('recent')
  const [chantier, setChantier] = useState('')
  const [showNewInput, setShowNewInput] = useState(false)
  const [payMode, setPayMode] = useState<PayMode>(
    emp?.workMode === 'surface' ? 'sqft' : emp?.workMode === 'forfait' ? 'job' : 'hourly'
  )
  const [customRate, setCustomRate] = useState(String(employeeHourlyRate))
  const [jobAmount, setJobAmount] = useState('')

  // ── Punch Out pi² state ────────────────────────────────────────────────────
  const [sqftEntries, setSqftEntries] = useState<SqftEntry[]>([
    { id: uid(), materialName: '', materialId: '', sqft: 0, ratePerSqft: 0, total: 0 },
  ])
  const [catSearch, setCatSearch] = useState('')
  const [showCat, setShowCat] = useState<string | null>(null)

  const totalSqftRevenue = sqftEntries.reduce((s, e) => s + e.total, 0)
  const catFiltered = catalogue.filter(m =>
    m.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  // ── Récents — 5 derniers chantiers distincts ───────────────────────────────
  const recentChantiers = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    // Cherche dans les projets virtuels (historique punch)
    const sorted = [...projects]
      .filter(p => p.workLogs.some(l => l.employeeId === employeeId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    for (const p of sorted) {
      const name = p.workLogs.find(l => l.employeeId === employeeId)?.chantier || p.address || p.name
      if (name && !seen.has(name)) {
        seen.add(name)
        result.push(name)
        if (result.length >= 5) break
      }
    }
    // Aussi chercher dans dayDetails
    Object.values(dayDetails)
      .filter(d => d.employeeId === employeeId)
      .sort((a, b) => b.date.localeCompare(a.date))
    return result
  }, [projects, dayDetails, employeeId])

  // ── Projets ouverts assignés ───────────────────────────────────────────────
  const assignedProjects = projects.filter(
    p => p.status === 'open' && !p.isVirtual && p.assignedEmployeeIds.includes(employeeId)
  )

  // ── Helpers pi² ───────────────────────────────────────────────────────────
  function updateSqft(id: string, field: Partial<SqftEntry>) {
    setSqftEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      const updated = { ...e, ...field }
      updated.total = updated.sqft * updated.ratePerSqft
      return updated
    }))
  }
  function selectFromCatalogue(entryId: string, mat: { id: string; name: string; price?: number }) {
    updateSqft(entryId, { materialId: mat.id, materialName: mat.name, ratePerSqft: mat.price ?? 0 })
    setShowCat(null); setCatSearch('')
  }

  // ── Punch In ───────────────────────────────────────────────────────────────
  function handlePunchIn() {
    if (!chantier.trim()) return
    punchInVirtual({
      employeeId, employeeName,
      hourlyRate: parseFloat(customRate) || employeeHourlyRate,
      punchIn: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      chantier: chantier.trim(),
      payMode,
      ...(payMode === 'job' && jobAmount ? { jobPay: parseFloat(jobAmount) } : {}),
    })
    onComplete()
  }

  // ── Punch Out + auto-facture ───────────────────────────────────────────────
  function handlePunchOut() {
    if (!activeSession) return
    const elapsed = activeSession.elapsed
    const hours = elapsed / 3600
    const rate = ((activeEntry?.log as { hourlyRate?: number })?.hourlyRate
      ?? parseFloat(customRate)) || employeeHourlyRate
    const chantierName = (activeEntry?.log as { chantier?: string })?.chantier
      || activeEntry?.project?.address || 'Chantier'
    const activePay: PayMode = (activeEntry?.log as { payMode?: PayMode })?.payMode ?? payMode
    const activeJobPay = (activeEntry?.log as { jobPay?: number })?.jobPay ?? 0
    const dateStr = new Date().toISOString().split('T')[0]

    // Punch out dans le ProjectStore
    punchOut(
      activeEntry?.project?.id || `virtual-${employeeId}`,
      employeeId,
      {
        materials: activePay === 'sqft'
          ? sqftEntries.filter(e => e.sqft > 0).map(e => ({
              id: e.id, material: e.materialName,
              sqft: e.sqft, ratePerSqft: e.ratePerSqft,
            }))
          : undefined,
        ...(activePay === 'job' ? { jobPay: activeJobPay } : {}),
      }
    )

    // ── Auto-facture ──────────────────────────────────────────────────────────
    const existingInvoices = invoiceStore.getEmployeeInvoices(employeeId)
    let targetInvoice = existingInvoices.find(inv => inv.status === 'brouillon')

    if (!targetInvoice) {
      const number = getNextInvoiceNumber(employeeId)
      targetInvoice = invoiceStore.createInvoice(employeeId, employeeName, number)
      incrementInvoiceSequence(employeeId)
    }

    if (activePay === 'hourly') {
      // Nouvelle ligne par journée
      const earned = hours * rate
      invoiceStore.addLineItem(targetInvoice.id, {
        description: `Travail à l'heure — ${chantierName}`,
        quantity: Math.round(hours * 100) / 100,
        unitPrice: rate,
        total: earned,
        date: dateStr,
        address: chantierName,
        fromPunch: true,
      })
    } else if (activePay === 'sqft') {
      // Une ligne par matériau
      sqftEntries.filter(e => e.sqft > 0 && e.materialName).forEach(entry => {
        invoiceStore.addLineItem(targetInvoice!.id, {
          description: `${entry.materialName} — ${chantierName}`,
          quantity: entry.sqft,
          unitPrice: entry.ratePerSqft,
          total: entry.total,
          date: dateStr,
          address: chantierName,
          fromPunch: true,
        })
      })
    } else if (activePay === 'job') {
      // ── FORFAIT MULTI-JOURS ────────────────────────────────────────────────
      // Cherche une ligne forfait existante pour ce chantier
      const existingForfaitItem = targetInvoice.items.find(
        item => item.fromPunch && item.address === chantierName && item.unitPrice === activeJobPay
      )

      if (existingForfaitItem) {
        // Accumule les heures sur la même ligne
        const newQty = (existingForfaitItem.quantity as number) + Math.round(hours * 100) / 100
        const daysWorked = ((existingForfaitItem as { daysWorked?: number }).daysWorked ?? 1) + 1
        const effectiveRate = activeJobPay / newQty

        invoiceStore.updateLineItem(targetInvoice.id, existingForfaitItem.id, {
          quantity: newQty,
          // description mise à jour avec jours + heures + taux effectif
          description: `Forfait — ${chantierName} | ${daysWorked} jour${daysWorked > 1 ? 's' : ''} | ${fmtHours(newQty)} total | ${fmt(effectiveRate)}/h moy.`,
        })
      } else {
        // Première journée du forfait
        const effectiveRate = hours > 0 ? activeJobPay / hours : 0
        invoiceStore.addLineItem(targetInvoice.id, {
          description: `Forfait — ${chantierName} | 1 jour | ${fmtHours(hours)} | ${fmt(effectiveRate)}/h moy.`,
          quantity: Math.round(hours * 100) / 100,
          unitPrice: activeJobPay,
          total: activeJobPay,
          date: dateStr,
          address: chantierName,
          fromPunch: true,
        })
      }
    }

    onComplete()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VUE PUNCH IN
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === 'in') {
    const modeOptions: { id: PayMode; emoji: string; label: string; desc: string; color: string }[] = [
      { id: 'hourly', emoji: '⏱', label: "À l'heure",     desc: 'Chrono $ en temps réel',  color: '#3b82f6' },
      { id: 'sqft',   emoji: '📐', label: 'Au pied carré', desc: 'Quantités au punch out',   color: '#22c55e' },
      { id: 'job',    emoji: '💼', label: 'Au forfait',    desc: 'Montant fixe, multi-jours', color: '#f59e0b' },
    ]

    const tabs: { id: ChantierSource; label: string; emoji: string }[] = [
      { id: 'recent',  label: 'Récents',  emoji: '🕐' },
      { id: 'project', label: 'Projets',  emoji: '📋' },
      { id: 'client',  label: 'Clients',  emoji: '👥' },
      { id: 'new',     label: 'Nouveau',  emoji: '✏️' },
    ]

    return (
      <div style={overlay} onClick={onCancel}>
        <div style={modal} onClick={e => e.stopPropagation()}>

          <div style={{ height: '3px', background: 'linear-gradient(90deg,transparent,#22c55e,transparent)', flexShrink: 0 }}/>

          {/* Header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', color: 'var(--text)', margin: 0 }}>⏱️ Punch In</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{employeeName}</p>
              </div>
              <button onClick={onCancel} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>

          {/* Corps scrollable */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* ── Sélection chantier ── */}
            <div>
              <label style={{ ...lbl, color: 'var(--primary,#D4AF37)' }}>🏗️ Sur quel chantier ?</label>

              {/* Tabs source */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => { setSource(tab.id); setChantier(''); setShowNewInput(false) }} style={{
                    flexShrink: 0, padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                    fontSize: '12px', fontWeight: source === tab.id ? 700 : 400,
                    border: source === tab.id ? '2px solid var(--primary,#D4AF37)' : '1px solid var(--border)',
                    background: source === tab.id ? 'var(--primary,#D4AF37)18' : 'transparent',
                    color: source === tab.id ? 'var(--primary,#D4AF37)' : 'var(--text-muted)',
                  }}>
                    {tab.emoji} {tab.label}
                  </button>
                ))}
              </div>

              {/* 🕐 Récents */}
              {source === 'recent' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {recentChantiers.length === 0 ? (
                    <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Aucun chantier récent — choisissez &quot;Nouveau&quot;
                    </div>
                  ) : recentChantiers.map((c, i) => (
                    <button key={i} onClick={() => setChantier(c)} style={{
                      textAlign: 'left', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                      border: chantier === c ? '2px solid var(--primary,#D4AF37)' : '1px solid var(--border)',
                      background: chantier === c ? 'var(--primary,#D4AF37)15' : 'var(--card)',
                      color: 'var(--text)', fontSize: '14px', fontWeight: chantier === c ? 700 : 400,
                    }}>
                      📍 {c}
                      {chantier === c && <span style={{ float: 'right', color: 'var(--primary,#D4AF37)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* 📋 Projets assignés */}
              {source === 'project' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {assignedProjects.length === 0 ? (
                    <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Aucun projet assigné par l&apos;admin
                    </div>
                  ) : assignedProjects.map(p => (
                    <button key={p.id} onClick={() => setChantier(`${p.name} — ${p.address}`)} style={{
                      textAlign: 'left', padding: '14px', borderRadius: '10px', cursor: 'pointer',
                      border: chantier === `${p.name} — ${p.address}` ? '2px solid var(--primary,#D4AF37)' : '1px solid var(--border)',
                      background: chantier === `${p.name} — ${p.address}` ? 'var(--primary,#D4AF37)15' : 'var(--card)',
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {p.address}, {p.city}</div>
                      <div style={{ fontSize: '11px', color: 'var(--primary,#D4AF37)', marginTop: '2px' }}>
                        {p.payMode === 'hourly' ? "⏱ À l'heure" : p.payMode === 'job' ? '💼 Forfait' : '📐 Pi²'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 👥 Clients */}
              {source === 'client' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {clients.length === 0 ? (
                    <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Aucun client — ajoutez-en dans Réglages
                    </div>
                  ) : clients.map(c => (
                    <button key={c.id} onClick={() => setChantier(`${c.name}${c.address ? ' — ' + c.address : ''}`)} style={{
                      textAlign: 'left', padding: '14px', borderRadius: '10px', cursor: 'pointer',
                      border: chantier.startsWith(c.name) ? '2px solid var(--primary,#D4AF37)' : '1px solid var(--border)',
                      background: chantier.startsWith(c.name) ? 'var(--primary,#D4AF37)15' : 'var(--card)',
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>👤 {c.name}</div>
                      {c.address && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {c.address}{c.city ? ', ' + c.city : ''}</div>}
                      {c.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {c.phone}</div>}
                    </button>
                  ))}
                </div>
              )}

              {/* ✏️ Nouveau */}
              {source === 'new' && (
                <input
                  value={chantier}
                  onChange={e => setChantier(e.target.value)}
                  placeholder="Ex: 123 rue Maple, Calgary"
                  style={{ ...inp, fontSize: '16px' }}
                  autoFocus
                />
              )}

              {/* Chantier sélectionné — affichage */}
              {chantier && source !== 'new' && (
                <div style={{ marginTop: '10px', padding: '10px 14px', background: 'var(--primary,#D4AF37)15', border: '1px solid var(--primary,#D4AF37)44', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--primary,#D4AF37)', fontWeight: 700 }}>✓ {chantier}</span>
                  <button onClick={() => setChantier('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              )}
            </div>

            {/* ── Mode de paye ── */}
            <div>
              <label style={{ ...lbl, color: 'var(--primary,#D4AF37)' }}>💰 Comment es-tu payé aujourd&apos;hui ?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {modeOptions.map(opt => (
                  <button key={opt.id} onClick={() => setPayMode(opt.id)} style={{
                    textAlign: 'left', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                    border: payMode === opt.id ? `2px solid ${opt.color}` : '1px solid var(--border)',
                    background: payMode === opt.id ? `${opt.color}18` : 'var(--card)',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '22px' }}>{opt.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: payMode === opt.id ? opt.color : 'var(--text)', fontSize: '14px' }}>{opt.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                      </div>
                      {payMode === opt.id && <span style={{ color: opt.color, fontSize: '18px' }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Taux selon mode ── */}
            {payMode === 'hourly' && (
              <div>
                <label style={lbl}>💵 Taux horaire ($/h)</label>
                <input type="number" value={customRate} onChange={e => setCustomRate(e.target.value)}
                  style={{ ...inp, fontSize: '28px', fontWeight: 900, color: '#3b82f6' }}/>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Taux par défaut : ${employeeHourlyRate}/h
                </p>
              </div>
            )}

            {payMode === 'sqft' && (
              <div style={{ background: '#22c55e18', border: '1px solid #22c55e44', borderRadius: '12px', padding: '14px' }}>
                <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700, marginBottom: '10px' }}>
                  📐 Tu entreras les matériaux et pi² au punch out.
                </p>
                <label style={lbl}>⏱ Taux horaire de référence ($/h)</label>
                <input type="number" value={customRate} onChange={e => setCustomRate(e.target.value)}
                  style={{ ...inp, fontSize: '20px', fontWeight: 900 }}/>
              </div>
            )}

            {payMode === 'job' && (
              <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: '12px', padding: '14px' }}>
                <label style={{ ...lbl, color: '#f59e0b' }}>💼 Montant du forfait ($)</label>
                <input type="number" value={jobAmount} onChange={e => setJobAmount(e.target.value)}
                  placeholder="Ex: 1500"
                  style={{ ...inp, fontSize: '28px', fontWeight: 900, color: '#f59e0b', border: '1px solid #f59e0b44' }}/>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  💡 Si tu travailles plusieurs jours, les heures s&apos;accumulent sur la même ligne de facture automatiquement.
                </p>
              </div>
            )}
          </div>

          {/* Bouton Punch In */}
          <div style={{ padding: '16px 20px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
            <button onClick={handlePunchIn} disabled={!chantier.trim()} style={{
              width: '100%', padding: '18px', borderRadius: '14px', cursor: 'pointer',
              border: 'none', fontWeight: 900, fontSize: '18px', letterSpacing: '2px',
              background: !chantier.trim() ? 'var(--border)' : '#22c55e',
              color: !chantier.trim() ? 'var(--text-muted)' : '#000',
              opacity: !chantier.trim() ? 0.5 : 1, transition: 'all 0.2s',
            }}>
              🟢 PUNCH IN
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VUE PUNCH OUT
  // ─────────────────────────────────────────────────────────────────────────
  const elapsed = activeSession?.elapsed ?? 0
  const hours = elapsed / 3600
  const rate = ((activeEntry?.log as { hourlyRate?: number })?.hourlyRate
    ?? parseFloat(customRate)) || employeeHourlyRate
  const chantierName = (activeEntry?.log as { chantier?: string })?.chantier
    || activeEntry?.project?.address || 'Chantier'
  const activePay: PayMode = (activeEntry?.log as { payMode?: PayMode })?.payMode ?? payMode
  const activeJobPay = (activeEntry?.log as { jobPay?: number })?.jobPay ?? 0
  const hoursEarned = activePay === 'hourly' ? hours * rate
    : activePay === 'job' ? activeJobPay
    : totalSqftRevenue
  const effectiveRate = hours > 0 ? hoursEarned / hours : 0

  // Cherche si une ligne forfait existe déjà pour ce chantier
  const existingInvoices = invoiceStore.getEmployeeInvoices(employeeId)
  const draftInvoice = existingInvoices.find(inv => inv.status === 'brouillon')
  const existingForfaitLine = activePay === 'job' && draftInvoice
    ? draftInvoice.items.find(item => item.fromPunch && item.address === chantierName && item.unitPrice === activeJobPay)
    : null
  const totalForfaitHours = existingForfaitLine
    ? (existingForfaitLine.quantity as number) + hours
    : hours
  const totalForfaitDays = existingForfaitLine
    ? ((existingForfaitLine as { daysWorked?: number }).daysWorked ?? 1) + 1
    : 1

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        <div style={{ height: '3px', background: 'linear-gradient(90deg,transparent,#ef4444,transparent)', flexShrink: 0 }}/>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '20px', color: 'var(--text)', margin: 0 }}>🔴 Punch Out</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{employeeName}</p>
            </div>
            <button onClick={onCancel} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        {/* Corps */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Résumé chantier */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Chantier</p>
            <p style={{ fontWeight: 900, color: 'var(--text)', fontSize: '15px' }}>📍 {chantierName}</p>
            <p style={{ fontSize: '12px', color: 'var(--primary,#D4AF37)', marginTop: '2px', fontWeight: 700 }}>
              {activePay === 'hourly' ? "⏱ À l'heure" : activePay === 'job' ? '💼 Forfait' : '📐 Pi²'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cette session</p>
                <p style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary,#D4AF37)' }}>{fmtH(elapsed)}</p>
              </div>
              {activePay === 'hourly' && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gagné</p>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e' }}>{fmt(hoursEarned)}</p>
                </div>
              )}
              {activePay === 'job' && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Forfait</p>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: '#f59e0b' }}>{fmt(activeJobPay)}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── FORFAIT — résumé multi-jours ── */}
          {activePay === 'job' && (
            <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800, letterSpacing: '1px', marginBottom: '12px' }}>
                💼 RÉSUMÉ FORFAIT {existingForfaitLine ? '— MULTI-JOURS' : '— JOUR 1'}
              </p>
              {[
                { label: 'Montant forfait', value: fmt(activeJobPay), color: '#f59e0b' },
                { label: "Aujourd'hui", value: fmtH(elapsed), color: 'var(--text)' },
                { label: 'Total heures', value: fmtHours(totalForfaitHours), color: '#22c55e' },
                { label: 'Jours travaillés', value: `${totalForfaitDays} jour${totalForfaitDays > 1 ? 's' : ''}`, color: '#3b82f6' },
                { label: 'Moy. $/h sur le forfait', value: `${fmt(activeJobPay / totalForfaitHours)}/h`, color: effectiveRate >= 30 ? '#22c55e' : '#ef4444' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
              {existingForfaitLine && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f59e0b22', borderRadius: '8px', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                  ✅ S&apos;accumule sur la ligne forfait existante dans ta facture
                </div>
              )}
            </div>
          )}

          {/* ── HEURE — résumé ── */}
          {activePay === 'hourly' && (
            <div style={{ background: '#3b82f618', border: '1px solid #3b82f644', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 800, letterSpacing: '1px', marginBottom: '12px' }}>⏱ RÉSUMÉ HEURE</p>
              {[
                { label: 'Temps travaillé', value: `${fmtH(elapsed)} (${hours.toFixed(2)}h)` },
                { label: 'Taux', value: `${fmt(rate)}/h` },
                { label: 'Total', value: fmt(hoursEarned) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#3b82f6' }}>Total</span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#22c55e' }}>{fmt(hoursEarned)}</span>
              </div>
            </div>
          )}

          {/* ── PI² — matériaux ── */}
          {activePay === 'sqft' && (
            <div>
              <label style={{ ...lbl, color: '#22c55e' }}>📐 Matériaux installés aujourd&apos;hui</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sqftEntries.map((entry, idx) => (
                  <div key={entry.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Matériau #{idx + 1}</span>
                      {sqftEntries.length > 1 && (
                        <button onClick={() => setSqftEntries(prev => prev.filter(e => e.id !== entry.id))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                      )}
                    </div>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <input
                        value={entry.materialName}
                        onChange={e => { updateSqft(entry.id, { materialName: e.target.value }); setShowCat(entry.id); setCatSearch(e.target.value) }}
                        onFocus={() => setShowCat(entry.id)}
                        placeholder="🔍 Matériau (ex: Siding vinyl)"
                        style={inp}
                      />
                      {showCat === entry.id && catSearch && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', maxHeight: '160px', overflowY: 'auto', marginTop: '4px' }}>
                          {catFiltered.length === 0 ? (
                            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Aucun résultat</div>
                          ) : catFiltered.map(mat => (
                            <button key={mat.id} onClick={() => selectFromCatalogue(entry.id, mat)}
                              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px' }}>{mat.emoji} {mat.name}</span>
                              {mat.price && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmt(mat.price)}/pi²</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ ...lbl, fontSize: '9px' }}>Pi² installés</label>
                        <input type="number" value={entry.sqft || ''} onChange={e => updateSqft(entry.id, { sqft: parseFloat(e.target.value) || 0 })}
                          placeholder="300" style={inp}/>
                      </div>
                      <div>
                        <label style={{ ...lbl, fontSize: '9px' }}>$/pi²</label>
                        <input type="number" value={entry.ratePerSqft || ''} onChange={e => updateSqft(entry.id, { ratePerSqft: parseFloat(e.target.value) || 0 })}
                          placeholder="2.25" style={inp}/>
                      </div>
                    </div>
                    {entry.sqft > 0 && entry.ratePerSqft > 0 && (
                      <p style={{ textAlign: 'right', fontSize: '14px', color: '#22c55e', fontWeight: 700, marginTop: '8px' }}>
                        = {fmt(entry.total)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setSqftEntries(prev => [...prev, { id: uid(), materialName: '', materialId: '', sqft: 0, ratePerSqft: 0, total: 0 }])}
                style={{ width: '100%', marginTop: '8px', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: '1px dashed #22c55e', background: '#22c55e08', color: '#22c55e', fontSize: '13px', fontWeight: 700 }}>
                ➕ Ajouter un matériau
              </button>
              {totalSqftRevenue > 0 && (
                <div style={{ marginTop: '8px', padding: '14px', borderRadius: '10px', background: '#22c55e18', border: '1px solid #22c55e44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>Total pi²</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#22c55e' }}>{fmt(totalSqftRevenue)}</span>
                </div>
              )}
            </div>
          )}

          {/* Note auto-facture */}
          <div style={{ background: 'var(--primary,#D4AF37)12', border: '1px solid var(--primary,#D4AF37)33', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🧾</span>
            <p style={{ fontSize: '12px', color: 'var(--primary,#D4AF37)', fontWeight: 600, margin: 0 }}>
              {activePay === 'job' && existingForfaitLine
                ? 'Les heures s\'accumuleront sur la ligne forfait existante.'
                : 'Cette journée sera ajoutée automatiquement à ta facture.'}
            </p>
          </div>
        </div>

        {/* Bouton Punch Out */}
        <div style={{ padding: '16px 20px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <button onClick={handlePunchOut} style={{
            width: '100%', padding: '18px', borderRadius: '14px', cursor: 'pointer',
            border: 'none', fontWeight: 900, fontSize: '18px', letterSpacing: '2px',
            background: '#ef4444', color: '#fff', transition: 'all 0.2s',
          }}>
            🔴 PUNCH OUT
          </button>
        </div>
      </div>
    </div>
  )
}
