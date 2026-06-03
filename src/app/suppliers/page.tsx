'use client'

import { useState } from 'react'
import { useSupplierStore, type SupplierCategory } from '@/store/useSupplierStore'

const categories: SupplierCategory[] = ['materials', 'tools', 'safety', 'rental', 'fuel', 'office', 'other']

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore()
  const [form, setForm] = useState({ name: '', category: 'materials' as SupplierCategory, contactName: '', phone: '', email: '', address: '', accountNumber: '', notes: '' })
  const active = suppliers.filter(s => s.active)
  function setField(key: keyof typeof form, value: string) { setForm(f => ({ ...f, [key]: value })) }
  function save() {
    if (!form.name.trim()) return
    addSupplier({ name: form.name.trim(), category: form.category, contactName: form.contactName, phone: form.phone, email: form.email, address: form.address, accountNumber: form.accountNumber, notes: form.notes })
    setForm({ name: '', category: 'materials', contactName: '', phone: '', email: '', address: '', accountNumber: '', notes: '' })
  }
  return <main className="min-h-screen px-4 pb-28 pt-6 text-white"><div className="mx-auto max-w-5xl space-y-4">
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5"><h1 className="text-3xl font-black">🏬 Fournisseurs</h1><p className="mt-2 text-base text-white/65">Liste de fournisseurs pour matériaux, outils, locations, sécurité et commandes.</p></section>
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Ajouter fournisseur</h2><div className="mt-3 grid gap-3 lg:grid-cols-3"><input className="big-field" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Nom fournisseur"/><select className="big-field" value={form.category} onChange={e => setField('category', e.target.value as SupplierCategory)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select><input className="big-field" value={form.contactName} onChange={e => setField('contactName', e.target.value)} placeholder="Contact"/><input className="big-field" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="Téléphone"/><input className="big-field" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="Email"/><input className="big-field" value={form.accountNumber} onChange={e => setField('accountNumber', e.target.value)} placeholder="Compte fournisseur"/><input className="big-field lg:col-span-2" value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Adresse"/><input className="big-field" value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Notes"/><button className="big-button lg:col-span-3" onClick={save}>Ajouter fournisseur</button></div></section>
    <section className="grid gap-3 lg:grid-cols-2">{active.length === 0 ? <p className="text-base text-white/55">Aucun fournisseur.</p> : active.map(s => <div key={s.id} className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-2xl font-black">{s.name}</h2><p className="text-base text-white/65">{s.category} · {s.contactName || 'contact —'}</p><p className="text-sm text-white/55">{s.phone || 'tel —'} · {s.email || 'email —'}</p><p className="text-sm text-white/55">Compte: {s.accountNumber || '—'}</p></div><button className="rounded-xl border border-red-400/30 px-3 py-2 text-red-200" onClick={() => deleteSupplier(s.id)}>Archiver</button></div><div className="mt-3 grid gap-2 md:grid-cols-2"><input className="big-field" value={s.phone || ''} onChange={e => updateSupplier(s.id, { phone: e.target.value })}/><input className="big-field" value={s.email || ''} onChange={e => updateSupplier(s.id, { email: e.target.value })}/></div></div>)}</section>
  </div></main>
}
