'use client'
import { useWorkStore } from '@/store/useWorkStore'
import { useThemeStore } from '@/store/useThemeStore'
import { DAY_STATUS_CONFIG } from '@/types'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import { useLangStore } from '@/store/useLangStore'

export default function StatsPage() {
  const { dayRecords, sessions, currentMonth } = useWorkStore()
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  const monthRecords = Object.entries(dayRecords).filter(
    ([date]) => date.startsWith(currentMonth)
  )

  const totalRevenue = monthRecords.reduce((sum, [, r]) => sum + (r.revenue || 0), 0)
  const totalHours = monthRecords.reduce((sum, [, r]) => sum + (r.hours || 0), 0)
  const workedDays = monthRecords.filter(([, r]) =>
    r.status !== 'empty' && r.status !== 'vacation'
  ).length
  const bestDay = Math.max(...monthRecords.map(([, r]) => r.revenue || 0), 0)
  const maxRevenue = Math.max(...monthRecords.map(([, r]) => r.revenue || 0), 1)
  const last10 = [...(sessions || [])].reverse().slice(0, 10)

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
  }

  const summaryCards = [
    { label: t('Revenus ce mois', 'Revenue this month'), value: formatCurrency(totalRevenue), color: theme.colors.secondary, icon: '💰' },
    { label: t('Heures ce mois', 'Hours this month'),  value: `${totalHours.toFixed(1)}h`,  color: theme.colors.primary,   icon: '⏱' },
    { label: t('Jours travaillés', 'Days worked'),value: `${workedDays}`,              color: theme.colors.primaryLight,icon: '📅' },
    { label: t('Meilleure journée', 'Best day'),value: formatCurrency(bestDay),     color: '#22c55e',               icon: '🏆' },
  ]

  const statusTotals = Object.keys(DAY_STATUS_CONFIG)
    .filter(s => s !== 'empty')
    .map(status => ({
      status,
      config: DAY_STATUS_CONFIG[status as keyof typeof DAY_STATUS_CONFIG],
      count: monthRecords.filter(([, r]) => r.status === status).length,
      revenue: monthRecords
        .filter(([, r]) => r.status === status)
        .reduce((sum, [, r]) => sum + (r.revenue || 0), 0),
    }))
    .filter(s => s.count > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <h1 style={{
        color: theme.colors.primary, fontSize: '14px',
        letterSpacing: '3px', fontWeight: '700'
      }}>
        {t('📈 STATISTIQUES', '📈 STATISTICS')}
      </h1>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {summaryCards.map(c => (
          <div key={c.label} style={card}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{c.icon}</div>
            <div style={{ color: c.color, fontSize: '18px', fontWeight: '800' }}>
              {c.value}
            </div>
            <div style={{ color: theme.colors.textMuted, fontSize: '11px', marginTop: '4px' }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* BAR CHART */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700', marginBottom: '16px'
        }}>
          {t('REVENUS PAR JOUR', 'DAILY REVENUE')}
        </p>
        {monthRecords.length === 0 ? (
          <p style={{ color: theme.colors.textMuted, textAlign: 'center', fontSize: '14px' }}>
            {t('Aucune donnée pour ce mois', 'No data for this month')}
          </p>
        ) : (
          <div style={{
            display: 'flex', gap: '4px', alignItems: 'flex-end',
            overflowX: 'auto', minHeight: '140px', paddingBottom: '8px'
          }}>
            {monthRecords.map(([date, record]) => {
              const height = Math.max(((record.revenue || 0) / maxRevenue) * 120, 4)
              const config = DAY_STATUS_CONFIG[record.status as keyof typeof DAY_STATUS_CONFIG]
              return (
                <div key={date} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '4px', minWidth: '32px'
                }}>
                  <div
                    title={formatCurrency(record.revenue || 0)}
                    style={{
                      width: '24px', height: `${height}px`,
                      background: config?.color || theme.colors.primary,
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <span style={{ color: theme.colors.textMuted, fontSize: '10px' }}>
                    {date.slice(8)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* STATUS BREAKDOWN */}
      {statusTotals.length > 0 && (
        <div style={card}>
          <p style={{
            color: theme.colors.primary, fontSize: '11px',
            letterSpacing: '2px', fontWeight: '700', marginBottom: '12px'
          }}>
            {t('RÉPARTITION PAR STATUT', 'BREAKDOWN BY STATUS')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {statusTotals.map(({ status, config, count, revenue }) => (
              <div key={status}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: '4px'
                }}>
                  <span style={{ color: theme.colors.text, fontSize: '13px' }}>
                    {config.emoji} {config.label} ({count}j)
                  </span>
                  <span style={{ color: config.color, fontSize: '13px', fontWeight: '700' }}>
                    {formatCurrency(revenue)}
                  </span>
                </div>
                <div style={{
                  background: theme.colors.surface,
                  borderRadius: '4px', height: '6px'
                }}>
                  <div style={{
                    width: `${totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0}%`,
                    height: '100%', background: config.color, borderRadius: '4px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SESSION HISTORY */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700', marginBottom: '12px'
        }}>
          {t('HISTORIQUE DES SESSIONS', 'SESSION HISTORY')}
        </p>
        {last10.length === 0 ? (
          <p style={{ color: theme.colors.textMuted, textAlign: 'center', fontSize: '14px' }}>
            {t('Aucune session enregistrée', 'No sessions recorded')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {last10.map((session, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.colors.border}`,
                paddingBottom: '8px',
              }}>
                <div>
                  <div style={{ color: theme.colors.text, fontSize: '13px' }}>
                    {new Date(session.startTime).toLocaleDateString('fr-CA')}
                  </div>
                  <div style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                    {formatTimer(session.elapsed || 0)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    color: theme.colors.secondary,
                    fontSize: '13px', fontWeight: '700'
                  }}>
                    {formatCurrency(session.revenue || 0)}
                  </div>
                  <div style={{
                    color: theme.colors.primary, fontSize: '10px',
                    textTransform: 'uppercase', letterSpacing: '1px'
                  }}>
                    {session.mode}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
