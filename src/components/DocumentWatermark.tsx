'use client'
import React from 'react'

export interface DocumentWatermarkProps {
  type: 'FACTURE' | 'DEVIS' | 'CONTRAT' | 'BON DE COMMANDE' | 'COMMANDE'
  logoUrl?: string
  companyName?: string
  opacity?: number
}

const DocumentWatermark: React.FC<DocumentWatermarkProps> = ({
  type,
  logoUrl,
  companyName,
  opacity = 0.06,
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          opacity,
          transform: 'rotate(-20deg)',
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            style={{ width: '72px', height: '72px', objectFit: 'contain' }}
          />
        ) : null}

        {companyName ? (
          <div
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: 'var(--text)',
              letterSpacing: '1px',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {companyName}
          </div>
        ) : null}

        <div
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {type}
        </div>
      </div>
    </div>
  )
}

export default DocumentWatermark
