'use client'

import { useAISettingsStore, defaultModels, providerLabels, type AIMode, type AIProvider } from '@/store/useAISettingsStore'

const providers: AIProvider[] = ['anthropic', 'openai', 'google_ai_studio', 'deepseek']
const modes: { id: AIMode; title: string; desc: string }[] = [
  { id: 'disabled', title: 'IA désactivée', desc: 'L’application fonctionne sans agent IA.' },
  { id: 'app_limited', title: 'IA de l’application', desc: 'Utilise la configuration serveur de l’application avec limite.' },
  { id: 'bring_your_own_key', title: 'Compte IA du client', desc: 'Le client utilise son propre compte IA via configuration sécurisée serveur.' },
]

export default function AISettingsPage() {
  const { settings, updateSettings } = useAISettingsStore()
  const enabled = settings.mode !== 'disabled' && settings.enabled

  function setProvider(provider: AIProvider) {
    updateSettings({ provider, model: defaultModels[provider] })
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white"><div className="mx-auto max-w-5xl space-y-4">
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5"><h1 className="text-3xl font-black">🤖 Réglages IA</h1><p className="mt-2 text-base text-white/65">L’application peut fonctionner sans IA, avec l’IA de l’application, ou avec le compte IA du client configuré de façon sécurisée.</p></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Mode d’utilisation</h2><div className="mt-3 grid gap-3 md:grid-cols-3">{modes.map(m => <button key={m.id} onClick={() => updateSettings({ mode: m.id, enabled: m.id !== 'disabled' })} className={`rounded-3xl border p-4 text-left ${settings.mode === m.id ? 'border-cyan-300/70 bg-cyan-400/15' : 'border-white/10 bg-black/20'}`}><h3 className="text-xl font-black">{m.title}</h3><p className="mt-1 text-sm text-white/60">{m.desc}</p></button>)}</div></section>

    {enabled && <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Fournisseur IA</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{providers.map(p => <button key={p} onClick={() => setProvider(p)} className={`rounded-3xl border p-4 text-left ${settings.provider === p ? 'border-violet-300/70 bg-violet-400/15' : 'border-white/10 bg-black/20'}`}><h3 className="text-xl font-black">{providerLabels[p]}</h3><p className="mt-1 text-sm text-white/60">Modèle défaut: {defaultModels[p]}</p></button>)}</div><div className="mt-3 grid gap-3 md:grid-cols-2"><input className="big-field" value={settings.model} onChange={e => updateSettings({ model: e.target.value })} placeholder="Modèle IA"/><input className="big-field" inputMode="numeric" value={settings.monthlyLimit} onChange={e => updateSettings({ monthlyLimit: Number(e.target.value) || 0 })} placeholder="Limite mensuelle"/></div></section>}

    {enabled && <section className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4"><h2 className="text-2xl font-black text-amber-100">Configuration des accès</h2><p className="mt-2 text-base text-white/75">Les accès IA doivent être configurés côté serveur ou coffre sécurisé. La page ne sauvegarde pas de secret directement dans Supabase Database.</p><div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/70"><p>Variables serveur prévues:</p><p>ANTHROPIC_API_KEY</p><p>OPENAI_API_KEY</p><p>GOOGLE_AI_STUDIO_API_KEY</p><p>DEEPSEEK_API_KEY</p></div></section>}

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Options agent</h2><div className="mt-3 grid gap-3 md:grid-cols-3"><Toggle label="Analyse photo" value={settings.allowPhotoAnalysis} onChange={v => updateSettings({ allowPhotoAnalysis: v })}/><Toggle label="Voix / dictée" value={settings.allowVoice} onChange={v => updateSettings({ allowVoice: v })}/><Toggle label="Conseil web" value={settings.allowWebAdvice} onChange={v => updateSettings({ allowWebAdvice: v })}/></div></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Résumé</h2><div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-lg font-black">Mode: {modes.find(m => m.id === settings.mode)?.title}</p><p className="mt-1 text-base text-white/65">Fournisseur: {enabled ? providerLabels[settings.provider] : 'Aucun'}</p><p className="mt-1 text-base text-white/65">Modèle: {enabled ? settings.model : 'IA désactivée'}</p><p className="mt-1 text-base text-white/65">Limite: {settings.mode === 'app_limited' ? `${settings.monthlyLimit} demandes/mois` : settings.mode === 'bring_your_own_key' ? 'Selon le compte IA du client' : '0'}</p></div></section>
  </div></main>
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <button onClick={() => onChange(!value)} className={`rounded-2xl border p-3 text-left ${value ? 'border-emerald-300/50 bg-emerald-400/15' : 'border-white/10 bg-black/20'}`}><span className="text-base font-black">{value ? '✅' : '⬜'} {label}</span></button>
}
