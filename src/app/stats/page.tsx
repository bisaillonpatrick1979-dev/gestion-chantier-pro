'use client'

import { useMemo, useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useAccountingStore } from '@/store/useAccountingStore'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'
import { formatCurrency } from '@/lib/formatters'
import { DecoTitle, DecoSeparator } from '@/components/DecoElements'
import type { Employee } from '@/types/employee'

type Detail = {
  date: string
  employeeId: string
  totalHours: number
  totalRevenue: number
  totalBreak: number
  sessions: unknown[]
}

type StatsTab = 'company' | 'employees' | 'contractors' | 'all'

type Period = { start: string; end: string; key: string; label: string }

type BasicStats = {
  revenue: number
  hours: number
  days: number
  sessions: number
  breaks: number
  avgDay: number
  avgHour: number
  bestRevenue: number
  bestDate: string
}

function pad(n: number) { return String(n).padStart(2, '0') }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function monthKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function period(offset: number, toDay?: number): Period {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const max = daysInMonth(start.getFullYear(), start.getMonth())
  const end = new Date(start.getFullYear(), start.getMonth(), Math.min(toDay ?? max, max))
  return { start: dateKey(start), end: dateKey(end), key: monthKey(start), label: start.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' }) }
}
function sameMonthLastYear(toDay: number): Period {
  const now = new Date()
  const start = new Date(now.getFullYear() - 1, now.getMonth(), 1)
  const max = daysInMonth(start.getFullYear(), start.getMonth())
  const end = new Date(start.getFullYear(), start.getMonth(), Math.min(toDay, max))
  return { start: dateKey(start), end: dateKey(end), key: monthKey(start), label: start.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' }) }
}
function inside(d: string, p: { start: string; end: string }) { return d >= p.start && d <= p.end }
function pct(now: number, before: number) {
  if (before === 0 && now === 0) return 0
  if (before === 0) return 100
  return ((now - before) / before) * 100
}
function trend(now: number, before: number) {
  const v = pct(now, before)
  return `${v >= 0 ? '↗ +' : '↘ '}${v.toFixed(1)}%`
}
function stats(details: Detail[]): BasicStats {
  const revenue = details.reduce((s, d) => s + (d.totalRevenue || 0), 0)
  const hours = details.reduce((s, d) => s + (d.totalHours || 0), 0)
  const days = details.length
  const sessions = details.reduce((s, d) => s + (d.sessions?.length || 0), 0)
  const breaks = details.reduce((s, d) => s + ((d.totalBreak || 0) / 3600000), 0)
  const best = details.reduce<Detail | null>((b, d) => !b || d.totalRevenue > b.totalRevenue ? d : b, null)
  return { revenue, hours, days, sessions, breaks, avgDay: days ? revenue / days : 0, avgHour: hours ? revenue / hours : 0, bestRevenue: best?.totalRevenue || 0, bestDate: best?.date || '—' }
}
function dayCategory(h: number) {
  if (h <= 2) return 'Très petite'
  if (h <= 4) return 'Petite'
  if (h <= 6) return 'Courte'
  if (h <= 8) return 'Normale'
  if (h <= 10) return 'Grosse'
  if (h <= 12) return 'Très grosse'
  return 'Explosive'
}
function profileLabel(emp: Employee) {
  if (emp.workerType === 'contractor') return emp.accessProfile === 'self_employed' ? 'Travailleur autonome' : 'Sous-traitant'
  if (emp.role === 'accountant') return 'Comptable'
  if (emp.role === 'secretary') return 'Secrétaire'
  return 'Employé salarié'
}

export default function StatsPage() {
  const { employees, currentEmployeeId, dayDetails, activeSessions } = useEmployeeStore()
  const { payrollPayments } = useAccountingStore()
  const { lang } = useLangStore()
  const { themeId } = useThemeStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const [tab, setTab] = useState<StatsTab>('company')
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const activeEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = !activeEmployee || activeEmployee.role === 'admin' || activeEmployee.role === 'accountant'
  const today = new Date().getDate()
  const current = period(0, today)
  const previous = period(-1, today)
  const previousFull = period(-1)
  const lastYear = sameMonthLastYear(today)
  const all = Object.values(dayDetails) as Detail[]
  const scoped = isAdmin ? all : all.filter(d => d.employeeId === currentEmployeeId)
  const curDetails = scoped.filter(d => inside(d.date, current))
  const prevDetails = scoped.filter(d => inside(d.date, previous))
  const prevFullDetails = scoped.filter(d => inside(d.date, previousFull))
  const lastYearDetails = scoped.filter(d => inside(d.date, lastYear))
  const cur = stats(curDetails)
  const prev = stats(prevDetails)
  const prevFull = stats(prevFullDetails)
  const ly = stats(lastYearDetails)
  const activeIds = Object.keys(activeSessions)
  const inProgressPay = activeIds.reduce((s, id) => s + (activeSessions[id]?.revenue || 0), 0)
  const inProgressHours = activeIds.reduce((s, id) => s + ((activeSessions[id]?.elapsed || 0) / 3600), 0)
  const cardClass = themeId === 'deco' ? 'deco-card-sweep' : themeId === 'quantum' ? 'quantum-card-glow' : themeId === 'aventure' ? 'aventure-card-glow' : ''
  const monthSeries = Array.from({ length: 6 }, (_, i) => period(i - 5)).map(p => ({ p, s: stats(scoped.filter(d => inside(d.date, p))) }))
  const maxMonth = Math.max(1, ...monthSeries.map(m => m.s.revenue))
  const categories = curDetails.reduce<Record<string, number>>((acc, d) => { const c = dayCategory(d.totalHours || 0); acc[c] = (acc[c] || 0) + 1; return acc }, {})

  const fieldWorkers = employees.filter(e => e.id !== 'admin' && e.role === 'employee' && e.workerType === 'salaried' && e.active)
  const contractors = employees.filter(e => e.id !== 'admin' && e.workerType === 'contractor' && e.active)
  const allWorkers = employees.filter(e => e.id !== 'admin' && e.active && (e.role === 'employee' || e.role === 'accountant' || e.role === 'secretary'))
  const tabWorkers = tab === 'employees' ? fieldWorkers : tab === 'contractors' ? contractors : allWorkers
  const selectedWorker = tabWorkers.find(e => e.id === selectedWorkerId) || tabWorkers[0]

  const workerRows = useMemo(() => allWorkers.map(emp => {
    const nowStats = stats(all.filter(d => d.employeeId === emp.id && inside(d.date, current)))
    const oldStats = stats(all.filter(d => d.employeeId === emp.id && inside(d.date, previous)))
    const live = activeSessions[emp.id]
    const payroll = payrollPayments.filter(p => p.employeeId === emp.id && inside(p.periodEnd, current))
    const paid = payroll.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
    const due = payroll.filter(p => p.status !== 'paid' && p.status !== 'refused').reduce((s, p) => s + p.amount, 0)
    return { emp, nowStats, oldStats, livePay: live?.revenue || 0, liveHours: live ? (live.elapsed || 0) / 3600 : 0, paid, due }
  }).sort((a, b) => (b.nowStats.revenue + b.livePay) - (a.nowStats.revenue + a.livePay)), [allWorkers, all, current, previous, activeSessions, payrollPayments])

  const selectedWorkerStats = selectedWorker ? buildWorkerStats(selectedWorker.id, all, payrollPayments, activeSessions, current, previous, previousFull, lastYear) : null

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
    <div style={{ paddingTop: 4 }}><DecoTitle>{isAdmin ? t('STATISTIQUES ADMINISTRATION', 'ADMIN STATISTICS') : t('STATISTIQUES EMPLOYÉ', 'EMPLOYEE STATISTICS')}</DecoTitle></div>
    <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.45 }}>{current.label} jusqu’au jour {today}. Comparaison avec {previous.label} à la même date, {previousFull.label} complet et {lastYear.label}.</p>
    <DecoSeparator opacity={0.2}/>

    {isAdmin && <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        <TabButton active={tab === 'company'} label="Compagnie" sub="Vue globale" onClick={() => setTab('company')} />
        <TabButton active={tab === 'employees'} label="Employés" sub={`${fieldWorkers.length} salarié(s)`} onClick={() => { setTab('employees'); setSelectedWorkerId('') }} />
        <TabButton active={tab === 'contractors'} label="Sous-traitants" sub={`${contractors.length} profil(s)`} onClick={() => { setTab('contractors'); setSelectedWorkerId('') }} />
        <TabButton active={tab === 'all'} label="Tous" sub={`${allWorkers.length} travailleur(s)`} onClick={() => { setTab('all'); setSelectedWorkerId('') }} />
      </div>
    </section>}

    {(!isAdmin || tab === 'company') && <CompanyStats cardClass={cardClass} cur={cur} prev={prev} prevFull={prevFull} ly={ly} monthSeries={monthSeries} maxMonth={maxMonth} categories={categories} curDetails={curDetails} activeIds={activeIds} inProgressPay={inProgressPay} inProgressHours={inProgressHours} isAdmin={isAdmin} />}

    {isAdmin && tab !== 'company' && <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
      <DecoTitle>{tab === 'employees' ? 'STATISTIQUES EMPLOYÉS' : tab === 'contractors' ? 'STATISTIQUES SOUS-TRAITANTS' : 'STATISTIQUES TOUS LES TRAVAILLEURS'}</DecoTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,.9fr) minmax(0,1.4fr)', gap: 12, marginTop: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabWorkers.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Aucun profil dans cet onglet.</p>}
          {tabWorkers.map(emp => {
            const row = workerRows.find(r => r.emp.id === emp.id)
            const selected = selectedWorker?.id === emp.id
            return <button key={emp.id} onClick={() => setSelectedWorkerId(emp.id)} style={{ textAlign: 'left', padding: 12, borderRadius: 14, border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`, background: selected ? 'var(--primary)18' : 'var(--surface)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 46, height: 46, borderRadius: '50%', background: emp.color, color: 'white', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20 }}>{emp.name[0]}</div><div style={{ minWidth: 0 }}><b style={{ color: 'var(--text)', fontSize: 18 }}>{emp.name}</b><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{profileLabel(emp)}</p></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, color: 'var(--text-muted)', fontSize: 13 }}><span>{formatCurrency(row?.nowStats.revenue || 0)}</span><span>{(row?.nowStats.hours || 0).toFixed(1)} h</span><span>Payé {formatCurrency(row?.paid || 0)}</span><span>Dû {formatCurrency(row?.due || 0)}</span></div>
            </button>
          })}
        </div>
        {selectedWorker && selectedWorkerStats && <WorkerPersonalStats emp={selectedWorker} data={selectedWorkerStats} cardClass={cardClass} />}
      </div>
    </section>}
  </div>
}

function buildWorkerStats(workerId: string, all: Detail[], payrollPayments: ReturnType<typeof useAccountingStore.getState>['payrollPayments'], activeSessions: ReturnType<typeof useEmployeeStore.getState>['activeSessions'], current: Period, previous: Period, previousFull: Period, lastYear: Period) {
  const curDetails = all.filter(d => d.employeeId === workerId && inside(d.date, current))
  const prevDetails = all.filter(d => d.employeeId === workerId && inside(d.date, previous))
  const prevFullDetails = all.filter(d => d.employeeId === workerId && inside(d.date, previousFull))
  const lastYearDetails = all.filter(d => d.employeeId === workerId && inside(d.date, lastYear))
  const cur = stats(curDetails)
  const prev = stats(prevDetails)
  const prevFull = stats(prevFullDetails)
  const ly = stats(lastYearDetails)
  const payroll = payrollPayments.filter(p => p.employeeId === workerId && inside(p.periodEnd, current))
  const paid = payroll.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const due = payroll.filter(p => p.status !== 'paid' && p.status !== 'refused').reduce((s, p) => s + p.amount, 0)
  const held = payroll.filter(p => p.status === 'held').reduce((s, p) => s + p.amount, 0)
  const refused = payroll.filter(p => p.status === 'refused').reduce((s, p) => s + p.amount, 0)
  const live = activeSessions[workerId]
  return { cur, prev, prevFull, ly, curDetails, paid, due, held, refused, livePay: live?.revenue || 0, liveHours: live ? (live.elapsed || 0) / 3600 : 0 }
}

function CompanyStats({ cardClass, cur, prev, prevFull, ly, monthSeries, maxMonth, categories, curDetails, activeIds, inProgressPay, inProgressHours, isAdmin }: any) {
  return <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Card title="Revenus enregistrés" value={formatCurrency(cur.revenue)} sub={`${trend(cur.revenue, prev.revenue)} vs mois passé à date`} />
      <Card title="Heures travaillées" value={`${cur.hours.toFixed(1)} h`} sub={`${trend(cur.hours, prev.hours)} vs mois passé à date`} color="var(--info)" />
      <Card title="Jours travaillés" value={`${cur.days}`} sub={`${prev.days} jours mois passé à date`} color="var(--success)" />
      <Card title="Moyenne horaire" value={formatCurrency(cur.avgHour)} sub={`Moyenne/jour: ${formatCurrency(cur.avgDay)}`} color="#FFD166" />
    </div>
    {isAdmin && <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>SUIVI DES PAYES</DecoTitle><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}><Card title="Payes à payer estimées" value={formatCurrency(cur.revenue)} sub="Journées punchées et terminées ce mois" color="var(--warning)"/><Card title="Payes en cours" value={formatCurrency(inProgressPay)} sub={`${activeIds.length} travailleur(s) punchés · ${inProgressHours.toFixed(1)} h live`} color="var(--info)"/><Card title="Exposition totale paie" value={formatCurrency(cur.revenue + inProgressPay)} sub="Terminé + en cours" color="var(--danger)"/><Card title="Moyenne paie/jour" value={formatCurrency(cur.avgDay)} sub="Selon punchs terminés" color="var(--success)"/></div></section>}
    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>COMPARAISON DÉTAILLÉE</DecoTitle><HeaderRow/><Row name="Revenus" now={cur.revenue} before={prev.revenue} money/><Row name="Heures" now={cur.hours} before={prev.hours}/><Row name="Jours" now={cur.days} before={prev.days}/><Row name="Sessions" now={cur.sessions} before={prev.sessions}/><Row name="Moyenne/jour" now={cur.avgDay} before={prev.avgDay} money/><Row name="Moyenne/h" now={cur.avgHour} before={prev.avgHour} money/><p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.45, marginTop: 12 }}>Mois passé complet: {formatCurrency(prevFull.revenue)} · {prevFull.hours.toFixed(1)} h · {prevFull.days} jours. Même mois l’an passé à date: {formatCurrency(ly.revenue)} · tendance {trend(cur.revenue, ly.revenue)}.</p></section>
    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>TENDANCE 6 MOIS</DecoTitle><div style={{ height: 116, display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 12 }}>{monthSeries.map((m: any) => <div key={m.p.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}><div style={{ width: '100%', minHeight: 4, height: `${Math.max(4, (m.s.revenue / maxMonth) * 88)}px`, borderRadius: '6px 6px 0 0', background: m.s.revenue ? 'linear-gradient(180deg,var(--primary),var(--secondary))' : 'var(--border)', opacity: m.s.revenue ? 1 : 0.35 }}/><small style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>{m.p.label.slice(0, 3)}</small></div>)}</div></section>
    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>CALENDRIER ET INTENSITÉ</DecoTitle><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>{Object.entries(categories).length ? Object.entries(categories).map(([name, count]) => <div key={name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}><b style={{ color: 'var(--text)', fontSize: 15 }}>{name}</b><p style={{ color: 'var(--primary)', fontSize: 22, fontWeight: 900 }}>{String(count)} jour(s)</p></div>) : <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Aucune journée travaillée ce mois.</p>}</div><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>Meilleure journée: {cur.bestDate} · {formatCurrency(cur.bestRevenue)}. Pauses: {cur.breaks.toFixed(1)} h. Sessions: {cur.sessions}.</p></section>
    <HistorySection cardClass={cardClass} details={curDetails} />
  </>
}

function WorkerPersonalStats({ emp, data, cardClass }: { emp: Employee; data: ReturnType<typeof buildWorkerStats>; cardClass: string }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 60, height: 60, borderRadius: '50%', background: emp.color, color: 'white', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 950 }}>{emp.name[0]}</div><div><h2 style={{ color: 'var(--text)', fontSize: 26, fontWeight: 950 }}>{emp.name}</h2><p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{profileLabel(emp)} · {emp.workMode} · taux: {formatCurrency(emp.hourlyRate)}</p></div></div></section>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><Card title="Revenus / paye ce mois" value={formatCurrency(data.cur.revenue)} sub={`${trend(data.cur.revenue, data.prev.revenue)} vs mois passé`} /><Card title="Heures ce mois" value={`${data.cur.hours.toFixed(1)} h`} sub={`${trend(data.cur.hours, data.prev.hours)} vs mois passé`} color="var(--info)"/><Card title="Payé enregistré" value={formatCurrency(data.paid)} sub={`Dû: ${formatCurrency(data.due)} · Retenu: ${formatCurrency(data.held)}`} color="var(--success)"/><Card title="Live / en cours" value={formatCurrency(data.livePay)} sub={`${data.liveHours.toFixed(1)} h en cours`} color="#FFD166"/></div>
    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>COMPARAISON PERSONNELLE</DecoTitle><HeaderRow/><Row name="Revenus" now={data.cur.revenue} before={data.prev.revenue} money/><Row name="Heures" now={data.cur.hours} before={data.prev.hours}/><Row name="Jours" now={data.cur.days} before={data.prev.days}/><Row name="Moyenne/jour" now={data.cur.avgDay} before={data.prev.avgDay} money/><Row name="Moyenne/h" now={data.cur.avgHour} before={data.prev.avgHour} money/><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>Mois passé complet: {formatCurrency(data.prevFull.revenue)} · {data.prevFull.hours.toFixed(1)} h. Même mois l’an passé: {formatCurrency(data.ly.revenue)} · {trend(data.cur.revenue, data.ly.revenue)}.</p></section>
    <HistorySection cardClass={cardClass} details={data.curDetails} />
  </div>
}

function Card({ title, value, sub, color = 'var(--primary)' }: { title: string; value: string; sub?: string; color?: string }) {
  return <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}><p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase' }}>{title}</p><p style={{ color, fontSize: 28, fontWeight: 950, marginTop: 6, lineHeight: 1.05 }}>{value}</p>{sub && <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6, lineHeight: 1.35 }}>{sub}</p>}</div>
}
function TabButton({ active, label, sub, onClick }: { active: boolean; label: string; sub: string; onClick: () => void }) { return <button onClick={onClick} style={{ textAlign: 'left', borderRadius: 14, padding: 12, border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`, background: active ? 'var(--primary)18' : 'var(--surface)' }}><b style={{ color: 'var(--text)', fontSize: 17 }}>{label}</b><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{sub}</p></button> }
function HeaderRow() { return <div style={{ display: 'grid', gridTemplateColumns: '1fr .9fr .9fr .7fr', gap: 8, marginTop: 12, color: 'var(--text-muted)', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}><span>Mesure</span><span>Ce mois</span><span>Mois passé</span><span style={{ textAlign: 'right' }}>%</span></div> }
function Row({ name, now, before, money = false }: { name: string; now: number; before: number; money?: boolean }) { const format = (n: number) => money ? formatCurrency(n) : `${n.toFixed(1)}`; const up = pct(now, before) >= 0; return <div style={{ display: 'grid', gridTemplateColumns: '1fr .9fr .9fr .7fr', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}><b style={{ color: 'var(--text)', fontSize: 15 }}>{name}</b><span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: 15 }}>{format(now)}</span><span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{format(before)}</span><span style={{ color: up ? 'var(--success)' : 'var(--danger)', textAlign: 'right', fontWeight: 900, fontSize: 14 }}>{trend(now, before)}</span></div> }
function HistorySection({ cardClass, details }: { cardClass: string; details: Detail[] }) { return <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>HISTORIQUE RÉCENT</DecoTitle><div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>{details.slice().reverse().slice(0, 12).map((d, idx) => <div key={`${d.employeeId}-${d.date}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}><div><p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 800 }}>{d.date}</p><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{d.sessions.length} session(s) · {d.totalHours.toFixed(1)} h · {dayCategory(d.totalHours)}</p></div><div style={{ textAlign: 'right' }}><p style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 900 }}>{formatCurrency(d.totalRevenue)}</p><p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{((d.totalBreak || 0) / 3600000).toFixed(1)} h pause</p></div></div>)}{details.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 15, textAlign: 'center', padding: 20 }}>Aucune donnée pour la période.</p>}</div></section> }
