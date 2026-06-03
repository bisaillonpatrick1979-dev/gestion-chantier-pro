'use client'

import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'
import { formatCurrency } from '@/lib/formatters'
import { DecoTitle, DecoSeparator } from '@/components/DecoElements'

type Detail = {
  date: string
  employeeId: string
  totalHours: number
  totalRevenue: number
  totalBreak: number
  sessions: unknown[]
}

function pad(n: number) { return String(n).padStart(2, '0') }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function monthKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function period(offset: number, toDay?: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const max = daysInMonth(start.getFullYear(), start.getMonth())
  const end = new Date(start.getFullYear(), start.getMonth(), Math.min(toDay ?? max, max))
  return { start: dateKey(start), end: dateKey(end), key: monthKey(start), label: start.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' }) }
}
function sameMonthLastYear(toDay: number) {
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
function stats(details: Detail[]) {
  const revenue = details.reduce((s, d) => s + (d.totalRevenue || 0), 0)
  const hours = details.reduce((s, d) => s + (d.totalHours || 0), 0)
  const days = details.length
  const sessions = details.reduce((s, d) => s + (d.sessions?.length || 0), 0)
  const breaks = details.reduce((s, d) => s + ((d.totalBreak || 0) / 3600000), 0)
  const best = details.reduce<Detail | null>((b, d) => !b || d.totalRevenue > b.totalRevenue ? d : b, null)
  return {
    revenue,
    hours,
    days,
    sessions,
    breaks,
    avgDay: days ? revenue / days : 0,
    avgHour: hours ? revenue / hours : 0,
    bestRevenue: best?.totalRevenue || 0,
    bestDate: best?.date || '—',
  }
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
function Card({ title, value, sub, color = 'var(--primary)' }: { title: string; value: string; sub?: string; color?: string }) {
  return <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}><p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>{title}</p><p style={{ color, fontSize: 24, fontWeight: 950, marginTop: 6, lineHeight: 1.05 }}>{value}</p>{sub && <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 5, lineHeight: 1.35 }}>{sub}</p>}</div>
}
function Row({ name, now, before, money = false }: { name: string; now: number; before: number; money?: boolean }) {
  const format = (n: number) => money ? formatCurrency(n) : `${n.toFixed(1)}`
  const up = pct(now, before) >= 0
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr .9fr .9fr .7fr', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}><b style={{ color: 'var(--text)', fontSize: 12 }}>{name}</b><span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: 13 }}>{format(now)}</span><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{format(before)}</span><span style={{ color: up ? 'var(--success)' : 'var(--danger)', textAlign: 'right', fontWeight: 900, fontSize: 12 }}>{trend(now, before)}</span></div>
}

export default function StatsPage() {
  const { employees, currentEmployeeId, dayDetails, activeSessions } = useEmployeeStore()
  const { lang } = useLangStore()
  const { themeId } = useThemeStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
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
  const payrollToPay = cur.revenue
  const payrollPaidRecorded = 0
  const payrollTotalExposure = payrollToPay + inProgressPay
  const profitPlaceholder = cur.revenue - payrollTotalExposure
  const cardClass = themeId === 'deco' ? 'deco-card-sweep' : themeId === 'quantum' ? 'quantum-card-glow' : themeId === 'aventure' ? 'aventure-card-glow' : ''
  const monthSeries = Array.from({ length: 6 }, (_, i) => period(i - 5)).map(p => ({ p, s: stats(scoped.filter(d => inside(d.date, p))) }))
  const maxMonth = Math.max(1, ...monthSeries.map(m => m.s.revenue))
  const categories = curDetails.reduce<Record<string, number>>((acc, d) => { const c = dayCategory(d.totalHours || 0); acc[c] = (acc[c] || 0) + 1; return acc }, {})
  const employeeRows = employees.filter(e => e.id !== 'admin' && e.active).map(emp => {
    const nowStats = stats(all.filter(d => d.employeeId === emp.id && inside(d.date, current)))
    const oldStats = stats(all.filter(d => d.employeeId === emp.id && inside(d.date, previous)))
    const live = activeSessions[emp.id]
    return { emp, nowStats, oldStats, livePay: live?.revenue || 0, liveHours: live ? (live.elapsed || 0) / 3600 : 0 }
  }).sort((a, b) => (b.nowStats.revenue + b.livePay) - (a.nowStats.revenue + a.livePay))

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
    <div style={{ paddingTop: 4 }}><DecoTitle>{isAdmin ? t('STATISTIQUES ADMINISTRATION', 'ADMIN STATISTICS') : t('STATISTIQUES EMPLOYÉ', 'EMPLOYEE STATISTICS')}</DecoTitle></div>
    <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.45 }}>{current.label} jusqu’au jour {today}. Comparaison avec {previous.label} à la même date, {previousFull.label} complet et {lastYear.label}.</p>
    <DecoSeparator opacity={0.2}/>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Card title="Revenus enregistrés" value={formatCurrency(cur.revenue)} sub={`${trend(cur.revenue, prev.revenue)} vs mois passé à date`} />
      <Card title="Heures travaillées" value={`${cur.hours.toFixed(1)} h`} sub={`${trend(cur.hours, prev.hours)} vs mois passé à date`} color="var(--info)" />
      <Card title="Jours travaillés" value={`${cur.days}`} sub={`${prev.days} jours mois passé à date`} color="var(--success)" />
      <Card title="Moyenne horaire" value={formatCurrency(cur.avgHour)} sub={`Moyenne/jour: ${formatCurrency(cur.avgDay)}`} color="#FFD166" />
    </div>

    {isAdmin && <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>{t('SUIVI DES PAYES', 'PAYROLL TRACKING')}</DecoTitle><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}><Card title="Payes à payer estimées" value={formatCurrency(payrollToPay)} sub="Journées punchées et terminées ce mois" color="var(--warning)"/><Card title="Payes en cours" value={formatCurrency(inProgressPay)} sub={`${activeIds.length} travailleur(s) punchés · ${inProgressHours.toFixed(1)} h live`} color="var(--info)"/><Card title="Payes versées enregistrées" value={formatCurrency(payrollPaidRecorded)} sub="À brancher au module paiement officiel" color="var(--success)"/><Card title="Exposition totale paie" value={formatCurrency(payrollTotalExposure)} sub="Terminé + en cours" color="var(--danger)"/></div><p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 10, lineHeight: 1.45 }}>Note: les montants de paie utilisent les données actuellement disponibles dans les punchs. Quand le module de paiement officiel sera branché, cette section séparera payé, approuvé, dû, retenu et envoyé.</p></section>}

    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>{t('COMPARAISON DÉTAILLÉE', 'DETAILED COMPARISON')}</DecoTitle><div style={{ display: 'grid', gridTemplateColumns: '1fr .9fr .9fr .7fr', gap: 8, marginTop: 12, color: 'var(--text-muted)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}><span>Mesure</span><span>Ce mois</span><span>Mois passé</span><span style={{ textAlign: 'right' }}>%</span></div><Row name="Revenus" now={cur.revenue} before={prev.revenue} money/><Row name="Heures" now={cur.hours} before={prev.hours}/><Row name="Jours" now={cur.days} before={prev.days}/><Row name="Sessions" now={cur.sessions} before={prev.sessions}/><Row name="Moyenne/jour" now={cur.avgDay} before={prev.avgDay} money/><Row name="Moyenne/h" now={cur.avgHour} before={prev.avgHour} money/><p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.45, marginTop: 12 }}>Mois passé complet: {formatCurrency(prevFull.revenue)} · {prevFull.hours.toFixed(1)} h · {prevFull.days} jours. Même mois l’an passé à date: {formatCurrency(ly.revenue)} · tendance {trend(cur.revenue, ly.revenue)}.</p></section>

    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>{t('TENDANCE 6 MOIS', '6-MONTH TREND')}</DecoTitle><div style={{ height: 116, display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 12 }}>{monthSeries.map(m => <div key={m.p.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}><div style={{ width: '100%', minHeight: 4, height: `${Math.max(4, (m.s.revenue / maxMonth) * 88)}px`, borderRadius: '6px 6px 0 0', background: m.s.revenue ? 'linear-gradient(180deg,var(--primary),var(--secondary))' : 'var(--border)', opacity: m.s.revenue ? 1 : 0.35 }}/><small style={{ color: 'var(--text-muted)', fontSize: 9, textAlign: 'center' }}>{m.p.label.slice(0, 3)}</small></div>)}</div></section>

    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>{t('CALENDRIER ET INTENSITÉ', 'CALENDAR AND INTENSITY')}</DecoTitle><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>{Object.entries(categories).length ? Object.entries(categories).map(([name, count]) => <div key={name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}><b style={{ color: 'var(--text)', fontSize: 13 }}>{name}</b><p style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 900 }}>{count} jour(s)</p></div>) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucune journée travaillée ce mois.</p>}</div><p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>Meilleure journée: {cur.bestDate} · {formatCurrency(cur.bestRevenue)}. Pauses: {cur.breaks.toFixed(1)} h. Sessions: {cur.sessions}.</p></section>

    {isAdmin && <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>{t('DÉTAIL PAR TRAVAILLEUR', 'WORKER DETAIL')}</DecoTitle><div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>{employeeRows.map(({ emp, nowStats, oldStats, livePay, liveHours }) => <div key={emp.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 46, height: 46, borderRadius: '50%', background: emp.color, color: 'white', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18 }}>{emp.name[0]}</div><div style={{ flex: 1 }}><b style={{ color: 'var(--text)', fontSize: 15 }}>{emp.name}</b><p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{emp.role} · {emp.workerType || '—'} · {emp.workMode}</p></div><div style={{ textAlign: 'right' }}><p style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 900 }}>{formatCurrency(nowStats.revenue)}</p><small style={{ color: pct(nowStats.revenue, oldStats.revenue) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 900 }}>{trend(nowStats.revenue, oldStats.revenue)}</small></div></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 8, color: 'var(--text-muted)', fontSize: 11 }}><span>{nowStats.hours.toFixed(1)} h</span><span>{nowStats.days} jours</span><span>{formatCurrency(nowStats.avgHour)}/h</span><span>Live {formatCurrency(livePay)} · {liveHours.toFixed(1)} h</span></div></div>)}</div></section>}

    {isAdmin && <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>{t('SUIVI ADMIN À COMPLÉTER', 'ADMIN TRACKING TO COMPLETE')}</DecoTitle><div style={{ display: 'grid', gap: 8, marginTop: 10, color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.45 }}><p>□ Brancher les factures clients pour revenus réels facturés, payé, balance et retard.</p><p>□ Brancher le module paiement pour marquer les payes versées, approuvées, refusées ou retenues.</p><p>□ Brancher dépenses et matériaux pour calculer marge brute exacte.</p><p>□ Ajouter export comptable: paies, factures, taxes, dépenses et sous-traitants.</p></div></section>}

    <section className={cardClass} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}><DecoTitle>{t('HISTORIQUE RÉCENT', 'RECENT HISTORY')}</DecoTitle><div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>{curDetails.slice().reverse().slice(0, 12).map((d, idx) => <div key={`${d.employeeId}-${d.date}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}><div><p style={{ color: 'var(--text)', fontSize: 13, fontWeight: 800 }}>{d.date}</p><p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{d.sessions.length} session(s) · {d.totalHours.toFixed(1)} h · {dayCategory(d.totalHours)}</p></div><div style={{ textAlign: 'right' }}><p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 900 }}>{formatCurrency(d.totalRevenue)}</p><p style={{ color: 'var(--text-muted)', fontSize: 10 }}>{((d.totalBreak || 0) / 3600000).toFixed(1)} h pause</p></div></div>)}{curDetails.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Aucune donnée pour la période.</p>}</div></section>
  </div>
}
