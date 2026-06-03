'use client'

import { useState } from 'react'
import { useFileStorageStore, type FileKind, type FileStorageProvider, fileStorageRuleText } from '@/store/useFileStorageStore'

const providers: Array<{ id: FileStorageProvider; label: string; desc: string }> = [
  { id: 'manual', label: 'Manuel / partage appareil', desc: 'L’utilisateur choisit où sauvegarder avec le partage du téléphone/tablette.' },
  { id: 'google_drive', label: 'Google Drive', desc: 'Photos, reçus et PDF dans Drive; Supabase garde seulement les liens.' },
  { id: 'apple_icloud', label: 'Apple iCloud', desc: 'Bon choix pour iPhone/iPad et sauvegarde Apple.' },
  { id: 'samsung_cloud', label: 'Samsung Cloud', desc: 'Bon choix pour appareils Samsung.' },
  { id: 'supabase_storage', label: 'Supabase Storage', desc: 'Fichiers dans Storage, jamais dans Database.' },
  { id: 'one_drive', label: 'OneDrive', desc: 'Option Microsoft/Office.' },
  { id: 'dropbox', label: 'Dropbox', desc: 'Option cloud externe.' },
  { id: 'custom', label: 'Cloud personnalisé', desc: 'Pour un lien ou fournisseur configuré plus tard.' },
]
const kinds: FileKind[] = ['photo', 'receipt', 'invoice_pdf', 'contract_pdf', 'quote_pdf', 'signature', 'other']
const kindLabel: Record<FileKind, string> = { photo: 'Photo chantier', receipt: 'Reçu / bill', invoice_pdf: 'Facture PDF', contract_pdf: 'Contrat PDF', quote_pdf: 'Devis PDF', signature: 'Signature', other: 'Autre' }

export default function FileStoragePage() {
  const { settings, files, updateSettings, addFileReference, removeFileReference } = useFileStorageStore()
  const [ref, setRef] = useState({ kind: 'photo' as FileKind, fileName: '', externalUrl: '', externalPath: '', notes: '', linkedProjectId: '', linkedDocumentId: '' })
  function saveReference() {
    if (!ref.fileName.trim() && !ref.externalUrl.trim() && !ref.externalPath.trim()) return
    addFileReference({ kind: ref.kind, fileName: ref.fileName || ref.externalUrl || ref.externalPath, provider: settings.provider, externalUrl: ref.externalUrl || undefined, externalPath: ref.externalPath || undefined, linkedProjectId: ref.linkedProjectId || undefined, linkedDocumentId: ref.linkedDocumentId || undefined, notes: ref.notes || undefined })
    setRef({ kind: 'photo', fileName: '', externalUrl: '', externalPath: '', notes: '', linkedProjectId: '', linkedDocumentId: '' })
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white"><div className="mx-auto max-w-5xl space-y-4">
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5"><h1 className="text-3xl font-black">☁️ Stockage fichiers lourds</h1><p className="mt-2 text-base text-white/65">Photos, reçus, signatures et PDF doivent être sauvegardés hors Supabase Database. La base garde seulement les liens et métadonnées.</p></section>

    <section className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-4"><h2 className="text-2xl font-black text-emerald-200">Règle de sécurité espace</h2><p className="mt-2 text-base text-emerald-100">{fileStorageRuleText(settings.provider)}</p><p className="mt-2 text-sm text-white/60">Politique forcée: metadata_only. On ne sauvegarde pas les fichiers lourds en base64 dans Supabase Database.</p></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Choisir le cloud</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{providers.map(p => <button key={p.id} onClick={() => updateSettings({ provider: p.id })} className={`rounded-3xl border p-4 text-left ${settings.provider === p.id ? 'border-cyan-300/70 bg-cyan-400/15' : 'border-white/10 bg-black/20'}`}><b className="text-xl">{p.label}</b><p className="mt-1 text-sm text-white/60">{p.desc}</p></button>)}</div></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Options</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.savePhotos} onChange={e => updateSettings({ savePhotos: e.target.checked })}/> <b> Sauvegarder photos chantier</b></label><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.saveReceipts} onChange={e => updateSettings({ saveReceipts: e.target.checked })}/> <b> Sauvegarder reçus/bills</b></label><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.saveGeneratedPdfs} onChange={e => updateSettings({ saveGeneratedPdfs: e.target.checked })}/> <b> Sauvegarder PDF générés</b></label><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.compressPhotos} onChange={e => updateSettings({ compressPhotos: e.target.checked })}/> <b> Compresser photos</b></label><input className="big-field" value={settings.rootFolderName} onChange={e => updateSettings({ rootFolderName: e.target.value })} placeholder="Nom dossier racine"/><input className="big-field" value={settings.maxPhotoWidth} onChange={e => updateSettings({ maxPhotoWidth: Number(e.target.value) || 1600 })} inputMode="numeric" placeholder="Largeur max photo"/></div></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Ajouter une référence de fichier</h2><p className="mt-2 text-sm text-white/60">Utilise ça quand un PDF/photo/reçu est déjà sauvegardé dans ton cloud. On garde seulement le lien ou le chemin.</p><div className="mt-3 grid gap-3 md:grid-cols-2"><select className="big-field" value={ref.kind} onChange={e => setRef(r => ({ ...r, kind: e.target.value as FileKind }))}>{kinds.map(k => <option key={k} value={k}>{kindLabel[k]}</option>)}</select><input className="big-field" value={ref.fileName} onChange={e => setRef(r => ({ ...r, fileName: e.target.value }))} placeholder="Nom fichier"/><input className="big-field md:col-span-2" value={ref.externalUrl} onChange={e => setRef(r => ({ ...r, externalUrl: e.target.value }))} placeholder="Lien cloud / URL"/><input className="big-field md:col-span-2" value={ref.externalPath} onChange={e => setRef(r => ({ ...r, externalPath: e.target.value }))} placeholder="Chemin dossier/fichier"/><input className="big-field" value={ref.linkedProjectId} onChange={e => setRef(r => ({ ...r, linkedProjectId: e.target.value }))} placeholder="Projet lié"/><input className="big-field" value={ref.linkedDocumentId} onChange={e => setRef(r => ({ ...r, linkedDocumentId: e.target.value }))} placeholder="Document/facture lié"/><input className="big-field md:col-span-2" value={ref.notes} onChange={e => setRef(r => ({ ...r, notes: e.target.value }))} placeholder="Notes"/><button className="big-button md:col-span-2" onClick={saveReference}>Enregistrer référence seulement</button></div></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Références de fichiers</h2><p className="mt-2 text-base text-white/65">Ici on garde seulement les références: nom, type, lien/chemin, taille et projet relié.</p><p className="mt-2 text-xl font-black text-cyan-300">{files.length} fichier(s) référencé(s)</p><div className="mt-3 grid gap-2">{files.map(f => <div key={f.id} className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-start justify-between gap-3"><div><b className="text-lg">{kindLabel[f.kind]} · {f.fileName}</b><p className="text-sm text-white/60">{f.provider} · {f.externalPath || f.externalUrl || 'aucun lien'}</p>{f.notes && <p className="text-sm text-white/50">{f.notes}</p>}</div><button className="rounded-xl border border-red-400/30 px-3 py-2 text-red-200" onClick={() => removeFileReference(f.id)}>Retirer</button></div></div>)}</div></section>
  </div></main>
}
