'use client'

import { useState } from 'react'
import { useProjectStore } from '@/store/useProjectStore'
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

const uid = () => Math.random().toString(36).slice(2, 10)
const fmt = (n: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n ?? 0)
const fmtH = (sec: number) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${h}h${m.toString().padStart(2, '0')}`
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

// ── Styles ────────────────────────────────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(0,0,0,0.90)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '16px 16px 80px',
}
const modal: React.CSSProperties = {
  width: '100%', maxWidth: '480px',
  background: 'var(--surface, #111)',
  border: '1px solid var(--border, #222)',
  borderRadius: '20px',
  display: 'flex', flexDirection: 'column',
  maxHeight: 'calc(100dvh - 100px)',
  overflow: 'hidden',
}
const inp: React.CSSProperties = {
  width: '100%', background: 'var(--card, #1a1a1a)',
  border: '1px solid var(--border, #333)', borderRadius: '10px',
  padding: '12px 14px', color: 'var(--text, #fff)',
  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 800,
  letterSpacing: '1.5px', textTransform: 'uppercase',
  color: 'var(--text-muted, #888)', marginBottom: '8px',
}

export default function PunchInModal({
  employeeId, employeeName, employeeHourlyRate,
  mode, onComplete, onCancel,
}: Props) {
  const { getActiveLogForEmployee, punchIn, punchOut } = useProjectStore()
  const { employees, activeSessions, getNextInvoiceNumber, incrementInvoiceSequence } = useEmployeeStore()
  const invoiceStore = useInvoiceStore()
  const { materials: catalogue } = useCatalogueStore()

  const emp = employees.find(e => e.id === employeeId)
  const activeEntry = getActiveLogForEmployee(employeeId)
  const activeSession = activeSessions[employeeId]

  // ── État Punch In ──────────────────────────────────────────────────────────
  const [chantier, setChantier] = useState('')
  const [payMode, setPayMode] = useState<PayMode>(emp?.workMode === 'surface' ? 'sqft' : emp?.workMode === 'forfait' ? 'job' : 'hourly')
  const [customRate, setCustomRate] = useState(String(employeeHourlyRate))
  const [jobAmount, setJobAmount] = useState('')

  // ── État Punch Out pi² ────────────────────────────────────────────────────
  const [sqftEntries, setSqftEntries] = useState<SqftEntry[]>([
    { id: uid(), materialName: '', materialId: '', sqft: 0, ratePerSqft: 0, total: 0 },
  ])
  const [catSearch, setCatSearch] = useState('')
  const [showCat, setShowCat] = useState<string | null>(null) // id de l'entrée qui cherche

  const totalSqftRevenue = sqftEntries.reduce((s, e) => s + e.total, 0)
  const catFiltered = catalogue.filter(m =>
    m.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  // ── Helpers ───────────────────────────────────────────────────────────────
  function updateSqft(id: string, field: Partial<SqftEntry>) {
    setSqftEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      const updated = { ...e, ...field }
      updated.total = updated.sqft * updated.ratePerSqft
      return updated
    }))
  }

  function selectFromCatalogue(entryId: string, mat: { id: string; name: string; price?: number }) {
    updateSqft(entryId, {
      materialId: mat.id,
      materialName: mat.name,
      ratePerSqft: mat.price ?? 0,
    })
    setShowCat(null)
    setCatSearch('')
  }

  // ── Punch In ───────────────────────────────────────────────────────────────
  function handlePunchIn() {
    if (!chantier.trim()) return

    // Crée un projet virtuel pour le ProjectStore (compatibilité)
    const virtualProjectId = `virtual-${employeeId}-${Date.now()}`
    punchIn(virtualProjectId, {
      employeeId,
      employeeName,
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

    const elapsed = activeSession.elapsed // secondes
    const hours = elapsed / 3600
    const rate = parseFloat(customRate) || employeeHourlyRate

    let earnedAmount = 0
    let description = ''
    const chantierName = (activeEntry as { log?: { chantier?: string } })?.log?.chantier || 'Chantier'
    const dateStr = new Date().toISOString().split('T')[0]

    if (payMode === 'hourly') {
      earnedAmount = hours * rate
      description = `Travail à l'heure — ${chantierName} (${fmtH(elapsed)} × ${fmt(rate)}/h)`
    } else if (payMode === 'sqft') {
      earnedAmount = totalSqftRevenue
      description = `Travail au pied carré — ${chantierName}`
    } else if (payMode === 'job') {
      earnedAmount = parseFloat(jobAmount) || 0
      description = `Forfait — ${chantierName} (${fmtH(elapsed)} travaillé)`
    }

    // Punch out dans le store employé
    punchOut(
      (activeEntry as { project?: { id?: string } })?.project?.id || `virtual-${employeeId}`,
      employeeId,
      { materials: payMode === 'sqft' ? sqftEntries.map(e => ({ id: e.id, material: e.materialName, sqft: e.sqft, ratePerSqft: e.ratePerSqft })) : undefined }
    )

    // ── Auto-ajout à la facture employé ──────────────────────────────────────
    // Cherche une facture en brouillon existante, sinon en crée une
    const existingInvoices = invoiceStore.getEmployeeInvoices(employeeId)
    let targetInvoice = existingInvoices.find(inv => inv.status === 'brouillon')

    if (!targetInvoice) {
      const number = getNextInvoiceNumber(employeeId)
      targetInvoice = invoiceStore.createInvoice(employeeId, employeeName, number)
      incrementInvoiceSequence(employeeId)
    }

    // Ligne principale (heures ou forfait)
    if (payMode !== 'sqft') {
      invoiceStore.addLineItem(targetInvoice.id, {
        description,
        quantity: payMode === 'hourly' ? Math.round(hours * 100) / 100 : 1,
        unitPrice: payMode === 'hourly' ? rate : earnedAmount,
        total: earnedAmount,
        date: dateStr,
        address: chantierName,
        fromPunch: true,
      })
    } else {
      // Une ligne par matériau pi²
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
    }

    onComplete()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VUE PUNCH IN
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === 'in') {
    const modeOptions: { id: PayMode; emoji: string; label: string; desc: string; color: string }[] = [
      { id: 'hourly', emoji: '⏱', label: "À l'heure",     desc: 'Chrono $ en temps réel',    color: '#3b82f6' },
      { id: 'sqft',   emoji: '📐', label: 'Au pied carré', desc: 'Quantités au punch out',     color: '#22c55e' },
      { id: 'job',    emoji: '💼', label: 'Au forfait',    desc: 'Montant fixe pour la job',   color: '#f59e0b' },
    ]

    return (
      <div style={overlay} onClick={onCancel}>
        <div style={modal} onClick={e => e.stopPropagation()}>

          {/* Barre déco */}
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

          {/* Corps */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* 1. Chantier */}
            <div>
              <label style={{ ...lbl, color: 'var(--primary, #D4AF37)' }}>🏗️ Sur quel chantier ?</label>
              <input
                value={chantier}
                onChange={e => setChantier(e.target.value)}
                placeholder="Ex: 123 rue Maple, Calgary"
                style={{ ...inp, fontSize: '16px' }}
                autoFocus
              />
            </div>

            {/* 2. Mode de paye */}
            <div>
              <label style={{ ...lbl, color: 'var(--primary, #D4AF37)' }}>💰 Comment es-tu payé aujourd'hui ?</label>
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
                      <div>
                        <div style={{ fontWeight: 700, color: payMode === opt.id ? opt.color : 'var(--text)', fontSize: '14px' }}>{opt.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                      </div>
                      {payMode === opt.id && <span style={{ marginLeft: 'auto', color: opt.color, fontSize: '18px' }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Taux selon mode */}
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
                  📐 Tu entreras tes quantités et matériaux au punch out.
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
                  placeholder="Ex: 800"
                  style={{ ...inp, fontSize: '28px', fontWeight: 900, color: '#f59e0b', border: '1px solid #f59e0b44' }}/>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Le $/h effectif sera calculé au punch out selon le temps travaillé.
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
  const rate = parseFloat(customRate) || employeeHourlyRate
  const chantierName = (activeEntry as { log?: { chantier?: string } })?.log?.chantier
    || activeEntry?.project?.address
    || 'Chantier'

  // Récupère le mode depuis le log actif
  const activePay: PayMode = (activeEntry as { log?: { payMode?: PayMode } })?.log?.payMode ?? payMode
  const activeJobPay = (activeEntry as { log?: { jobPay?: number } })?.log?.jobPay ?? 0

  const hoursEarned = activePay === 'hourly' ? hours * rate
    : activePay === 'job' ? activeJobPay
    : totalSqftRevenue

  const effectiveRate = hours > 0 ? hoursEarned / hours : 0

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* Barre déco */}
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

          {/* Résumé chantier + temps */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Chantier</p>
            <p style={{ fontWeight: 900, color: 'var(--text)', fontSize: '16px' }}>📍 {chantierName}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Temps</p>
                <p style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary, #D4AF37)' }}>{fmtH(elapsed)}</p>
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

          {/* ── MODE PIED CARRÉ ── */}
          {activePay === 'sqft' && (
            <div>
              <label style={{ ...lbl, color: '#22c55e' }}>📐 Matériaux installés aujourd'hui</label>
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

                    {/* Sélection matériau */}
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
                            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Aucun résultat — entrez manuellement</div>
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

          {/* ── MODE FORFAIT ── */}
          {activePay === 'job' && (
            <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800, letterSpacing: '1px', marginBottom: '12px' }}>💼 RÉSUMÉ FORFAIT</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Montant forfait</span>
                <span style={{ fontWeight: 700 }}>{fmt(activeJobPay)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Temps travaillé</span>
                <span style={{ fontWeight: 700 }}>{fmtH(elapsed)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)', marginTop: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Taux effectif</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: effectiveRate >= 30 ? '#22c55e' : '#ef4444' }}>
                  {fmt(effectiveRate)}/h
                </span>
              </div>
            </div>
          )}

          {/* ── MODE HEURE ── */}
          {activePay === 'hourly' && (
            <div style={{ background: '#3b82f618', border: '1px solid #3b82f644', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 800, letterSpacing: '1px', marginBottom: '12px' }}>⏱ RÉSUMÉ HEURE</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Temps</span>
                <span style={{ fontWeight: 700 }}>{fmtH(elapsed)} ({hours.toFixed(2)}h)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Taux</span>
                <span style={{ fontWeight: 700 }}>{fmt(rate)}/h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)', marginTop: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#3b82f6' }}>Total</span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#22c55e' }}>{fmt(hoursEarned)}</span>
              </div>
            </div>
          )}

          {/* Note auto-facture */}
          <div style={{ background: 'var(--primary, #D4AF37)12', border: '1px solid var(--primary, #D4AF37)33', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🧾</span>
            <p style={{ fontSize: '12px', color: 'var(--primary, #D4AF37)', fontWeight: 600, margin: 0 }}>
              Cette journée sera automatiquement ajoutée à ta facture en cours.
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
