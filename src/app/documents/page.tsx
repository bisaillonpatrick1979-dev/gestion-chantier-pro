'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useThemeStore } from '@/store/useThemeStore'
import { DocumentType, DocumentStatus } from '@/types/documents'
import { formatCurrency } from '@/lib/formatters'
import { useLangStore } from '@/store/useLangStore'
import { tr } from '@/lib/translations'

const STATUS_LABELS: Record<DocumentStatus, { label: string; color: string }> = {
  brouillon: { label: 'Brouillon', color: '#64748b' },
  envoye:    { label: 'Envoyé',    color: '#3b82f6' },
  accepte:   { label: 'Accepté',  color: '#22c55e' },
  refuse:    { label: 'Refusé',   color: '#ef4444' },
  paye:      { label: 'Payé',     color: '#f59e0b' },
}

export default function DocumentsPage() {
  const { documents, addDocument } = useDocumentStore()
  const { theme } = useThemeStore()
  const router = useRouter()
  const { lang } = useLangStore()

  const TYPE_LABELS = {
    facture: {
      label: tr('invoices', lang),
      emoji: '📄'
    },
    devis: {
      label: tr('quotes', lang),
      emoji: '📋'
    },
    contrat: {
      label: tr('contracts', lang),
      emoji: '📝'
    },
  }
  const [filter, setFilter] = useState<DocumentType | 'all'>('all')

  const filtered = filter === 'all'
    ? documents
    : documents.filter(d => d.type === filter)

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
  }

  const handleNew = (type: DocumentType) => {
    const doc = addDocument(type)
    router.push(`/documents/${doc.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <h1 style={{
        color: theme.colors.primary, fontSize: '14px',
        letterSpacing: '3px', fontWeight: '700'
      }}>
        {tr('documentsTitle', lang)}
      </h1>

      {/* NEW DOCUMENT BUTTONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {(['facture', 'devis', 'contrat'] as DocumentType[]).map(type => (
          <button key={type} onClick={() => handleNew(type)} style={{
            padding: '14px 8px', borderRadius: '12px', cursor: 'pointer',
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            color: theme.colors.text,
            fontSize: '12px', fontWeight: '700',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '24px' }}>{TYPE_LABELS[type].emoji}</span>
            <span style={{ color: theme.colors.primary }}>
              + {TYPE_LABELS[type].label}
            </span>
          </button>
        ))}
      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {(['all', 'facture', 'devis', 'contrat'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
            border: filter === f
              ? `2px solid ${theme.colors.primary}`
              : `1px solid ${theme.colors.border}`,
            background: filter === f ? theme.colors.glow1 : 'transparent',
            color: filter === f ? theme.colors.primary : theme.colors.textMuted,
            fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' as const,
          }}>
            {f === 'all' ? tr('all', lang) : f === 'facture' ? tr('invoices', lang) : f === 'devis' ? tr('quotes', lang) : tr('contracts', lang)}
          </button>
        ))}
      </div>

      {/* DOCUMENT LIST */}
      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center' as const, padding: '40px' }}>
          <p style={{ color: theme.colors.textMuted, fontSize: '14px' }}>
            {lang === 'fr' ? 'Aucun document. Créez-en un ci-dessus.' : 'No documents. Create one above.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.slice().reverse().map(doc => (
            <div key={doc.id} style={{
              ...card,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', cursor: 'pointer',
            }}
              onClick={() => router.push(`/documents/${doc.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{TYPE_LABELS[doc.type].emoji}</span>
                <div>
                  <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                    {doc.number}
                  </p>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                    {doc.client.name || tr('clientNotDefined', lang)} — {doc.date}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <p style={{
                  color: theme.colors.secondary,
                  fontSize: '13px', fontWeight: '700'
                }}>
                  {formatCurrency(doc.total)}
                </p>
                <span style={{
                  fontSize: '10px', fontWeight: '700',
                  color: STATUS_LABELS[doc.status].color,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                }}>
                  {STATUS_LABELS[doc.status].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
