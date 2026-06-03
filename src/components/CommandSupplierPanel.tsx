'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSupplierStore } from '@/store/useSupplierStore'
import { useCommandeStore } from '@/store/useCommandeStore'

const today = () => new Date().toISOString().slice(0, 10)

type Mode = 'livraison' | 'cueillette'

export default function CommandSupplierPanel() {
  const pathname = usePathname()
  const suppliers = useSupplierStore(s => s.suppliers.filter(x => x.active))
  const addCommande = useCommandeStore(s => s.addCommande)
  const [supplierId, setSupplierId] = useState('')
  const [mode, setMode] = useState<Mode>('livraison')
  const [project, setProject] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [created, setCreated] = useState('')

  if (pathname !== '/commandes') return null
  const selected = suppliers.find(s => s.id === supplierId)

  function createPO() {
    if (!selected) return
    const cmd = addCommande({
      fournisseur: selected.name,
      fournisseurEmail: selected.email || undefined,
      fournisseurPhone: selected.phone || undefined,
      date: today(),
      dateLivraison: mode === 'livraison' ? (deliveryDate || undefined) : undefined,
      adresseLivraison: mode === 'livraison' ? (address.trim() || undefined) : undefined,
      projetRef: project.trim() || undefined,
      notes: [notes, selected.accountNumber ? `Compte fournisseur: ${selected.accountNumber}` : ''].filter(Boolean).join('\n'),
    })
    setCreated(cmd.numero)
    setProject('')
    setAddress('')
    setDeliveryDate('')
    setNotes('')
  }

  return <section style={{ maxWidth: 1180, margin: '14px auto 110px', padding: '0 16px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 18 }}>
      <h2 style={{ color: 'var(--text)', fontSize: 26, fontWeight: 950 }}>🏬 Nouvelle commande fournisseur</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>Choisis un fournisseur sauvegardé. Le nom, téléphone, email et numéro de compte sont repris automatiquement dans la commande.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginTop: 14 }}>
        <select className="big-field" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
          <option value="">Choisir fournisseur</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} · {s.category}</option>)}
        </select>
        <select className="big-field" value={mode} onChange={e => setMode(e.target.value as Mode)}><option value="livraison">Livraison chantier</option><option value="cueillette">Cueillette magasin</option></select>
        <input className="big-field" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
        <input className="big-field" value={project} onChange={e => setProject(e.target.value)} placeholder="Projet / chantier" />
        <input className="big-field" value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresse livraison" />
        <input className="big-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes commande" />
      </div>

      {selected && <div style={{ marginTop: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 12 }}>
        <b style={{ color: 'var(--text)', fontSize: 17 }}>{selected.name}</b>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{selected.contactName || 'Contact —'} · {selected.phone || 'Téléphone —'} · {selected.email || 'Email —'}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Compte: {selected.accountNumber || '—'}</p>
      </div>}

      <button onClick={createPO} disabled={!selected} style={{ marginTop: 12, width: '100%', minHeight: 56, borderRadius: 16, border: '1px solid var(--border)', background: selected ? 'linear-gradient(135deg,var(--primary),var(--secondary))' : 'var(--surface)', color: selected ? 'white' : 'var(--text-muted)', fontSize: 17, fontWeight: 950 }}>Créer PO avec ce fournisseur</button>
      {created && <p style={{ color: 'var(--success)', fontSize: 15, marginTop: 10, fontWeight: 900 }}>Commande créée: {created}. Ouvre-la dans la liste pour ajouter les articles.</p>}
      {suppliers.length === 0 && <p style={{ color: 'var(--warning)', fontSize: 15, marginTop: 10 }}>Aucun fournisseur sauvegardé. Va dans /suppliers pour en ajouter.</p>}
    </div>
  </section>
}
