'use client'

import { useState } from 'react'
import { useMotivationStore, type MotivationMetric, type MotivationScope, type RewardType } from '@/store/useMotivationStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'

const metrics: MotivationMetric[] = ['revenue', 'hours', 'jobs_completed', 'checklist_done', 'safety_days', 'custom']
const scopes: MotivationScope[] = ['company', 'team', 'individual']
const rewards: RewardType[] = ['lunch', 'draw', 'bonus', 'gift', 'trip', 'custom']
const today = () => new Date().toISOString().slice(0, 10)
const label: Record<string, string> = { company: 'Compagnie', team: 'Équipe', individual: 'Individuel', revenue: 'Revenus', hours: 'Heures', jobs_completed: 'Jobs terminées', checklist_done: 'Checklist complétée', safety_days: 'Jours sécurité', custom: 'Personnalisé', lunch: 'Dîner payé', draw: 'Tirage', bonus: 'Bonus', gift: 'Cadeau', trip: 'Voyage' }

export default function MotivationPage() {
  const { employees } = useEmployeeStore()
  const { teams, goals, addTeam, addGoal, addProgress } = useMotivationStore()
  const workers = employees.filter(e => e.id !== 'admin' && e.active)
  const [teamName, setTeamName] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [goal, setGoal] = useState({ title: 'Objectif compagnie du mois', scope: 'company' as MotivationScope, metric: 'revenue' as MotivationMetric, target: '50000', teamId: '', employeeId: '', rewardType: 'lunch' as RewardType, rewardTitle: 'Dîner payé pour l’équipe', rewardDescription: '', endDate: '' })

  function toggleMember(id: string) { setMemberIds(x => x.includes(id) ? x.filter(v => v !== id) : [...x, id]) }
  function saveTeam() {
    if (!teamName.trim()) return
    addTeam({ name: teamName.trim(), memberIds, color: '#38bdf8' })
    setTeamName('')
    setMemberIds([])
  }
  function saveGoal() {
    if (!goal.title.trim()) return
    addGoal({ title: goal.title, scope: goal.scope, metric: goal.metric, target: Number(goal.target) || 0, startDate: today(), endDate: goal.endDate || undefined, teamId: goal.scope === 'team' ? goal.teamId || undefined : undefined, employeeId: goal.scope === 'individual' ? goal.employeeId || undefined : undefined, rewardType: goal.rewardType, rewardTitle: goal.rewardTitle, rewardDescription: goal.rewardDescription })
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white"><div className="mx-auto max-w-6xl space-y-4">
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5"><h1 className="text-3xl font-black">🏆 Motivation & récompenses</h1><p className="mt-2 text-base text-white/65">Objectifs compagnie, équipes, employés et sous-traitants. Récompenses: dîner, tirage, bonus, cadeau, voyage ou autre.</p></section>

    <section className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Créer une équipe</h2><input className="big-field mt-3" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Nom équipe / crew"/><div className="mt-3 grid gap-2 md:grid-cols-2">{workers.map(w => <button key={w.id} onClick={() => toggleMember(w.id)} className={`rounded-2xl border p-3 text-left ${memberIds.includes(w.id) ? 'border-cyan-300/70 bg-cyan-400/15' : 'border-white/10 bg-black/20'}`}><b>{w.name}</b><p className="text-sm text-white/55">{w.workerType === 'contractor' ? 'Sous-traitant' : 'Employé'}</p></button>)}</div><button className="big-button mt-3 w-full" onClick={saveTeam}>Créer équipe</button></div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Créer un objectif</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><input className="big-field" value={goal.title} onChange={e => setGoal(g => ({ ...g, title: e.target.value }))} placeholder="Titre objectif"/><select className="big-field" value={goal.scope} onChange={e => setGoal(g => ({ ...g, scope: e.target.value as MotivationScope }))}>{scopes.map(s => <option key={s} value={s}>{label[s]}</option>)}</select><select className="big-field" value={goal.metric} onChange={e => setGoal(g => ({ ...g, metric: e.target.value as MotivationMetric }))}>{metrics.map(m => <option key={m} value={m}>{label[m]}</option>)}</select><input className="big-field" value={goal.target} onChange={e => setGoal(g => ({ ...g, target: e.target.value }))} inputMode="decimal" placeholder="Objectif chiffre"/>{goal.scope === 'team' && <select className="big-field" value={goal.teamId} onChange={e => setGoal(g => ({ ...g, teamId: e.target.value }))}><option value="">Choisir équipe</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>}{goal.scope === 'individual' && <select className="big-field" value={goal.employeeId} onChange={e => setGoal(g => ({ ...g, employeeId: e.target.value }))}><option value="">Choisir travailleur</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>}<select className="big-field" value={goal.rewardType} onChange={e => setGoal(g => ({ ...g, rewardType: e.target.value as RewardType }))}>{rewards.map(r => <option key={r} value={r}>{label[r]}</option>)}</select><input className="big-field" value={goal.rewardTitle} onChange={e => setGoal(g => ({ ...g, rewardTitle: e.target.value }))} placeholder="Récompense"/><input className="big-field" type="date" value={goal.endDate} onChange={e => setGoal(g => ({ ...g, endDate: e.target.value }))}/><input className="big-field" value={goal.rewardDescription} onChange={e => setGoal(g => ({ ...g, rewardDescription: e.target.value }))} placeholder="Détails récompense"/><button className="big-button md:col-span-2" onClick={saveGoal}>Publier objectif</button></div></div>
    </section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Objectifs actifs</h2><div className="mt-3 grid gap-3 lg:grid-cols-2">{goals.length === 0 ? <p className="text-base text-white/55">Aucun objectif.</p> : goals.map(g => { const pct = g.target ? Math.min(100, (g.current / g.target) * 100) : 0; const team = teams.find(t => t.id === g.teamId); const emp = workers.find(w => w.id === g.employeeId); return <div key={g.id} className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-2xl font-black">{g.title}</h3><p className="text-base text-white/65">{label[g.scope]} {team ? `· ${team.name}` : emp ? `· ${emp.name}` : ''} · {label[g.metric]}</p><p className="text-sm text-white/55">Récompense: {label[g.rewardType]} — {g.rewardTitle}</p></div><strong className="text-xl text-cyan-300">{pct.toFixed(0)}%</strong></div><div className="mt-3 h-4 rounded-full bg-white/10"><div className="h-4 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${pct}%` }}/></div><p className="mt-2 text-sm text-white/60">{g.current.toFixed(1)} / {g.target.toFixed(1)} · statut {g.status}</p><div className="mt-3 flex flex-wrap gap-2"><button className="rounded-xl border border-cyan-300/30 px-3 py-2 text-cyan-100" onClick={() => addProgress(g.id, 1)}>+1</button><button className="rounded-xl border border-cyan-300/30 px-3 py-2 text-cyan-100" onClick={() => addProgress(g.id, 10)}>+10</button><button className="rounded-xl border border-cyan-300/30 px-3 py-2 text-cyan-100" onClick={() => addProgress(g.id, 100)}>+100</button><button className="rounded-xl border border-cyan-300/30 px-3 py-2 text-cyan-100" onClick={() => addProgress(g.id, 1000)}>+1000</button></div></div>})}</div></section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Équipes</h2><div className="mt-3 grid gap-3 lg:grid-cols-3">{teams.length === 0 ? <p className="text-base text-white/55">Aucune équipe.</p> : teams.map(t => <div key={t.id} className="rounded-3xl border border-white/10 bg-black/20 p-4"><h3 className="text-xl font-black">{t.name}</h3><p className="text-sm text-white/55">{t.memberIds.length} membre(s)</p><ul className="mt-2 text-sm text-white/70">{t.memberIds.map(id => <li key={id}>• {workers.find(w => w.id === id)?.name || id}</li>)}</ul></div>)}</div></section>
  </div></main>
}
