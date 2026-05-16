'use client'
import { useState, useMemo } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useCommandeStore } from '@/store/useCommandeStore'
import { useCatalogueStore } from '@/store/useCatalogueStore'
import type { Commande, CommandeStatus } from '@/store/useCommandeStore'

const STATUS: Record<CommandeStatus, { label: string; color: string; emoji: string }> = {
  brouillon: { label: 'Brouillon', color: '#f59e0b', emoji: '📝' },
  envoyee:   { label: 'Envoyée',   color: '#3b82f6', emoji: '📤' },
  recue:     { label: 'Reçue',     color: '#22c55e', emoji: '✅' },
}

function todayISO() { return new Date().toISOString().split('T')[0] }

function fmtDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

// ── Générateur de PO professionnel (acheteur → fournisseur) ──────────────────
function buildPOBody(
  cmd: Commande,
  co: { name: string; ownerName: string; address: string; city: string; province: string; postalCode: string; phone: string; email: string; gstNumber: string }
): string {
  const sep  = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  const lines = cmd.items.map((it, i) =>
    `  ${i + 1}. ${it.name}${it.unit ? `\n     Quantité: ${it.quantite} ${it.unit}` : `\n     Quantité: ${it.quantite}`}${it.notes ? `\n     Note: ${it.notes}` : ''}`
  ).join('\n')

  const adresseCo = [co.address, co.city, co.province, co.postalCode].filter(Boolean).join(', ')

  return encodeURIComponent(
`COMMANDE D'ACHAT — PURCHASE ORDER
${sep}
N° PO   : ${cmd.numero}
Date    : ${fmtDate(cmd.date)}
${sep}

DE (ACHETEUR / BUYER):
${co.name}
${co.ownerName ? co.ownerName + '\n' : ''}${adresseCo ? adresseCo + '\n' : ''}${co.phone ? '📞 ' + co.phone + '\n' : ''}${co.email ? '✉️  ' + co.email + '\n' : ''}${co.gstNumber ? 'GST: ' + co.gstNumber + '\n' : ''}
${sep}

À (FOURNISSEUR / SUPPLIER):
${cmd.fournisseur}
${cmd.fournisseurPhone ? '📞 ' + cmd.fournisseurPhone + '\n' : ''}
${sep}

${cmd.projetRef ? 'RÉFÉRENCE CHANTIER: ' + cmd.projetRef + '\n' : ''}LIVRAISON REQUISE À:
${cmd.adresseLivraison || '(adresse à préciser)'}
Date souhaitée: ${cmd.dateLivraison ? fmtDate(cmd.dateLivraison) : 'À confirmer'}

${sep}

ARTICLES COMMANDÉS:
${sep}
${lines}

${sep}
${cmd.notes ? 'NOTES:\n' + cmd.notes + '\n\n' + sep + '\n' : ''}
Autorisé par: ${co.ownerName || co.name}
${co.name}
${co.phone || ''}

Merci de confirmer la réception de cette commande.
Thank you for acknowledging this purchase order.
${sep}`)
}

export default function CommandesPage() {
  const { theme }     = useThemeStore()
  const { company }   = useCompanyStore()
  const store         = useCommandeStore()
  const { materials } = useCatalogueStore()

  const pc = theme.colors.primary

  // ── État liste ─────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus]       = useState<CommandeStatus | 'toutes'>('toutes')
  const [openId, setOpenId]                   = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // ── État nouvelle commande ────────────────────────────────────────────────
  const [showNew, setShowNew]               = useState(false)
  const [newFourn, setNewFourn]             = useState('')
  const [newFournEmail, setNewFournEmail]   = useState('')
  const [newFournPhone, setNewFournPhone]   = useState('')
  const [newDate, setNewDate]               = useState(todayISO)
  const [newDateLiv, setNewDateLiv]         = useState('')
  const [newAdresse, setNewAdresse]         = useState('')
  const [newProjet, setNewProjet]           = useState('')
  const [newNotes, setNewNotes]             = useState('')

  // ── État ajout item ───────────────────────────────────────────────────────
  const [showAddItem, setShowAddItem]         = useState(false)
  const [itemMode, setItemMode]               = useState<'catalogue' | 'manuel'>('catalogue')
  const [catSearch, setCatSearch]             = useState('')
  const [selectedMatId, setSelectedMatId]     = useState<string | null>(null)
  const [selectedQty, setSelectedQty]         = useState('1')
  const [selectedNotes, setSelectedNotes]     = useState('')
  const [manualName, setManualName]           = useState('')
  const [manualUnit, setManualUnit]           = useState('')
  const [manualQty, setManualQty]             = useState('1')
  const [manualNotes, setManualNotes]         = useState('')

  // ── Dérivés ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    store.commandes
      .filter(c => filterStatus === 'toutes' || c.status === filterStatus)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [store.commandes, filterStatus]
  )

  const openCmd    = openId ? store.commandes.find(c => c.id === openId) ?? null : null
  const catResults = useMemo(() =>
    materials.filter(m => m.name.toLowerCase().includes(catSearch.toLowerCase())),
    [materials, catSearch]
  )
  const selectedMat = selectedMatId ? materials.find(m => m.id === selectedMatId) : null

  // ── Handlers ──────────────────────────────────────────────────────────────
  function createCommande() {
    if (!newFourn.trim()) return
    const cmd = store.addCommande({
      fournisseur:      newFourn.trim(),
      fournisseurEmail: newFournEmail.trim() || undefined,
      fournisseurPhone: newFournPhone.trim() || undefined,
      date:             newDate,
      dateLivraison:    newDateLiv || undefined,
      adresseLivraison: newAdresse.trim() || undefined,
      projetRef:        newProjet.trim() || undefined,
      notes:            newNotes,
    })
    setShowNew(false)
    setNewFourn(''); setNewFournEmail(''); setNewFournPhone('')
    setNewDate(todayISO()); setNewDateLiv(''); setNewAdresse('')
    setNewProjet(''); setNewNotes('')
    setOpenId(cmd.id)
    setShowAddItem(true)
  }

  function addFromCatalogue() {
    if (!openCmd || !selectedMat) return
    store.addItem(openCmd.id, {
      materialId: selectedMat.id,
      name:       selectedMat.name,
      unit:       selectedMat.unit || '',
      quantite:   parseFloat(selectedQty) || 1,
      notes:      selectedNotes.trim() || undefined,
    })
    setSelectedMatId(null); setSelectedQty('1'); setSelectedNotes(''); setCatSearch('')
  }

  function addManual() {
    if (!openCmd || !manualName.trim()) return
    store.addItem(openCmd.id, {
      name:     manualName.trim(),
      unit:     manualUnit.trim(),
      quantite: parseFloat(manualQty) || 1,
      notes:    manualNotes.trim() || undefined,
    })
    setManualName(''); setManualUnit(''); setManualQty('1'); setManualNotes('')
  }

  function sendEmail(cmd: Commande) {
    const subject = encodeURIComponent(`Commande ${cmd.numero} — ${company.name}`)
    const body    = buildPOBody(cmd, company)
    const to      = cmd.fournisseurEmail || ''
    window.open(`mailto:${to}?subject=${subject}&body=${body}`)
    if (cmd.status === 'brouillon') store.markSent(cmd.id)
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: theme.colors.card, border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px', padding: '14px',
  }
  const inp: React.CSSProperties = {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px', padding: '9px 11px', color: theme.colors.text,
    fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '10px', color: theme.colors.textMuted,
    fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px',
  }
  const btnPrimary: React.CSSProperties = {
    background: `linear-gradient(135deg, ${pc}, ${theme.colors.secondary || pc})`,
    color: '#000', border: 'none', borderRadius: '10px', padding: '12px',
    fontWeight: 800, fontSize: '14px', cursor: 'pointer', width: '100%',
  }
  const btnSm = (color: string): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
    background: `${color}18`, border: `1px solid ${color}44`, color,
    fontSize: '12px', fontWeight: 700,
  })
  const sectionTitle = (emoji: string, label: string) => (
    <div style={{ fontSize: '10px', fontWeight: 800, color: theme.colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', marginTop: '4px' }}>
      {emoji} {label}
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  // ── VUE DÉTAIL COMMANDE ───────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  if (openCmd) {
    const cfg = STATUS[openCmd.status]
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '80px' }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => { setOpenId(null); setShowAddItem(false) }} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '7px 12px', cursor: 'pointer', color: 'var(--text)', fontSize: '13px', fontWeight: 700,
          }}>← Retour</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: pc }}>{openCmd.numero}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {openCmd.fournisseur} · {fmtDate(openCmd.date)}
            </div>
          </div>
          <div style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}55`, borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: 700 }}>
            {cfg.emoji} {cfg.label}
          </div>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Récapitulatif PO */}
          <div style={card}>
            {/* Acheteur */}
            <div style={{ marginBottom: '12px' }}>
              {sectionTitle('🏢', 'Acheteur (vous)')}
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{company.name}</div>
              {company.ownerName && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{company.ownerName}</div>}
              {company.phone    && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {company.phone}</div>}
              {company.email    && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>✉️ {company.email}</div>}
            </div>
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }}/>
            {/* Fournisseur */}
            <div style={{ marginBottom: '12px' }}>
              {sectionTitle('🏪', 'Fournisseur')}
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{openCmd.fournisseur}</div>
              {openCmd.fournisseurEmail && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>✉️ {openCmd.fournisseurEmail}</div>}
              {openCmd.fournisseurPhone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {openCmd.fournisseurPhone}</div>}
            </div>
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }}/>
            {/* Livraison */}
            <div>
              {sectionTitle('🚚', 'Livraison au chantier')}
              {openCmd.projetRef && (
                <div style={{ fontSize: '12px', fontWeight: 700, color: pc, marginBottom: '3px' }}>
                  📍 {openCmd.projetRef}
                </div>
              )}
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {openCmd.adresseLivraison || '— adresse non spécifiée'}
              </div>
              {openCmd.dateLivraison && (
                <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, marginTop: '4px' }}>
                  📅 Date souhaitée: {fmtDate(openCmd.dateLivraison)}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => sendEmail(openCmd)} style={{
              ...btnSm('#3b82f6'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px',
            }}>
              📧 {openCmd.fournisseurEmail ? `Envoyer à ${openCmd.fournisseurEmail.split('@')[0]}` : 'Envoyer email'}
            </button>
            {openCmd.status !== 'recue' && (
              <button onClick={() => store.markReceived(openCmd.id)} style={{ ...btnSm('#22c55e'), padding: '12px' }}>
                ✅ Marquer reçue
              </button>
            )}
          </div>

          {/* Articles */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                📋 Articles commandés
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>({openCmd.items.length})</span>
              </h2>
              {openCmd.status !== 'recue' && (
                <button onClick={() => setShowAddItem(!showAddItem)} style={{
                  background: pc, color: '#000', border: 'none', borderRadius: '8px',
                  padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                }}>
                  {showAddItem ? '✕' : '+ Ajouter'}
                </button>
              )}
            </div>

            {/* Formulaire ajout item */}
            {showAddItem && openCmd.status !== 'recue' && (
              <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '12px', marginBottom: '12px', border: `1px dashed ${pc}` }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {(['catalogue', 'manuel'] as const).map(mode => (
                    <button key={mode} onClick={() => setItemMode(mode)} style={{
                      flex: 1, padding: '7px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                      fontWeight: itemMode === mode ? 700 : 400,
                      border: itemMode === mode ? `2px solid ${pc}` : '1px solid var(--border)',
                      background: itemMode === mode ? `${pc}22` : 'transparent',
                      color: itemMode === mode ? pc : 'var(--text-muted)',
                    }}>
                      {mode === 'catalogue' ? '📦 Catalogue' : '✏️ Manuel'}
                    </button>
                  ))}
                </div>

                {itemMode === 'catalogue' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input value={catSearch}
                      onChange={e => { setCatSearch(e.target.value); if (selectedMatId) setSelectedMatId(null) }}
                      placeholder="🔍 Rechercher dans le catalogue..."
                      style={inp}
                    />
                    {catSearch && !selectedMat && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}>
                        {catResults.length === 0
                          ? <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Aucun résultat</div>
                          : catResults.map(mat => (
                            <button key={mat.id} onClick={() => { setSelectedMatId(mat.id); setCatSearch(mat.name) }}
                              style={{ width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', color: 'var(--text)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{mat.emoji && `${mat.emoji} `}{mat.name}</span>
                              {mat.unit && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{mat.unit}</span>}
                            </button>
                          ))
                        }
                      </div>
                    )}
                    {selectedMat && (
                      <div style={{ background: `${pc}15`, border: `1px solid ${pc}44`, borderRadius: '8px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{selectedMat.emoji || '📦'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>{selectedMat.name}</div>
                          {selectedMat.unit && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedMat.unit}</div>}
                        </div>
                        <button onClick={() => { setSelectedMatId(null); setCatSearch('') }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}>✕</button>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={lbl}>Quantité</label>
                        <input type="number" value={selectedQty} onChange={e => setSelectedQty(e.target.value)} min={0.1} step={0.1} style={inp}/>
                      </div>
                      <div>
                        <label style={lbl}>Notes (optionnel)</label>
                        <input value={selectedNotes} onChange={e => setSelectedNotes(e.target.value)} placeholder="couleur, modèle..." style={inp}/>
                      </div>
                    </div>
                    <button onClick={addFromCatalogue} disabled={!selectedMat}
                      style={{ ...btnPrimary, opacity: selectedMat ? 1 : 0.4 }}>
                      ➕ Ajouter à la commande
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={lbl}>Nom du matériau *</label>
                      <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Ex: Solin spécial" style={inp}/>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={lbl}>Unité</label>
                        <input value={manualUnit} onChange={e => setManualUnit(e.target.value)} placeholder="boîte, rouleau, pi²..." style={inp}/>
                      </div>
                      <div>
                        <label style={lbl}>Quantité</label>
                        <input type="number" value={manualQty} onChange={e => setManualQty(e.target.value)} min={0.1} step={0.1} style={inp}/>
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Notes (optionnel)</label>
                      <input value={manualNotes} onChange={e => setManualNotes(e.target.value)} placeholder="Couleur, spec..." style={inp}/>
                    </div>
                    <button onClick={addManual} disabled={!manualName.trim()}
                      style={{ ...btnPrimary, opacity: manualName.trim() ? 1 : 0.4 }}>
                      ➕ Ajouter à la commande
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Liste items */}
            {openCmd.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>📋</div>
                <div style={{ fontSize: '13px' }}>Aucun article — cliquez &quot;+ Ajouter&quot;</div>
              </div>
            ) : openCmd.items.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--surface)', borderRadius: '8px', marginBottom: '6px', border: '1px solid var(--border)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#000', flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{item.name}</div>
                  {item.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.notes}</div>}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '48px' }}>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: pc, lineHeight: 1 }}>{item.quantite}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.unit || 'unité'}</div>
                </div>
                {openCmd.status !== 'recue' && (
                  <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                    <button onClick={() => store.updateItem(openCmd.id, item.id, { quantite: Math.max(0.5, item.quantite - 1) })}
                      style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', fontSize: '14px' }}>−</button>
                    <button onClick={() => store.updateItem(openCmd.id, item.id, { quantite: item.quantite + 1 })}
                      style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', fontSize: '14px' }}>+</button>
                    <button onClick={() => store.removeItem(openCmd.id, item.id)}
                      style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '13px' }}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          {openCmd.notes && (
            <div style={card}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>📝 NOTES</div>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>{openCmd.notes}</div>
            </div>
          )}

          {/* Aperçu PO */}
          {openCmd.items.length > 0 && (
            <div style={{ ...card, border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                👁️ APERÇU DU PO — <span style={{ color: '#22c55e' }}>AUCUN PRIX</span>
              </div>
              <pre style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text)', lineHeight: 1.6, background: 'var(--surface)', borderRadius: '8px', padding: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{`COMMANDE D'ACHAT — PURCHASE ORDER
${'━'.repeat(32)}
N° PO   : ${openCmd.numero}
Date    : ${fmtDate(openCmd.date)}
${'━'.repeat(32)}

DE (ACHETEUR):
${company.name}
${company.ownerName || ''}
${[company.address, company.city, company.province].filter(Boolean).join(', ')}
${company.phone ? '📞 ' + company.phone : ''}
${company.email ? '✉️  ' + company.email : ''}

À (FOURNISSEUR):
${openCmd.fournisseur}
${openCmd.fournisseurEmail || ''}
${openCmd.fournisseurPhone ? '📞 ' + openCmd.fournisseurPhone : ''}
${'━'.repeat(32)}
${openCmd.projetRef ? 'CHANTIER: ' + openCmd.projetRef + '\n' : ''}LIVRAISON: ${openCmd.adresseLivraison || '(à préciser)'}
DATE SOUHAITÉE: ${openCmd.dateLivraison ? fmtDate(openCmd.dateLivraison) : 'À confirmer'}
${'━'.repeat(32)}

ARTICLES COMMANDÉS:
${openCmd.items.map((it, i) => `  ${i + 1}. ${it.name}\n     ${it.quantite} ${it.unit || 'unité'}${it.notes ? ' — ' + it.notes : ''}`).join('\n')}
${'━'.repeat(32)}
${openCmd.notes ? 'NOTES: ' + openCmd.notes + '\n' + '━'.repeat(32) + '\n' : ''}
Autorisé par: ${company.ownerName || company.name}
${company.name}`}
              </pre>
              <button onClick={() => sendEmail(openCmd)}
                style={{ ...btnPrimary, marginTop: '10px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff' }}>
                📧 Envoyer ce PO{openCmd.fournisseurEmail ? ` à ${openCmd.fournisseurEmail}` : ' par email'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── VUE LISTE ─────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '80px' }}>

      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: pc }}>📋 Commandes PO</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {store.commandes.length} commande{store.commandes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowNew(!showNew)} style={{
            background: `linear-gradient(135deg, ${pc}, ${theme.colors.secondary || pc})`,
            color: '#000', border: 'none', borderRadius: '10px',
            padding: '10px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: 800,
          }}>
            {showNew ? '✕ Annuler' : '+ Nouvelle'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── Formulaire nouvelle commande ── */}
        {showNew && (
          <div style={{ ...card, border: `2px solid ${pc}` }}>
            <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 800, color: pc, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              ➕ Nouvelle commande PO
            </p>

            {/* Section fournisseur */}
            {sectionTitle('🏪', 'Fournisseur')}
            <div style={{ marginBottom: '8px' }}>
              <label style={lbl}>Nom du fournisseur *</label>
              <input value={newFourn} onChange={e => setNewFourn(e.target.value)}
                placeholder="Ex: Epic Roofing, Gentech..." style={inp} list="fournisseurs-list"/>
              <datalist id="fournisseurs-list">
                {[...new Set(store.commandes.map(c => c.fournisseur))].map(f => <option key={f} value={f}/>)}
              </datalist>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div>
                <label style={lbl}>Email fournisseur</label>
                <input type="email" value={newFournEmail} onChange={e => setNewFournEmail(e.target.value)}
                  placeholder="commandes@fournisseur.com" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Téléphone</label>
                <input type="tel" value={newFournPhone} onChange={e => setNewFournPhone(e.target.value)}
                  placeholder="780-555-0000" style={inp}/>
              </div>
            </div>

            {/* Section livraison */}
            {sectionTitle('🚚', 'Livraison au chantier')}
            <div style={{ marginBottom: '8px' }}>
              <label style={lbl}>Référence chantier</label>
              <input value={newProjet} onChange={e => setNewProjet(e.target.value)}
                placeholder="Ex: Maison Smith — 123 rue Maple" style={inp}/>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={lbl}>Adresse de livraison</label>
              <input value={newAdresse} onChange={e => setNewAdresse(e.target.value)}
                placeholder="123 rue du Chantier, Calgary, AB T2X 0A1" style={inp}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div>
                <label style={lbl}>Date du PO</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Livraison souhaitée</label>
                <input type="date" value={newDateLiv} onChange={e => setNewDateLiv(e.target.value)} style={inp}/>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Notes (optionnel)</label>
              <input value={newNotes} onChange={e => setNewNotes(e.target.value)}
                placeholder="Ex: Livraison avant 10h, appeler avant..." style={inp}/>
            </div>

            <button onClick={createCommande} disabled={!newFourn.trim()}
              style={{ ...btnPrimary, opacity: newFourn.trim() ? 1 : 0.4 }}>
              ✅ Créer — ajouter les articles
            </button>
          </div>
        )}

        {/* Filtres statut */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {(['toutes', 'brouillon', 'envoyee', 'recue'] as const).map(s => {
            const cfg   = s === 'toutes' ? { label: 'Toutes', color: pc, emoji: '📋' } : STATUS[s]
            const isAct = filterStatus === s
            const count = s === 'toutes' ? store.commandes.length : store.commandes.filter(c => c.status === s).length
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: '12px', fontWeight: isAct ? 700 : 400, flexShrink: 0,
                border: isAct ? `2px solid ${cfg.color}` : '1px solid var(--border)',
                background: isAct ? `${cfg.color}18` : 'transparent',
                color: isAct ? cfg.color : 'var(--text-muted)',
              }}>
                {cfg.emoji} {cfg.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Liste PO */}
        {filtered.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
              Aucune commande
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Cliquez &quot;+ Nouvelle&quot; pour créer votre première commande fournisseur
            </div>
          </div>
        ) : filtered.map(cmd => {
          const cfg = STATUS[cmd.status]
          return (
            <div key={cmd.id} onClick={() => setOpenId(cmd.id)}
              style={{ ...card, cursor: 'pointer', borderLeft: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: pc }}>{cmd.numero}</span>
                    <span style={{ background: `${cfg.color}22`, color: cfg.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', border: `1px solid ${cfg.color}44` }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginTop: '3px' }}>
                    🏪 {cmd.fournisseur}
                  </div>
                  {cmd.projetRef && (
                    <div style={{ fontSize: '12px', color: pc, marginTop: '2px' }}>📍 {cmd.projetRef}</div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    PO: {fmtDate(cmd.date)}
                    {cmd.dateLivraison ? ` · Livraison: ${fmtDate(cmd.dateLivraison)}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: pc }}>{cmd.items.length}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>article{cmd.items.length !== 1 ? 's' : ''}</div>
                </div>
              </div>

              {cmd.items.length > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  {cmd.items.slice(0, 3).map(it => (
                    <span key={it.id} style={{ display: 'inline-block', background: 'var(--surface)', borderRadius: '6px', padding: '2px 7px', marginRight: '4px', marginBottom: '3px', fontSize: '11px' }}>
                      {it.name} ×{it.quantite}
                    </span>
                  ))}
                  {cmd.items.length > 3 && <span style={{ fontSize: '11px', color: pc, fontWeight: 700 }}>+{cmd.items.length - 3} autres</span>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => sendEmail(cmd)} style={btnSm('#3b82f6')}>📧 Email</button>
                {cmd.status !== 'recue' && (
                  <button onClick={() => store.markReceived(cmd.id)} style={btnSm('#22c55e')}>✅ Reçue</button>
                )}
                {deleteConfirmId === cmd.id ? (
                  <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                    <button onClick={() => setDeleteConfirmId(null)} style={btnSm('var(--text-muted)')}>Annuler</button>
                    <button onClick={() => { store.deleteCommande(cmd.id); setDeleteConfirmId(null) }}
                      style={{ ...btnSm('#ef4444'), border: '2px solid #ef4444' }}>🗑️ Confirmer</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirmId(cmd.id)} style={{ ...btnSm('#ef4444'), marginLeft: 'auto' }}>🗑️</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
