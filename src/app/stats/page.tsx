'use client'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import {
  DecoSeparator,
  DecoCorners,
  DecoTitle,
  DecoOrnament,
  DecoBackground,
  DecoDiamondRow,
  DecoFlower,
  DecoStarRow,
} from '@/components/DecoElements'

export default function StatsPage() {
  const { employees, currentEmployeeId, dayDetails, activeSessions } = useEmployeeStore()
  const { lang } = useLangStore()
  const { themeId } = useThemeStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  // ── Classes animées par thème ─────────────────────────────────────────────
  const isDeco    = themeId === 'deco'
  const isQuantum = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const isXP      = themeId === 'xp'
  const cardClass = isDeco    ? 'deco-card-sweep'    :
                    isQuantum ? 'quantum-card-glow'  :
                    isAventure ? 'aventure-card-glow' : ''

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const now = new Date()
  const currentMonthKey = now.toISOString().slice(0, 7)

  // Calculer stats du mois
  const monthDetails = Object.entries(dayDetails)
    .filter(([key]) => key.startsWith(currentEmployeeId + '-' + currentMonthKey))
    .map(([, detail]) => detail)

  const totalRevenue = monthDetails.reduce((s, d) => s + d.totalRevenue, 0)
  const totalHours   = monthDetails.reduce((s, d) => s + d.totalHours, 0)
  const totalDays    = monthDetails.length
  const bestDay      = monthDetails.reduce(
    (best, d) => d.totalRevenue > (best?.totalRevenue ?? 0) ? d : best,
    monthDetails[0]
  )

  // Données du graphique (30 derniers jours)
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key    = `${currentEmployeeId}-${d.toISOString().split('T')[0]}`
    const detail = dayDetails[key]
    return {
      date:    d.getDate(),
      revenue: detail?.totalRevenue ?? 0,
      hours:   detail?.totalHours   ?? 0,
    }
  })

  const maxRevenue = Math.max(...last30.map(d => d.revenue), 1)

  const card: React.CSSProperties = {
    background:   'var(--card)',
    border:       '1px solid var(--border)',
    borderRadius: '12px',
    padding:      '16px',
    position:     'relative',
    overflow:     'hidden',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '8px' }}>

      {/* Titre */}
      <div style={{ paddingTop: '4px' }}>
        <DecoTitle>{t('STATISTIQUES', 'STATISTICS')}</DecoTitle>
      </div>

      {/* Ornement haut */}
      <DecoOrnament opacity={0.12}/>

      {/* Employé actif */}
      {currentEmployee && (
        <div className={cardClass} style={{ ...card, border: '1px solid var(--primary)33', background: 'var(--primary)08' }}>
          <DecoBackground/>
          <DecoCorners opacity={0.35}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
              background: `radial-gradient(circle at 40% 35%, ${currentEmployee.color}99, ${currentEmployee.color})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 800, color: 'white',
              boxShadow: `0 0 16px ${currentEmployee.color}55`,
            }}>
              {currentEmployee.name[0].toUpperCase()}
            </div>
            <div>
              <p style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 800 }}>{currentEmployee.name}</p>
              <p style={{ color: 'var(--primary)', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 }}>
                ${currentEmployee.hourlyRate}/h · {currentEmployee.workMode}
              </p>
            </div>
            {activeSessions[currentEmployee.id] && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}/>
                <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 700, letterSpacing: '1px' }}>ACTIF</span>
              </div>
            )}
          </div>
        </div>
      )}

      <DecoSeparator opacity={0.2}/>

      {/* Stats du mois — 4 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { emoji: '💰', label: t('Revenue ce mois', 'Revenue this month'), value: formatCurrency(totalRevenue),              color: 'var(--primary)' },
          { emoji: '⏱️', label: t('Heures ce mois',  'Hours this month'),   value: `${totalHours.toFixed(1)}h`,              color: 'var(--info)'    },
          { emoji: '📅', label: t('Jours travaillés', 'Days worked'),        value: `${totalDays}`,                           color: 'var(--success)' },
          { emoji: '🏆', label: t('Meilleure journée','Best day'),           value: formatCurrency(bestDay?.totalRevenue ?? 0), color: '#FFD700'      },
        ].map((stat, i) => (
          <div key={i} className={cardClass} style={card}>
            <DecoBackground/>
            <DecoCorners opacity={0.2}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '22px' }}>{stat.emoji}</span>
              <p style={{ color: stat.color, fontSize: '22px', fontWeight: 900, margin: '6px 0 4px', lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <DecoSeparator opacity={0.2}/>

      {/* Graphique revenus 30 jours */}
      <div className={cardClass} style={card}>
        <DecoBackground/>
        <DecoCorners opacity={0.25}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <DecoTitle>{t('REVENUS QUOTIDIENS', 'DAILY REVENUE')}</DecoTitle>
          <div style={{ height: '8px' }}/>

          {totalRevenue === 0 ? (
            <div style={{ padding: '24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', opacity: 0.2 }}>
                <DecoFlower size={32} opacity={1}/>
                <DecoFlower size={46} opacity={1}/>
                <DecoFlower size={32} opacity={1}/>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>
                {t('Aucune donnée pour ce mois', 'No data for this month')}
              </p>
              <DecoDiamondRow count={7} opacity={0.2}/>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
              {last30.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', height: '100%' }}>
                  <div style={{
                    width: '100%', borderRadius: '2px 2px 0 0',
                    background: d.revenue > 0 ? 'var(--primary)' : 'var(--border)',
                    height: `${Math.max(4, (d.revenue / maxRevenue) * 70)}px`,
                    opacity: d.revenue > 0 ? 1 : 0.3,
                    transition: 'height 0.3s ease',
                  }}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historique sessions */}
      <div className={cardClass} style={card}>
        <DecoBackground/>
        <DecoCorners opacity={0.25}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <DecoTitle>{t('HISTORIQUE SESSIONS', 'SESSION HISTORY')}</DecoTitle>
          <div style={{ height: '8px' }}/>

          {monthDetails.length === 0 ? (
            <div style={{ padding: '20px 0' }}>
              <DecoStarRow count={5}/>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: '12px 0' }}>
                {t('Aucune session enregistrée', 'No sessions recorded')}
              </p>
              <DecoSeparator opacity={0.15}/>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {monthDetails.slice().reverse().slice(0, 10).map((detail, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 700 }}>{detail.date}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      {detail.sessions.length} {t('session(s)', 'session(s)')} · {detail.totalHours.toFixed(1)}h
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <p style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 800 }}>
                      {formatCurrency(detail.totalRevenue)}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                      {formatTimer(detail.totalBreak)} {t('pause', 'break')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ornement de fin */}
      <div style={{ padding: '8px 0' }}>
        <DecoSeparator opacity={0.18}/>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '12px', opacity: 0.15 }}>
          <DecoFlower size={28} opacity={1}/>
          <DecoFlower size={44} opacity={1}/>
          <DecoFlower size={28} opacity={1}/>
        </div>
      </div>
    </div>
  )
}
