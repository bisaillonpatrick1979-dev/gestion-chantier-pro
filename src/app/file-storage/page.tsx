'use client'

import { useFileStorageStore, type FileStorageProvider, fileStorageRuleText } from '@/store/useFileStorageStore'

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

export default function FileStoragePage() {
  const { settings, files, updateSettings } = useFileStorageStore()
  return <main className="min-h-screen px-4 pb-28 pt-6 text-white"><div className="mx-auto max-w-5xl space-y-4">
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5"><h1 className="text-3xl font-black">☁️ Stockage fichiers lourds</h1><p className="mt-2 text-base text-white/65">Photos, reçus, signatures et PDF doivent être sauvegardés hors Supabase Database. La base garde seulement les liens et métadonnées.</p></section>

    <section className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-4"><h2 className="text-2xl font-black text-emerald-200">Règle de sécurité espace</h2><p className="mt-2 text-base text-emerald-100">{fileStorageRuleText(settings.provider)}</p><p className="mt-2 text-sm text-white/60">Politique forcée: metadata_only. On ne sauvegarde pas les fichiers lourds en base64 dans Supabase Database.</p></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Choisir le cloud</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{providers.map(p => <button key={p.id} onClick={() => updateSettings({ provider: p.id })} className={`rounded-3xl border p-4 text-left ${settings.provider === p.id ? 'border-cyan-300/70 bg-cyan-400/15' : 'border-white/10 bg-black/20'}`}><b className="text-xl">{p.label}</b><p className="mt-1 text-sm text-white/60">{p.desc}</p></button>)}</div></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Options</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.savePhotos} onChange={e => updateSettings({ savePhotos: e.target.checked })}/> <b> Sauvegarder photos chantier</b></label><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.saveReceipts} onChange={e => updateSettings({ saveReceipts: e.target.checked })}/> <b> Sauvegarder reçus/bills</b></label><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.saveGeneratedPdfs} onChange={e => updateSettings({ saveGeneratedPdfs: e.target.checked })}/> <b> Sauvegarder PDF générés</b></label><label className="rounded-2xl border border-white/10 bg-black/20 p-3"><input type="checkbox" checked={settings.compressPhotos} onChange={e => updateSettings({ compressPhotos: e.target.checked })}/> <b> Compresser photos</b></label><input className="big-field" value={settings.rootFolderName} onChange={e => updateSettings({ rootFolderName: e.target.value })} placeholder="Nom dossier racine"/><input className="big-field" value={settings.maxPhotoWidth} onChange={e => updateSettings({ maxPhotoWidth: Number(e.target.value) || 1600 })} inputMode="numeric" placeholder="Largeur max photo"/></div></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Références de fichiers</h2><p className="mt-2 text-base text-white/65">Ici on gardera seulement les références: nom, type, lien/chemin, taille et projet relié.</p><p className="mt-2 text-xl font-black text-cyan-300">{files.length} fichier(s) référencé(s)</p></section>
  </div></main>
}
