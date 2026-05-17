'use client'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { formatTimer } from '@/lib/formatters'

interface Props {
  elapsed: number
  revenue: number
  onConfirm: () => void
  onCancel: () => void
}

export default function PunchOutConfirmModal({ elapsed, revenue, onConfirm, onCancel }: Props) {
  const { themeId } = useThemeStore()
  const { lang }    = useLangStore()
  const isXP        = themeId === 'xp'
  const t           = (fr: string, en: string) => lang === 'fr' ? fr : en

  const formattedRevenue = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(revenue)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <style>{`
        @keyframes poc_bounce {
          0%   { transform: scale(0.4) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(6deg); opacity: 1; }
          80%  { transform: scale(0.95) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes poc_slide {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .poc-icon { animation: poc_bounce 0.55s cubic-bezier(.36,.07,.19,.97) both; }
        .poc-card { animation: poc_slide 0.35s ease-out both; }
      `}</style>

      <div className="poc-card" style={{
        background: isXP ? 'rgba(14,5,30,0.99)' : 'var(--surface)',
        border: `2px solid ${isXP ? 'rgba(239,68,68,0.55)' : 'var(--border)'}`,
        borderRadius: '24px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        boxShadow: isXP
          ? '0 0 60px rgba(239,68,68,0.25), 0 20px 60px rgba(0,0,0,0.6)'
          : '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Icône animée */}
        <div className="poc-icon" style={{ fontSize: '64px', marginBottom: '16px', lineHeight: 1 }}>
          🚪
        </div>

        {/* Titre */}
        <h2 style={{
          color: isXP ? '#f87171' : 'var(--text)',
          fontSize: '22px', fontWeight: 900,
          marginBottom: '8px', letterSpacing: '1px',
        }}>
          {t('Pointer la sortie ?', 'Punch Out?')}
        </h2>

        <p style={{
          color: isXP ? '#6b7280' : 'var(--text-muted)',
          fontSize: '13px', marginBottom: '28px', lineHeight: 1.5,
        }}>
          {t(
            'Es-tu sûr de vouloir terminer ta session de travail ?',
            'Are you sure you want to end your work session?'
          )}
        </p>

        {/* Stats session */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            background: isXP ? 'rgba(168,85,247,0.12)' : 'var(--card)',
            border: `1px solid ${isXP ? 'rgba(168,85,247,0.35)' : 'var(--border)'}`,
            borderRadius: '14px', padding: '16px',
          }}>
            <p style={{
              color: isXP ? '#6b7280' : 'var(--text-muted)',
              fontSize: '10px', fontWeight: 800,
              letterSpacing: '1.5px', marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              {t('⏱ Temps', '⏱ Time')}
            </p>
            <p style={{
              color: isXP ? '#a855f7' : 'var(--primary)',
              fontSize: '22px', fontWeight: 900, fontFamily: 'monospace',
            }}>
              {formatTimer(elapsed)}
            </p>
          </div>

          <div style={{
            background: isXP ? 'rgba(34,197,94,0.1)' : 'var(--card)',
            border: `1px solid ${isXP ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
            borderRadius: '14px', padding: '16px',
          }}>
            <p style={{
              color: isXP ? '#6b7280' : 'var(--text-muted)',
              fontSize: '10px', fontWeight: 800,
              letterSpacing: '1.5px', marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              {t('💰 Revenus', '💰 Revenue')}
            </p>
            <p style={{
              color: '#22c55e',
              fontSize: revenue >= 1000 ? '16px' : '20px',
              fontWeight: 900, fontFamily: 'monospace',
            }}>
              {formattedRevenue}
            </p>
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button onClick={onCancel} style={{
            padding: '16px', borderRadius: '14px', cursor: 'pointer',
            border: `1px solid ${isXP ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
            background: 'transparent',
            color: isXP ? '#a855f7' : 'var(--text-muted)',
            fontSize: '14px', fontWeight: 700,
            transition: 'all 0.15s',
          }}>
            {t('← Rester', '← Stay')}
          </button>

          <button onClick={onConfirm} style={{
            padding: '16px', borderRadius: '14px', cursor: 'pointer',
            border: 'none',
            background: isXP
              ? 'linear-gradient(135deg, #b91c1c, #ef4444)'
              : 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: 'white',
            fontSize: '14px', fontWeight: 900,
            letterSpacing: '0.5px',
            boxShadow: isXP ? '0 0 20px rgba(239,68,68,0.4)' : '0 4px 16px rgba(239,68,68,0.3)',
            transition: 'all 0.15s',
          }}>
            {t('Pointer 🚪', 'Punch 🚪')}
          </button>
        </div>
      </div>
    </div>
  )
}
