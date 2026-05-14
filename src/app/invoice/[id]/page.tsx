'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDocumentStore } from '@/store/useDocumentStore'
import { formatCurrency } from '@/lib/formatters'

export default function PublicInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const { documents } = useDocumentStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const doc = mounted ? documents.find(d => d.id === id) : null
  const TYPE_LABELS: Record<string, string> = {
    facture: 'FACTURE', devis: 'DEVIS', contrat: 'CONTRAT'
  }
  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', position: 'relative' }}>
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '60px', fontWeight: '900',
          color: 'rgba(234,88,12,0.06)', letterSpacing: '8px',
          zIndex: 0, pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>HAILITE XTERIORS</div>
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} style={{
            padding: '12px 20px', borderRadius: '8px', background: '#ea580c',
            color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
          }}>🖨️ Sauvegarder PDF</button>
          <button onClick={() => window.history.back()} style={{
            padding: '12px 20px', borderRadius: '8px', background: '#1a1a1a',
            color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
          }}>← Retour</button>
        </div>
        {!mounted || !doc ? (
          <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
            {!mounted ? 'Chargement...' : 'Document introuvable.'}
          </p>
        ) : (
          <div style={{ position: 'relative', zIndex: 1, color: '#1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#ea580c', margin: 0 }}>HAILITE XTERIORS</h1>
                <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0' }}>{doc.company.address}, {doc.company.city}</p>
                <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0' }}>{doc.company.phone} · {doc.company.email}</p>
                <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0' }}>RBQ: {doc.company.license}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{TYPE_LABELS[doc.type]}</h2>
                <p style={{ fontSize: '15px', color: '#ea580c', fontWeight: '700', margin: '4px 0 0' }}>#{doc.number}</p>
                <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>Date: {doc.date}</p>
                <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>Échéance: {doc.dueDate}</p>
              </div>
            </div>
            <div style={{ borderTop: '2px solid #ea580c', marginBottom: '20px' }} />
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '10px', color: '#666', letterSpacing: '2px', marginBottom: '6px' }}>FACTURER À</p>
              <p style={{ fontSize: '15px', fontWeight: '700' }}>{doc.client.name}</p>
              <p style={{ fontSize: '12px', color: '#444', margin: '2px 0' }}>{doc.client.address}</p>
              <p style={{ fontSize: '12px', color: '#444', margin: '2px 0' }}>{doc.client.city} {doc.client.postalCode}</p>
              <p style={{ fontSize: '12px', color: '#444', margin: '2px 0' }}>{doc.client.phone}</p>
              <p style={{ fontSize: '12px', color: '#444', margin: '2px 0' }}>{doc.client.email}</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {['Description', 'Qté', 'Prix unit.', 'Total'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Description' ? 'left' : 'right', fontSize: '11px', color: '#666', borderBottom: '1px solid #ddd' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doc.items.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '8px 10px', fontSize: '13px' }}>{item.description}</td>
                    <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', fontWeight: '700' }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <div style={{ width: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>Sous-total</span>
                  <span style={{ fontSize: '12px' }}>{formatCurrency(doc.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>TPS+TVQ ({doc.taxRate}%)</span>
                  <span style={{ fontSize: '12px' }}>{formatCurrency(doc.taxAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #ea580c', marginTop: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800' }}>TOTAL</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#ea580c' }}>{formatCurrency(doc.total)}</span>
                </div>
              </div>
            </div>
            {doc.notes && <div style={{ marginBottom: '12px' }}><p style={{ fontSize: '10px', color: '#666', letterSpacing: '1px', marginBottom: '4px' }}>NOTES</p><p style={{ fontSize: '12px', color: '#444' }}>{doc.notes}</p></div>}
            {doc.terms && <div style={{ marginBottom: '24px' }}><p style={{ fontSize: '10px', color: '#666', letterSpacing: '1px', marginBottom: '4px' }}>CONDITIONS</p><p style={{ fontSize: '12px', color: '#444' }}>{doc.terms}</p></div>}
            <div style={{ display: 'flex', justifyContent: doc.type === 'contrat' ? 'space-between' : 'flex-end', marginTop: '32px', gap: '20px' }}>
              {doc.type === 'contrat' && doc.clientSignature && (
                <div style={{ textAlign: 'center' }}>
                  <img src={doc.clientSignature} alt="Signature client" style={{ height: '50px', display: 'block', marginBottom: '4px' }} />
                  <div style={{ borderTop: '1px solid #999', paddingTop: '4px' }}>
                    <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Signature du client</p>
                    <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>{doc.clientSignatureDate}</p>
                  </div>
                </div>
              )}
              {doc.contractorSignature && (
                <div style={{ textAlign: 'center' }}>
                  <img src={doc.contractorSignature} alt="Signature contracteur" style={{ height: '50px', display: 'block', marginBottom: '4px' }} />
                  <div style={{ borderTop: '1px solid #999', paddingTop: '4px' }}>
                    <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Signature du contracteur</p>
                    <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>{doc.contractorSignatureDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@media print { button { display: none !important; } body { background: white !important; } }`}</style>
    </div>
  )
}
