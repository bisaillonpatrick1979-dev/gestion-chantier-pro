'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useThemeStore } from '@/store/useThemeStore'
import { DocumentStatus } from '@/types/documents'
import { formatCurrency } from '@/lib/formatters'
import SignaturePad from '@/components/documents/SignaturePad'
import { useLangStore } from '@/store/useLangStore'
import { tr } from '@/lib/translations'

const STATUS_OPTIONS: DocumentStatus[] = [
  'brouillon', 'envoye', 'accepte', 'refuse', 'paye'
]

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const {
    documents, updateDocument, deleteDocument,
    addLineItem, updateLineItem, removeLineItem,
  } = useDocumentStore()
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const TYPE_LABELS: Record<string, string> = {
    facture: tr('invoices', lang),
    devis: tr('quotes', lang),
    contrat: tr('contracts', lang),
  }
  const [showPreview, setShowPreview] = useState(false)

  const doc = documents.find(d => d.id === id)
  if (!doc) return (
    <div style={{ color: theme.colors.text, padding: '16px' }}>
      {lang === 'fr' ? 'Document introuvable.' : 'Document not found.'}
      <button onClick={() => router.back()}
        style={{ color: theme.colors.primary, marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
        Retour
      </button>
    </div>
  )

  const inputStyle = {
    width: '100%', background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px', padding: '10px 12px',
    color: theme.colors.text, fontSize: '14px',
    outline: 'none', marginTop: '4px',
  }

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px', padding: '16px',
    display: 'flex', flexDirection: 'column' as const, gap: '12px',
  }

  const handleDelete = () => {
    if (window.confirm('' + (lang === 'fr' ? 'Supprimer ce document ?' : 'Delete this document?') + '')) {
      deleteDocument(doc.id)
      router.push('/documents')
    }
  }

  const handleEmail = () => {
    const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`
    const subject = encodeURIComponent(
      `${TYPE_LABELS[doc.type]} ${doc.number} - Hailite Xteriors`
    )
    const body = encodeURIComponent(
      `Bonjour ${doc.client.name},\n\n` +
      `Merci de nous faire confiance pour vos travaux d'extérieur.\n\n` +
      `Veuillez trouver votre ${TYPE_LABELS[doc.type].toLowerCase()} ` +
      `numéro ${doc.number} d'un montant de ${formatCurrency(doc.total)} ` +
      `au lien suivant:\n\n` +
      `${invoiceUrl}\n\n` +
      `Vous pouvez l'imprimer ou le sauvegarder en PDF directement depuis ce lien.\n\n` +
      `N'hésitez pas à nous contacter pour toute question.\n\n` +
      `Cordialement,\n` +
      `L'équipe Hailite Xteriors\n` +
      `${doc.company.phone}\n` +
      `${doc.company.email}`
    )
    window.location.href = `mailto:${doc.client.email}?subject=${subject}&body=${body}`
  }

  const handleSMS = () => {
    const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`
    const message = encodeURIComponent(
      `Bonjour ${doc.client.name}! Merci de nous faire confiance. ` +
      `Votre ${TYPE_LABELS[doc.type].toLowerCase()} #${doc.number} ` +
      `de ${formatCurrency(doc.total)} est disponible ici: ${invoiceUrl} ` +
      `- Hailite Xteriors ${doc.company.phone}`
    )
    const phone = doc.client.phone?.replace(/\D/g, '') || ''
    window.location.href = `sms:${phone}?body=${message}`
  }

  const handlePreview = () => setShowPreview(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => router.back()} style={{
            color: theme.colors.textMuted, background: 'none',
            border: 'none', cursor: 'pointer', fontSize: '13px',
            marginBottom: '4px', display: 'block',
          }}>{lang === 'fr' ? '← Retour' : '← Back'}</button>
          <h1 style={{ color: theme.colors.primary, fontSize: '16px', fontWeight: '800' }}>
            {doc.number}
          </h1>
        </div>
        <button onClick={handleDelete} style={{
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
          border: '1px solid #ef4444',
          background: 'transparent', color: '#ef4444',
          fontSize: '12px', fontWeight: '700',
        }}>🗑️</button>
      </div>

      {/* STATUS */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          {lang === 'fr' ? 'STATUT' : 'STATUS'}
        </p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s === 'brouillon' ? (lang === 'fr' ? 'brouillon' : 'draft') : s === 'envoye' ? (lang === 'fr' ? 'envoyé' : 'sent') : s === 'accepte' ? (lang === 'fr' ? 'accepté' : 'accepted') : s === 'refuse' ? (lang === 'fr' ? 'refusé' : 'refused') : (lang === 'fr' ? 'payé' : 'paid')} onClick={() => updateDocument(doc.id, { status: s })} style={{
              padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
              border: doc.status === s
                ? `2px solid ${theme.colors.primary}`
                : `1px solid ${theme.colors.border}`,
              background: doc.status === s ? theme.colors.glow1 : 'transparent',
              color: doc.status === s ? theme.colors.primary : theme.colors.textMuted,
              fontSize: '11px', fontWeight: '700',
              textTransform: 'capitalize' as const,
            }}>
              {s === 'brouillon' ? (lang === 'fr' ? 'brouillon' : 'draft') : s === 'envoye' ? (lang === 'fr' ? 'envoyé' : 'sent') : s === 'accepte' ? (lang === 'fr' ? 'accepté' : 'accepted') : s === 'refuse' ? (lang === 'fr' ? 'refusé' : 'refused') : (lang === 'fr' ? 'payé' : 'paid')}
            </button>
          ))}
        </div>
      </div>

      {/* CLIENT */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          {lang === 'fr' ? '👤 CLIENT' : '👤 CLIENT'}
        </p>
        {[
          { label: lang === 'fr' ? 'Nom' : 'Name', field: 'name', placeholder: 'Nom du client' },
          { label: lang === 'fr' ? 'Adresse' : 'Address', field: 'address', placeholder: '123 Rue...' },
          { label: lang === 'fr' ? 'Ville' : 'City', field: 'city', placeholder: 'Montréal' },
          { label: lang === 'fr' ? 'Code postal' : 'Postal code', field: 'postalCode', placeholder: 'H1A 1A1' },
          { label: lang === 'fr' ? 'Téléphone' : 'Phone', field: 'phone', placeholder: '514-555-0000' },
          { label: 'Email', field: 'email', placeholder: 'client@email.com' },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <label style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{label}</label>
            <input
              value={(doc.client as Record<string, string>)[field] || ''}
              onChange={e => updateDocument(doc.id, {
                client: { ...doc.client, [field]: e.target.value }
              })}
              placeholder={placeholder}
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      {/* DATES */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          📅 DATES
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ color: theme.colors.textMuted, fontSize: '11px' }}>Date</label>
            <input type="date" value={doc.date}
              onChange={e => updateDocument(doc.id, { date: e.target.value })}
              style={inputStyle} />
          </div>
          <div>
            <label style={{ color: theme.colors.textMuted, fontSize: '11px' }}>Échéance</label>
            <input type="date" value={doc.dueDate}
              onChange={e => updateDocument(doc.id, { dueDate: e.target.value })}
              style={inputStyle} />
          </div>
        </div>
      </div>

      {/* LINE ITEMS */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          📦 ITEMS
        </p>
        {doc.items.map((item, idx) => (
          <div key={item.id} style={{
            background: theme.colors.surface, borderRadius: '10px', padding: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>Item {idx + 1}</span>
              <button onClick={() => removeLineItem(doc.id, item.id)} style={{
                color: '#ef4444', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '18px',
              }}>×</button>
            </div>
            <input value={item.description}
              onChange={e => updateLineItem(doc.id, item.id, { description: e.target.value })}
              placeholder={lang === 'fr' ? 'Description du travail...' : 'Work description...'}
              style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{lang === 'fr' ? 'Qté' : 'Qty'}</label>
                <input type="number" value={item.quantity}
                  onChange={e => updateLineItem(doc.id, item.id, { quantity: Number(e.target.value) })}
                  style={{ ...inputStyle, textAlign: 'center' as const }} />
              </div>
              <div>
                <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{lang === 'fr' ? 'Prix unit.' : 'Unit price'}</label>
                <input type="number" value={item.unitPrice}
                  onChange={e => updateLineItem(doc.id, item.id, { unitPrice: Number(e.target.value) })}
                  style={{ ...inputStyle, textAlign: 'center' as const }} />
              </div>
              <div>
                <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>Total</label>
                <div style={{
                  ...inputStyle, textAlign: 'center' as const,
                  color: theme.colors.secondary, fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {formatCurrency(item.total)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => addLineItem(doc.id)} style={{
          padding: '12px', borderRadius: '10px', cursor: 'pointer',
          border: `1px dashed ${theme.colors.primary}`,
          background: 'transparent', color: theme.colors.primary,
          fontSize: '13px', fontWeight: '700',
        }}>{lang === 'fr' ? '+ Ajouter un item' : '+ Add item'}</button>
      </div>

      {/* TOTALS */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          {lang === 'fr' ? '💰 TOTAUX' : '💰 TOTALS'}
        </p>
        {[
          { label: lang === 'fr' ? 'Sous-total' : 'Subtotal', value: formatCurrency(doc.subtotal), color: theme.colors.text },
          { label: `TPS+TVQ (${doc.taxRate}%)`, value: formatCurrency(doc.taxAmount), color: theme.colors.textMuted },
          { label: 'TOTAL', value: formatCurrency(doc.total), color: theme.colors.secondary },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '8px',
          }}>
            <span style={{ color: theme.colors.textMuted, fontSize: '13px' }}>{row.label}</span>
            <span style={{ color: row.color, fontSize: '14px', fontWeight: '700' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* NOTES & CONDITIONS */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          {lang === 'fr' ? '📝 NOTES & CONDITIONS' : '📝 NOTES & TERMS'}
        </p>
        <div>
          <label style={{ color: theme.colors.textMuted, fontSize: '11px' }}>Notes</label>
          <textarea value={doc.notes}
            onChange={e => updateDocument(doc.id, { notes: e.target.value })}
            placeholder={lang === 'fr' ? 'Notes additionnelles...' : 'Additional notes...'}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>
        <div>
          <label style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{lang === 'fr' ? 'Conditions' : 'Terms'}</label>
          <textarea value={doc.terms}
            onChange={e => updateDocument(doc.id, { terms: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>
      </div>

      {/* SIGNATURES - LAST SECTION */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          ✍️ SIGNATURES
        </p>

        <SignaturePad
          label={lang === 'fr' ? 'Signature du contracteur' : 'Contractor signature'}
          existingSignature={doc.contractorSignature}
          date={doc.contractorSignatureDate}
          onSave={(sig) => updateDocument(doc.id, {
            contractorSignature: sig,
            contractorSignatureDate: new Date().toLocaleDateString('fr-CA', {
              year: 'numeric', month: 'long', day: 'numeric'
            }),
          })}
        />

        {doc.type === 'contrat' && (
          <SignaturePad
            label={lang === 'fr' ? 'Signature du client' : 'Client signature'}
            existingSignature={doc.clientSignature}
            date={doc.clientSignatureDate}
            onSave={(sig) => updateDocument(doc.id, {
              clientSignature: sig,
              clientSignatureDate: new Date().toLocaleDateString('fr-CA', {
                year: 'numeric', month: 'long', day: 'numeric'
              }),
            })}
          />
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px',
        paddingBottom: '16px',
      }}>
        <button onClick={handlePreview} style={{
          padding: '14px 8px', borderRadius: '12px', cursor: 'pointer',
          border: `1px solid ${theme.colors.primary}`,
          background: theme.colors.glow1,
          color: theme.colors.primary,
          fontSize: '12px', fontWeight: '700',
          display: 'flex', flexDirection: 'column' as const,
          alignItems: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '20px' }}>👁️</span>
          Preview PDF
        </button>
        <button onClick={handleEmail} style={{
          padding: '14px 8px', borderRadius: '12px', cursor: 'pointer',
          border: `1px solid ${theme.colors.secondary}`,
          background: `rgba(245,158,11,0.1)`,
          color: theme.colors.secondary,
          fontSize: '12px', fontWeight: '700',
          display: 'flex', flexDirection: 'column' as const,
          alignItems: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '20px' }}>📧</span>
          Email
        </button>
        <button onClick={handleSMS} style={{
          padding: '14px 8px', borderRadius: '12px', cursor: 'pointer',
          border: '1px solid #22c55e',
          background: 'rgba(34,197,94,0.1)',
          color: '#22c55e',
          fontSize: '12px', fontWeight: '700',
          display: 'flex', flexDirection: 'column' as const,
          alignItems: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '20px' }}>💬</span>
          SMS
        </button>
      </div>

      {/* PDF PREVIEW MODAL */}
      {showPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)', zIndex: 200,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto' as const,
        }}>
          {/* PREVIEW HEADER */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: theme.colors.surface,
            borderBottom: `1px solid ${theme.colors.border}`,
            padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {lang === 'fr' ? '👁️ Aperçu' : '👁️ Preview'} — {doc.number}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => window.print()} style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                border: `1px solid ${theme.colors.primary}`,
                background: 'transparent', color: theme.colors.primary,
                fontSize: '12px', fontWeight: '700',
              }}>{lang === 'fr' ? '🖨️ Imprimer' : '🖨️ Print'}</button>
              <button onClick={() => setShowPreview(false)} style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                border: `1px solid ${theme.colors.border}`,
                background: 'transparent', color: theme.colors.textMuted,
                fontSize: '12px', fontWeight: '700',
              }}>{lang === 'fr' ? '← Retour' : '← Back'}</button>
            </div>
          </div>

          {/* PDF CONTENT */}
          <div style={{
            background: 'white', margin: '16px', borderRadius: '12px',
            padding: '32px', color: '#1a1a1a', position: 'relative',
            overflow: 'hidden',
          }}>
            {/* WATERMARK */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              fontSize: '48px', fontWeight: '900',
              color: 'rgba(234,88,12,0.06)', letterSpacing: '6px',
              whiteSpace: 'nowrap' as const, pointerEvents: 'none',
              zIndex: 0,
            }}>
              HAILITE XTERIORS
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* COMPANY HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#ea580c', margin: 0 }}>
                    HAILITE XTERIORS
                  </h1>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>
                    {doc.company.address}, {doc.company.city}, {doc.company.province}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>
                    {doc.company.phone} · {doc.company.email}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>
                    RBQ: {doc.company.license}
                  </p>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>
                    {doc.type.toUpperCase()}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#ea580c', fontWeight: '700', margin: '4px 0 0' }}>
                    #{doc.number}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>
                    Date: {doc.date}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>
                    Échéance: {doc.dueDate}
                  </p>
                </div>
              </div>

              {/* DIVIDER */}
              <div style={{ borderTop: '2px solid #ea580c', marginBottom: '20px' }} />

              {/* CLIENT */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', color: '#666', letterSpacing: '2px', marginBottom: '6px' }}>
                  {lang === 'fr' ? 'FACTURER À' : 'BILL TO'}
                </p>
                <p style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{doc.client.name}</p>
                <p style={{ fontSize: '12px', color: '#444', margin: '2px 0 0' }}>{doc.client.address}</p>
                <p style={{ fontSize: '12px', color: '#444', margin: '2px 0 0' }}>
                  {doc.client.city}, {doc.client.province} {doc.client.postalCode}
                </p>
                <p style={{ fontSize: '12px', color: '#444', margin: '2px 0 0' }}>{doc.client.phone}</p>
                <p style={{ fontSize: '12px', color: '#444', margin: '2px 0 0' }}>{doc.client.email}</p>
              </div>

              {/* ITEMS TABLE */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    {['Description', lang === 'fr' ? 'Qté' : 'Qty', lang === 'fr' ? 'Prix unit.' : 'Unit price', 'Total'].map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: h === 'Description' ? 'left' : 'right' as const,
                        fontSize: '11px', letterSpacing: '1px', color: '#666',
                        borderBottom: '1px solid #ddd',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doc.items.map((item, i) => (
                    <tr key={item.id} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '8px 12px', fontSize: '13px' }}>{item.description}</td>
                      <td style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right' as const }}>{item.quantity}</td>
                      <td style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right' as const }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right' as const, fontWeight: '700' }}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTALS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ width: '220px' }}>
                  {[
                    { label: lang === 'fr' ? 'Sous-total' : 'Subtotal', value: formatCurrency(doc.subtotal) },
                    { label: `TPS+TVQ (${doc.taxRate}%)`, value: formatCurrency(doc.taxAmount) },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '4px 0', borderBottom: '1px solid #eee',
                    }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>{row.label}</span>
                      <span style={{ fontSize: '12px' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderTop: '2px solid #ea580c',
                    marginTop: '4px',
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>TOTAL</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#ea580c' }}>
                      {formatCurrency(doc.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              {doc.notes && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', marginBottom: '4px' }}>NOTES</p>
                  <p style={{ fontSize: '12px', color: '#444' }}>{doc.notes}</p>
                </div>
              )}

              {/* TERMS */}
              {doc.terms && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', marginBottom: '4px' }}>{lang === 'fr' ? 'CONDITIONS' : 'TERMS'}</p>
                  <p style={{ fontSize: '12px', color: '#444' }}>{doc.terms}</p>
                </div>
              )}

              {/* SIGNATURES */}
              <div style={{
                display: 'flex',
                justifyContent: doc.type === 'contrat' ? 'space-between' : 'flex-end',
                marginTop: '32px', gap: '20px',
              }}>
                {doc.type === 'contrat' && doc.clientSignature && (
                  <div style={{ textAlign: 'center' as const }}>
                    <img src={doc.clientSignature} alt="Signature client"
                      style={{ height: '50px', display: 'block', marginBottom: '4px' }} />
                    <div style={{ borderTop: '1px solid #999', paddingTop: '4px' }}>
                      <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{lang === 'fr' ? 'Signature du client' : 'Client signature'}</p>
                      <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>{doc.clientSignatureDate}</p>
                    </div>
                  </div>
                )}
                {doc.contractorSignature && (
                  <div style={{ textAlign: 'center' as const }}>
                    <img src={doc.contractorSignature} alt="Signature contracteur"
                      style={{ height: '50px', display: 'block', marginBottom: '4px' }} />
                    <div style={{ borderTop: '1px solid #999', paddingTop: '4px' }}>
                      <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{lang === 'fr' ? 'Signature du contracteur' : 'Contractor signature'}</p>
                      <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>{doc.contractorSignatureDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          nav, button { display: none !important; }
          body { background: white !important; color: black !important; }
          .fire-bg, .stars { display: none !important; }
          body::before {
            content: 'HAILITE XTERIORS';
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px; font-weight: 900;
            color: rgba(234,88,12,0.06);
            letter-spacing: 8px; z-index: 0;
            pointer-events: none; white-space: nowrap;
          }
        }
      `}</style>

    </div>
  )
}
