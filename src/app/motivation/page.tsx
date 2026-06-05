'use client'

import { useState } from 'react'
import { useMotivationStore, type GoalStatus, type MotivationGoal, type MotivationMetric, type MotivationScope, type RewardType } from '@/store/useMotivationStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useLangStore } from '@/store/useLangStore'

const metrics: MotivationMetric[] = ['revenue', 'hours', 'jobs_completed', 'checklist_done', 'safety_days', 'custom']
const scopes: MotivationScope[] = ['company', 'team', 'individual']
const rewards: RewardType[] = ['lunch', 'draw', 'bonus', 'gift', 'trip', 'custom']
const statuses: GoalStatus[] = ['active', 'paused', 'achieved', 'cancelled']

const labelBi: Record<string, [string, string]> = {
  company:        ['Compagnie',           'Company'],
  team:           ['Équipe',              'Team'],
  individual:     ['Individuel',          'Individual'],
  revenue:        ['Revenus',             'Revenue'],
  hours:          ['Heures',              'Hours'],
  jobs_completed: ['Jobs terminées',      'Jobs Completed'],
  checklist_done: ['Checklist complétée', 'Checklist Done'],
  safety_days:    ['Jours sécurité',      'Safety Days'],
  custom:         ['Personnalisé',        'Custom'],
  lunch:          ['Dîner payé',          'Paid Lunch'],
  draw:           ['Tirage',              'Draw'],
  bonus:          ['Bonus',               'Bonus'],
  gift:           ['Cadeau',              'Gift'],
  trip:           ['Voyage',              'Trip'],
  active:         ['Actif',               'Active'],
  paused:         ['Pause',               'Paused'],
  achieved:       ['Atteint',             'Achieved'],
  cancelled:      ['Annulé',              'Cancelled'],
}

const today = () => new Date().toISOString().slice(0, 10)

type Draft = {
  title: string
  scope: MotivationScope
  metric: MotivationMetric
  target: string
  teamId: string
  employeeId: string
  rewardType: RewardType
  rewardTitle: string
  rewardDescription: string
  endDate: string
}

function goalToDraft(g: MotivationGoal): Draft {
  return { title: g.title, scope: g.scope, metric: g.metric, target: String(g.target), teamId: g.teamId || '', employeeId: g.employeeId || '', rewardType: g.rewardType, rewardTitle: g.rewardTitle, rewardDescription: g.rewardDescription || '', endDate: g.endDate || '' }
}

const emptyDraft: Draft = { title: 'Objectif compagnie du mois', scope: 'company', metric: 'revenue', target: '50000', teamId: '', employeeId: '', rewardType: 'lunch', rewardTitle: "Dîner payé pour l'équipe", rewardDescription: '', endDate: '' }

export default function MotivationPage() {
  const { employees } = useEmployeeStore()
  const { teams, goals, addTeam, addGoal, updateGoal, addProgress, setProgress, resetProgress, deleteGoal } = useMotivationStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const lbl = (key: string) => lang === 'fr' ? (labelBi[key]?.[0] || key) : (labelBi[key]?.[1] || key)

  const workers = employees.filter(e => e.id !== 'admin' && e.active)
  const [teamName, setTeamName] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [goal, setGoal] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState('')
  const [editDraft, setEditDraft] = useState<Draft | null>(null)
  const [progressInput, setProgressInput] = useState<Record<string, string>>({})

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
    setGoal(emptyDraft)
  }
  function startEdit(g: MotivationGoal) { setEditingId(g.id); setEditDraft(goalToDraft(g)) }
  function saveEdit(g: MotivationGoal) {
    if (!editDraft) return
    updateGoal(g.id, { title: editDraft.title, scope: editDraft.scope, metric: editDraft.metric, target: Number(editDraft.target) || 0, endDate: editDraft.endDate || undefined, teamId: editDraft.scope === 'team' ? editDraft.teamId || undefined : undefined, employeeId: editDraft.scope === 'individual' ? editDraft.employeeId || undefined : undefined, rewardType: editDraft.rewardType, rewardTitle: editDraft.rewardTitle, rewardDescription: editDraft.rewardDescription })
    setEditingId('')
    setEditDraft(null)
  }
  function applyExact(id: string) {
    const value = Number(progressInput[id])
    if (!Number.isFinite(value)) return
    setProgress(id, value)
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white"><div className="mx-auto max-w-6xl space-y-4">
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h1 className="text-3xl font-black">🏆 {t('Motivation & récompenses', 'Motivation & Rewards')}</h1>
      <p className="mt-2 text-base text-white/65">
        {t(
          'Objectifs compagnie, équipes, employés et sous-traitants. Les objectifs, récompenses et montants sont modifiables.',
          'Company, team, employee and subcontractor goals. Objectives, rewards and amounts are editable.'
        )}
      </p>
    </section>

    <section className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-2xl font-black">{t('Créer une équipe', 'Create a team')}</h2>
        <input className="big-field mt-3" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder={t('Nom équipe / crew', 'Team / crew name')}/>
        <div className="mt-3 grid gap-2 md:grid-cols-2">{workers.map(w => <button key={w.id} onClick={() => toggleMember(w.id)} className={`rounded-2xl border p-3 text-left ${memberIds.includes(w.id) ? 'border-cyan-300/70 bg-cyan-400/15' : 'border-white/10 bg-black/20'}`}><b>{w.name}</b><p className="text-sm text-white/55">{w.workerType === 'contractor' ? t('Sous-traitant', 'Subcontractor') : t('Employé', 'Employee')}</p></button>)}</div>
        <button className="big-button mt-3 w-full" onClick={saveTeam}>{t('Créer équipe', 'Create team')}</button>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-2xl font-black">{t('Créer un objectif', 'Create a goal')}</h2>
        <GoalForm draft={goal} setDraft={setGoal} teams={teams} workers={workers} lang={lang} lbl={lbl} t={t}/>
        <button className="big-button mt-3 w-full" onClick={saveGoal}>{t('Publier objectif', 'Publish goal')}</button>
      </div>
    </section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-2xl font-black">{t('Objectifs', 'Goals')}</h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">{goals.length === 0
        ? <p className="text-base text-white/55">{t('Aucun objectif.', 'No goals.')}</p>
        : goals.map(g => {
          const pct = g.target ? Math.min(100, (g.current / g.target) * 100) : 0
          const team = teams.find(t2 => t2.id === g.teamId)
          const emp = workers.find(w => w.id === g.employeeId)
          const isEditing = editingId === g.id && editDraft
          return <div key={g.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            {!isEditing
              ? <><div className="flex items-start justify-between gap-3"><div><h3 className="text-2xl font-black">{g.title}</h3><p className="text-base text-white/65">{lbl(g.scope)} {team ? `· ${team.name}` : emp ? `· ${emp.name}` : ''} · {lbl(g.metric)}</p><p className="text-sm text-white/55">{t('Récompense', 'Reward')}: {lbl(g.rewardType)} — {g.rewardTitle}</p>{g.rewardDescription && <p className="mt-1 text-sm text-amber-100">{g.rewardDescription}</p>}</div><strong className="text-xl text-cyan-300">{pct.toFixed(0)}%</strong></div><div className="mt-3 h-4 rounded-full bg-white/10"><div className="h-4 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${pct}%` }}/></div><p className="mt-2 text-base text-white/75">{t('Progression', 'Progress')}: <b>{g.current.toFixed(1)}</b> / {g.target.toFixed(1)} · {lbl(g.status)}</p></>
              : <><h3 className="text-xl font-black">{t("Modifier l'objectif", 'Edit goal')}</h3><GoalForm draft={editDraft} setDraft={setEditDraft as any} teams={teams} workers={workers} lang={lang} lbl={lbl} t={t}/><button className="big-button mt-3 w-full" onClick={() => saveEdit(g)}>{t('Sauvegarder modifications', 'Save changes')}</button></>}
            <div className="mt-3 grid gap-2 md:grid-cols-2"><input className="big-field" value={progressInput[g.id] ?? ''} onChange={e => setProgressInput(p => ({ ...p, [g.id]: e.target.value }))} inputMode="decimal" placeholder={t('Montant exact', 'Exact amount')}/><button className="rounded-xl border border-cyan-300/30 px-3 py-2 font-black text-cyan-100" onClick={() => applyExact(g.id)}>{t('Mettre exact', 'Set exact')}</button></div>
            <div className="mt-3 flex flex-wrap gap-2"><SmallBtn onClick={() => addProgress(g.id, -1000)}>-1000</SmallBtn><SmallBtn onClick={() => addProgress(g.id, -100)}>-100</SmallBtn><SmallBtn onClick={() => addProgress(g.id, -10)}>-10</SmallBtn><SmallBtn onClick={() => addProgress(g.id, -1)}>-1</SmallBtn><SmallBtn onClick={() => addProgress(g.id, 1)}>+1</SmallBtn><SmallBtn onClick={() => addProgress(g.id, 10)}>+10</SmallBtn><SmallBtn onClick={() => addProgress(g.id, 100)}>+100</SmallBtn><SmallBtn onClick={() => addProgress(g.id, 1000)}>+1000</SmallBtn></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <SmallBtn onClick={() => isEditing ? (setEditingId(''), setEditDraft(null)) : startEdit(g)}>{isEditing ? t('Annuler édition', 'Cancel edit') : t('Modifier objectif/récompense', 'Edit goal/reward')}</SmallBtn>
              <SmallBtn onClick={() => resetProgress(g.id)}>{t('Reset progression', 'Reset progress')}</SmallBtn>
              {statuses.map(s => <SmallBtn key={s} onClick={() => updateGoal(g.id, { status: s })}>{lbl(s)}</SmallBtn>)}
              <button className="rounded-xl border border-red-400/30 px-3 py-2 font-black text-red-200" onClick={() => deleteGoal(g.id)}>{t('Supprimer', 'Delete')}</button>
            </div>
          </div>
        })
      }</div>
    </section>

    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-2xl font-black">{t('Équipes', 'Teams')}</h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">{teams.length === 0
        ? <p className="text-base text-white/55">{t('Aucune équipe.', 'No teams.')}</p>
        : teams.map(t2 => <div key={t2.id} className="rounded-3xl border border-white/10 bg-black/20 p-4"><h3 className="text-xl font-black">{t2.name}</h3><p className="text-sm text-white/55">{t2.memberIds.length} {t('membre(s)', 'member(s)')}</p><ul className="mt-2 text-sm text-white/70">{t2.memberIds.map(id => <li key={id}>• {workers.find(w => w.id === id)?.name || id}</li>)}</ul></div>)
      }</div>
    </section>
  </div></main>
}

type GoalFormProps = { draft: Draft; setDraft: (d: Draft | ((x: Draft) => Draft)) => void; teams: Array<{ id: string; name: string }>; workers: Array<{ id: string; name: string }>; lang: 'fr' | 'en'; lbl: (k: string) => string; t: (fr: string, en: string) => string }

function GoalForm({ draft, setDraft, teams, workers, lang, lbl, t }: GoalFormProps) {
  return <div className="mt-3 grid gap-3 md:grid-cols-2">
    <input className="big-field" value={draft.title} onChange={e => setDraft(g => ({ ...g, title: e.target.value }))} placeholder={t('Titre objectif', 'Goal title')}/>
    <select className="big-field" value={draft.scope} onChange={e => setDraft(g => ({ ...g, scope: e.target.value as MotivationScope }))}>{scopes.map(s => <option key={s} value={s}>{lbl(s)}</option>)}</select>
    <select className="big-field" value={draft.metric} onChange={e => setDraft(g => ({ ...g, metric: e.target.value as MotivationMetric }))}>{metrics.map(m => <option key={m} value={m}>{lbl(m)}</option>)}</select>
    <input className="big-field" value={draft.target} onChange={e => setDraft(g => ({ ...g, target: e.target.value }))} inputMode="decimal" placeholder={t('Objectif chiffre', 'Target number')}/>
    {draft.scope === 'team' && <select className="big-field" value={draft.teamId} onChange={e => setDraft(g => ({ ...g, teamId: e.target.value }))}><option value="">{t('Choisir équipe', 'Choose team')}</option>{teams.map(t2 => <option key={t2.id} value={t2.id}>{t2.name}</option>)}</select>}
    {draft.scope === 'individual' && <select className="big-field" value={draft.employeeId} onChange={e => setDraft(g => ({ ...g, employeeId: e.target.value }))}><option value="">{t('Choisir travailleur', 'Choose worker')}</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>}
    <select className="big-field" value={draft.rewardType} onChange={e => setDraft(g => ({ ...g, rewardType: e.target.value as RewardType }))}>{rewards.map(r => <option key={r} value={r}>{lbl(r)}</option>)}</select>
    <input className="big-field" value={draft.rewardTitle} onChange={e => setDraft(g => ({ ...g, rewardTitle: e.target.value }))} placeholder={t('Récompense', 'Reward')}/>
    <input className="big-field" type="date" value={draft.endDate} onChange={e => setDraft(g => ({ ...g, endDate: e.target.value }))}/>
    <input className="big-field" value={draft.rewardDescription} onChange={e => setDraft(g => ({ ...g, rewardDescription: e.target.value }))} placeholder={t('Détails récompense', 'Reward details')}/>
  </div>
}

function SmallBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button className="rounded-xl border border-cyan-300/30 px-3 py-2 font-black text-cyan-100" onClick={onClick}>{children}</button>
}
