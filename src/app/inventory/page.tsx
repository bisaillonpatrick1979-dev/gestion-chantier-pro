'use client'

import { useMemo, useState } from 'react'
import { useInventoryStore, type InventoryCategory, type InventoryMovementType, type InventoryUnit } from '@/store/useInventoryStore'
import { formatCurrency } from '@/lib/formatters'

const categories: InventoryCategory[] = ['siding', 'soffit', 'fascia', 'roofing', 'fasteners', 'sealants', 'tools', 'safety', 'other']
const units: InventoryUnit[] = ['pcs', 'box', 'bundle', 'roll', 'pail', 'tube', 'sqft', 'linear_ft']
const todayText = () => new Date().toLocaleDateString('fr-CA')

export default function InventoryPage() {
  const { items, movements, addItem, updateItem, deleteItem, moveStock } = useInventoryStore()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<InventoryCategory>('siding')
  const [unit, setUnit] = useState<InventoryUnit>('pcs')
  const [location, setLocation] = useState('Entrepôt principal')
  const [supplier, setSupplier] = useState('')
  const [quantity, setQuantity] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [reorderQuantity, setReorderQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [filter, setFilter] = useState('all')

  const lowItems = items.filter(i => i.quantity - i.reserved <= i.minQuantity)
  const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0)
  const reservedValue = items.reduce((s, i) => s + i.reserved * i.unitCost, 0)
  const visibleItems = useMemo(() => filter === 'all' ? items : filter === 'low' ? lowItems : items.filter(i => i.category === filter), [items, filter, lowItems])

  function createItem() {
    const qty = Number(quantity)
    const min = Number(minQuantity)
    const reorder = Number(reorderQuantity)
    const cost = Number(unitCost)
    if (!name.trim()) return
    addItem({ name: name.trim(), category, unit, location, supplier: supplier.trim() || undefined, quantity: Number.isFinite(qty) ? qty : 0, minQuantity: Number.isFinite(min) ? min : 0, reorderQuantity: Number.isFinite(reorder) ? reorder : 0, unitCost: Number.isFinite(cost) ? cost : 0, notes: '' })
    setName('')
    setQuantity('')
    setMinQuantity('')
    setReorderQuantity('')
    setUnitCost('')
    setSupplier('')
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white">
    <div className="mx-auto max-w-6xl space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-3xl font-black">📦 Inventaire entrepôt</h1>
        <p className="mt-2 text-base text-white/65">Stock réel disponible, sorties chantier, entrées fournisseur, réservations et alertes de réapprovisionnement. Séparé du catalogue de prix.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Metric title="Valeur stock" value={formatCurrency(totalValue)} sub={`${items.length} produits suivis`} />
        <Metric title="Stock réservé" value={formatCurrency(reservedValue)} sub="Matériel réservé pour jobs" />
        <Metric title="Alertes bas stock" value={`${lowItems.length}`} sub="À recommander bientôt" danger={lowItems.length > 0} />
        <Metric title="Dernière mise à jour" value={todayText()} sub={`${movements.length} mouvements enregistrés`} />
      </section>

      {lowItems.length > 0 && <section className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4">
        <h2 className="text-2xl font-black text-amber-200">⚠️ Alertes réapprovisionnement</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">{lowItems.map(i => <div key={i.id} className="rounded-2xl border border-amber-400/20 bg-black/20 p-3"><b className="text-lg">{i.name}</b><p className="text-base text-amber-100">Disponible: {i.quantity - i.reserved} {i.unit} · minimum: {i.minQuantity}</p><p className="text-sm text-white/60">Recommander: {i.reorderQuantity} {i.unit} · Fournisseur: {i.supplier || '—'}</p></div>)}</div>
      </section>}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-2xl font-black">Ajouter un produit en stock</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-4">
          <input className="big-field" value={name} onChange={e => setName(e.target.value)} placeholder="Nom du produit" />
          <select className="big-field" value={category} onChange={e => setCategory(e.target.value as InventoryCategory)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select className="big-field" value={unit} onChange={e => setUnit(e.target.value as InventoryUnit)}>{units.map(u => <option key={u} value={u}>{u}</option>)}</select>
          <input className="big-field" value={location} onChange={e => setLocation(e.target.value)} placeholder="Emplacement" />
          <input className="big-field" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Fournisseur" />
          <input className="big-field" value={quantity} onChange={e => setQuantity(e.target.value)} inputMode="decimal" placeholder="Quantité actuelle" />
          <input className="big-field" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} inputMode="decimal" placeholder="Seuil minimum" />
          <input className="big-field" value={reorderQuantity} onChange={e => setReorderQuantity(e.target.value)} inputMode="decimal" placeholder="Qté à recommander" />
          <input className="big-field" value={unitCost} onChange={e => setUnitCost(e.target.value)} inputMode="decimal" placeholder="Coût unitaire CAD" />
          <button className="big-button lg:col-span-3" onClick={createItem}>Ajouter à l’inventaire</button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Stock actuel</h2><select className="big-field max-w-xs" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tout voir</option><option value="low">Bas stock seulement</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">{visibleItems.length === 0 ? <p className="text-base text-white/55">Aucun produit dans l’inventaire.</p> : visibleItems.map(item => <InventoryCard key={item.id} item={item} updateItem={updateItem} deleteItem={deleteItem} moveStock={moveStock} />)}</div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-2xl font-black">Mouvements récents</h2>
        <div className="mt-3 space-y-2">{movements.slice(0, 20).map(m => <div key={m.id} className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-start justify-between gap-2"><div><b className="text-lg">{m.itemName}</b><p className="text-sm text-white/60">{m.type} · {m.jobName || '—'} · {new Date(m.createdAt).toLocaleString('fr-CA')}</p><p className="text-sm text-white/55">{m.note || 'Aucune note'}</p></div><strong className="text-xl text-cyan-300">{m.quantity}</strong></div></div>)}{movements.length === 0 && <p className="text-base text-white/55">Aucun mouvement enregistré.</p>}</div>
      </section>
    </div>
  </main>
}

function Metric({ title, value, sub, danger }: { title: string; value: string; sub: string; danger?: boolean }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-base font-black text-white/65">{title}</p><p className={`mt-2 text-3xl font-black ${danger ? 'text-amber-300' : 'text-cyan-300'}`}>{value}</p><p className="mt-1 text-base text-white/65">{sub}</p></div>
}

function InventoryCard({ item, updateItem, deleteItem, moveStock }: any) {
  const [qty, setQty] = useState('')
  const [job, setJob] = useState('')
  const [note, setNote] = useState('')
  const available = item.quantity - item.reserved
  const low = available <= item.minQuantity
  function move(type: InventoryMovementType) {
    const n = Number(qty)
    if (!n || n <= 0) return
    moveStock({ itemId: item.id, type, quantity: n, jobName: job || undefined, note: note || undefined })
    setQty('')
    setJob('')
    setNote('')
  }
  return <div className={`rounded-3xl border p-4 ${low ? 'border-amber-400/35 bg-amber-400/10' : 'border-white/10 bg-black/20'}`}>
    <div className="flex items-start justify-between gap-3"><div><h3 className="text-2xl font-black">{item.name}</h3><p className="text-base text-white/65">{item.category} · {item.location} · {item.supplier || 'fournisseur —'}</p></div><button className="rounded-xl border border-red-400/30 px-3 py-2 text-red-200" onClick={() => deleteItem(item.id)}>Supprimer</button></div>
    <div className="mt-3 grid grid-cols-2 gap-2"><Metric title="En stock" value={`${item.quantity} ${item.unit}`} sub={`Dispo ${available}`} danger={low}/><Metric title="Valeur" value={formatCurrency(item.quantity * item.unitCost)} sub={`${formatCurrency(item.unitCost)} / ${item.unit}`} /></div>
    <div className="mt-3 grid gap-2 md:grid-cols-3"><input className="big-field" value={qty} onChange={e => setQty(e.target.value)} inputMode="decimal" placeholder="Quantité"/><input className="big-field" value={job} onChange={e => setJob(e.target.value)} placeholder="Job / chantier"/><input className="big-field" value={note} onChange={e => setNote(e.target.value)} placeholder="Note"/></div>
    <div className="mt-3 flex flex-wrap gap-2"><button className="big-button" onClick={() => move('in')}>Entrée stock</button><button className="big-button" onClick={() => move('out')}>Sortie chantier</button><button className="big-button" onClick={() => move('reserved')}>Réserver</button><button className="big-button" onClick={() => move('returned')}>Retour</button><button className="big-button" onClick={() => move('adjust')}>Ajuster exact</button></div>
    <div className="mt-3 grid gap-2 md:grid-cols-3"><input className="big-field" value={item.minQuantity} onChange={e => updateItem(item.id, { minQuantity: Number(e.target.value) || 0 })} inputMode="decimal"/><input className="big-field" value={item.reorderQuantity} onChange={e => updateItem(item.id, { reorderQuantity: Number(e.target.value) || 0 })} inputMode="decimal"/><input className="big-field" value={item.unitCost} onChange={e => updateItem(item.id, { unitCost: Number(e.target.value) || 0 })} inputMode="decimal"/></div>
  </div>
}
