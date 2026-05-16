'use client'

// ── Filigrane centré sur tous les documents ───────────────────────────────────
// Usage: <DocumentWatermark type="FACTURE" logoUrl={company.logoUrl} companyName={company.name} />

export type WatermarkType = 'FACTURE' | 'DEVIS' | 'CONTRAT' | 'COMMANDE' | 'FACTURE EMPLOYÉ'

interface DocumentWatermarkProps {
  type: WatermarkType
  logoUrl?: string
  companyName?: string
  employeeName?: string
  opacity?: number
}

const TYPE_COLORS: Record<WatermarkType, string> = {
  'FACTURE':         '#D4AF37',
  'DEVIS':           '#3b82f6',
  'CONTRAT':         '#22c55e',
  'COMMANDE':        '#f97316',
  'FACTURE EMPLOYÉ': '#a855f7',
}

export default function DocumentWatermark({
  type,
  logoUrl,
  companyName = '',
  employeeName,
  opacity = 0.07,
}: DocumentWatermarkProps) {
  const color = TYPE_COLORS[type]

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Cercle de fond */}
      <div style={{
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        border: `3px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        gap: '8px',
        padding: '20px',
      }}>
        {/* Logo ou initiales */}
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              borderRadius: '8px',
              marginBottom: '4px',
            }}
          />
        ) : (
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            fontWeight: 900,
            color: '#000',
            marginBottom: '4px',
          }}>
            {companyName ? companyName[0].toUpperCase() : 'H'}
          </div>
        )}

        {/* Nom compagnie */}
        <div style={{
          fontSize: '13px',
          fontWeight: 800,
          color,
          textAlign: 'center',
          letterSpacing: '1px',
          lineHeight: 1.2,
        }}>
          {companyName}
        </div>

        {/* Nom employé si applicable */}
        {employeeName && (
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color,
            textAlign: 'center',
            letterSpacing: '0.5px',
          }}>
            {employeeName}
          </div>
        )}

        {/* Ligne séparatrice */}
        <div style={{
          width: '80%',
          height: '1px',
          background: color,
          margin: '2px 0',
        }}/>

        {/* Type de document */}
        <div style={{
          fontSize: '16px',
          fontWeight: 900,
          color,
          textAlign: 'center',
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
          {type}
        </div>
      </div>

      {/* Motif répété en arrière-plan ultra léger */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          45deg,
          ${color}08 0px,
          ${color}08 1px,
          transparent 1px,
          transparent 40px
        )`,
        opacity: 0.5,
      }}/>
    </div>
  )
}

