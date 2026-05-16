'use client'

import { useState } from 'react'
import { useProjectStore, MaterialEntry, PayMode } from '@/store/useProjectStore'

interface Props {
  employeeId: string
  employeeName: string
  employeeHourlyRate: number
  mode: 'in' | 'out'
  onComplete: () => void
  onCancel: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10)
const fmt = (n: number) => `$${n.toFixed(2)}`

// ── Styles de base ────────────────────────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(0,0,0,0.88)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 16px 80px 16px', // 80px = espace pour BottomNav
}

const modal: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  background: 'var(--surface, #111)',
  border: '1px solid var(--border, #222)',
  borderRadius: '20px',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100dvh - 100px)',
  overflow: 'hidden',
  position: 'relative',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--card, #1a1a1a)',
  border: '1px solid var(--border, #333)',
  borderRadius: '10px',
  padding: '12px 14px',
  color: 'var(--text, #fff)',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: 'var(--text-muted, #888)',
  marginBottom: '8px',
}

export default function PunchInModal({
  employeeId,
  employeeName,
  employeeHourlyRate,
  mode,
  onComplete,
  onCancel,
}: Props) {
  const { getProjectsForEmployee, getActiveLogForEmployee, punchIn, punchOut } = useProjectStore()

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [customRate, setCustomRate] = useState(employeeHourlyRate.toString())
  const [jobPayAmount, setJobPayAmount] = useState('')
  const [materials, setMaterials] = useState<MaterialEntry[]>([
    { id: uid(), material: '', sqft: 0, ratePerSqft: 0 },
  ])

  const availableProjects = getProjectsForEmployee(employeeId)
  const activeEntry = getActiveLogForEmployee(employeeId)
  const selectedProject = availableProjects.find(p => p.id === selectedProjectId) ?? activeEntry?.project
  const payMode: PayMode = selectedProject?.payMode ?? 'hourly'

  const updateMaterial = (idx: number, field: keyof MaterialEntry, value: string | number) => {
    setMaterials(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const addMaterial = () =>
    setMaterials(prev => [...prev, { id: uid(), material: '', sqft: 0, ratePerSqft: 0 }])

  const removeMaterial = (idx: number) =>
    setMaterials(prev => prev.filter((_, i) => i !== idx))

  const totalMaterialRevenue = materials.reduce((sum, m) => sum + m.sqft * m.ratePerSqft, 0)

  const handlePunchIn = () => {
    if (!selectedProjectId) return
    punchIn(selectedProjectId, {
      employeeId,
      employeeName,
      hourlyRate: parseFloat(customRate) || employeeHourlyRate,
      punchIn: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      ...(payMode === 'job' && jobPayAmount ? { jobPay: parseFloat(jobPayAmount) } : {}),
    })
    onComplete()
  }

  const handlePunchOut = () => {
    if (!activeEntry) return
    punchOut(activeEntry.project.id, employeeId, {
      materials: payMode === 'sqft'
        ? materials.filter(m => m.material && m.sqft > 0)
        : undefined,
    })
    onComplete()
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PUNCH IN
  // ════════════════════════════════════════════════════════════════════════════
  if (mode === 'in') {
    return (
      <div style={overlay} onClick={onCancel}>
        <div style={modal} onClick={e => e.stopPropagation()}>

          {/* Barre déco */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, var(--success, #22c55e), transparent)', flexShrink: 0 }} />

          {/* Header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', color: 'var(--text)', margin: 0 }}>
                  ⏱️ Punch In
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{employeeName}</p>
              </div>
              <button onClick={onCancel} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '50%', width: '36px', height: '36px',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
          </div>

          {/* Corps scrollable */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Sélection projet */}
            <div>
              <label style={{ ...labelStyle, color: 'var(--primary, #D4AF37)' }}>
                🏗️ Sur quel projet travailles-tu ?
              </label>
              {availableProjects.length === 0 ? (
                <div style={{
                  background: 'var(--warning, #f59e0b)18',
                  border: '1px solid var(--warning, #f59e0b)44',
                  borderRadius: '12px', padding: '16px', textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--warning, #f59e0b)', fontWeight: 700, fontSize: '14px' }}>
                    Aucun projet assigné
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                    L'admin doit t'assigner à un projet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      style={{
                        textAlign: 'left', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                        border: selectedProjectId === p.id
                          ? '1px solid var(--primary)'
                          : '1px solid var(--border)',
                        background: selectedProjectId === p.id
                          ? 'var(--primary)18'
                          : 'var(--card)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{p.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📍 {p.address}, {p.city}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '2px' }}>
                        {p.payMode === 'hourly' && "⏱️ À l'heure"}
                        {p.payMode === 'job' && '💰 À la job'}
                        {p.payMode === 'sqft' && '📐 Au pied carré'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Taux horaire */}
            {selectedProjectId && payMode === 'hourly' && (
              <div>
                <label style={labelStyle}>💵 Ton taux horaire ($/h)</label>
                <input
                  type="number"
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                  style={{ ...inputStyle, fontSize: '24px', fontWeight: 900 }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Taux par défaut : ${employeeHourlyRate}/h
                </p>
              </div>
            )}

            {/* À la job */}
            {selectedProjectId && payMode === 'job' && (
              <div style={{
                background: 'var(--success)18', border: '1px solid var(--success)44',
                borderRadius: '12px', padding: '16px',
              }}>
                <label style={{ ...labelStyle, color: 'var(--success)' }}>
                  💰 Ta paye pour cette job ($)
                </label>
                <input
                  type="number"
                  value={jobPayAmount}
                  onChange={e => setJobPayAmount(e.target.value)}
                  placeholder="Ex: 350"
                  style={{ ...inputStyle, fontSize: '24px', fontWeight: 900, border: '1px solid var(--success)44' }}
                />
                {selectedProject?.jobAmount && (
                  <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '6px' }}>
                    💡 Montant total job : {fmt(selectedProject.jobAmount)}
                  </p>
                )}
              </div>
            )}

            {/* Pied carré */}
            {selectedProjectId && payMode === 'sqft' && (
              <div style={{
                background: 'var(--info)18', border: '1px solid var(--info)44',
                borderRadius: '12px', padding: '14px',
              }}>
                <p style={{ fontSize: '12px', color: 'var(--info)', fontWeight: 600, marginBottom: '10px' }}>
                  📐 Mode pied carré — tu entreras les matériaux au punch out.
                </p>
                <label style={labelStyle}>⏱️ Ton taux horaire ($/h)</label>
                <input
                  type="number"
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                  style={{ ...inputStyle, fontSize: '20px', fontWeight: 900 }}
                />
              </div>
            )}
          </div>

          {/* Bouton Punch In */}
          <div style={{ padding: '16px 20px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handlePunchIn}
              disabled={!selectedProjectId || availableProjects.length === 0}
              style={{
                width: '100%', padding: '18px', borderRadius: '14px', cursor: 'pointer',
                border: 'none', fontWeight: 900, fontSize: '18px', letterSpacing: '2px',
                background: !selectedProjectId ? 'var(--border)' : 'var(--success, #22c55e)',
                color: !selectedProjectId ? 'var(--text-muted)' : '#000',
                opacity: !selectedProjectId ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              🟢 PUNCH IN
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PUNCH OUT
  // ════════════════════════════════════════════════════════════════════════════
  if (!activeEntry) {
    return (
      <div style={overlay} onClick={onCancel}>
        <div style={{ ...modal, padding: '24px', alignItems: 'center', justifyContent: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
            Aucun punch in actif trouvé.
          </p>
          <button onClick={onCancel} style={{
            background: 'none', border: 'none', color: 'var(--primary)',
            cursor: 'pointer', fontSize: '14px', textDecoration: 'underline',
          }}>Fermer</button>
        </div>
      </div>
    )
  }

  const punchInTime = new Date(activeEntry.log.punchIn)
  const hoursElapsed = (Date.now() - punchInTime.getTime()) / (1000 * 60 * 60)

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* Barre déco */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, var(--danger, #ef4444), transparent)', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '20px', color: 'var(--text)', margin: 0 }}>
                🔴 Punch Out
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{employeeName}</p>
            </div>
            <button onClick={onCancel} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '50%', width: '36px', height: '36px',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* Corps scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Projet actif + temps */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '16px',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Projet en cours
            </p>
            <p style={{ fontWeight: 900, color: 'var(--text)', fontSize: '16px' }}>{activeEntry.project.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              📍 {activeEntry.project.address}
            </p>

            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Temps écoulé</span>
                <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)' }}>
                  {hoursElapsed.toFixed(2)}h
                </span>
              </div>
              {payMode === 'hourly' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Montant</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>
                    {fmt(hoursElapsed * activeEntry.log.hourlyRate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Matériaux — mode pi² */}
          {payMode === 'sqft' && (
            <div>
              <label style={{ ...labelStyle, color: 'var(--info)' }}>
                📐 Matériaux installés aujourd'hui
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {materials.map((mat, idx) => (
                  <div key={mat.id} style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        Matériau #{idx + 1}
                      </span>
                      {materials.length > 1 && (
                        <button onClick={() => removeMaterial(idx)} style={{
                          background: 'none', border: 'none', color: 'var(--danger)',
                          cursor: 'pointer', fontSize: '16px',
                        }}>✕</button>
                      )}
                    </div>
                    <input
                      value={mat.material}
                      onChange={e => updateMaterial(idx, 'material', e.target.value)}
                      placeholder="Ex: Siding vinyl, Soffit..."
                      style={{ ...inputStyle, marginBottom: '8px' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '9px' }}>Pi² installés</label>
                        <input
                          type="number"
                          value={mat.sqft || ''}
                          onChange={e => updateMaterial(idx, 'sqft', parseFloat(e.target.value) || 0)}
                          placeholder="300"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '9px' }}>$/pi²</label>
                        <input
                          type="number"
                          value={mat.ratePerSqft || ''}
                          onChange={e => updateMaterial(idx, 'ratePerSqft', parseFloat(e.target.value) || 0)}
                          placeholder="2.25"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    {mat.sqft > 0 && mat.ratePerSqft > 0 && (
                      <p style={{ textAlign: 'right', fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginTop: '6px' }}>
                        = {fmt(mat.sqft * mat.ratePerSqft)}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addMaterial}
                style={{
                  width: '100%', marginTop: '8px', padding: '12px',
                  borderRadius: '10px', cursor: 'pointer',
                  border: '1px dashed var(--info)', background: 'var(--info)08',
                  color: 'var(--info)', fontSize: '13px', fontWeight: 700,
                }}
              >
                ➕ Ajouter un matériau
              </button>

              {totalMaterialRevenue > 0 && (
                <div style={{
                  marginTop: '8px', padding: '12px 14px', borderRadius: '10px',
                  background: 'var(--info)18', border: '1px solid var(--info)44',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--info)' }}>Total revenue pi²</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--info)' }}>{fmt(totalMaterialRevenue)}</span>
                </div>
              )}
            </div>
          )}

          {/* Résumé forfait */}
          {payMode === 'job' && (
            <div style={{
              background: 'var(--success)18', border: '1px solid var(--success)44',
              borderRadius: '12px', padding: '16px',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 800, letterSpacing: '1px', marginBottom: '10px' }}>
                💰 RÉSUMÉ JOB
              </p>
              {[
                { label: 'Paye job', value: fmt(activeEntry.log.jobPay ?? 0) },
                { label: 'Temps travaillé', value: `${hoursElapsed.toFixed(2)}h` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text)', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Taux effectif</span>
                <span style={{
                  fontSize: '16px', fontWeight: 900,
                  color: (activeEntry.log.jobPay ?? 0) / hoursElapsed >= 30 ? 'var(--success)' : 'var(--danger)',
                }}>
                  {fmt((activeEntry.log.jobPay ?? 0) / hoursElapsed)}/h
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bouton Punch Out */}
        <div style={{ padding: '16px 20px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handlePunchOut}
            style={{
              width: '100%', padding: '18px', borderRadius: '14px', cursor: 'pointer',
              border: 'none', fontWeight: 900, fontSize: '18px', letterSpacing: '2px',
              background: 'var(--danger, #ef4444)',
              color: '#fff',
              transition: 'all 0.2s',
            }}
          >
            🔴 PUNCH OUT
          </button>
        </div>
      </div>
    </div>
  )
}
