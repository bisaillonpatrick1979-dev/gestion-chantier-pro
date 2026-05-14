'use client'
import { useEffect, useState } from 'react'
import { useDocumentStore } from '@/store/useDocumentStore'
import { formatCurrency } from '@/lib/formatters'
import Image from 'next/image'

export default function InvoiceClient({ id }: { id: string }) {
  const { documents } = useDocumentStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return (
    <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
      Chargement...
    </p>
  )

  const doc = documents.find(d => d.id === id)
  if (!doc) return (
    <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
      Document introuvable.
    </p>
  )

  const TYPE_LABELS: Record<string, string> = {
    facture: 'FACTURE', devis: 'DEVIS', contrat: 'CONTRAT'
  }

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', color: '#1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image src="/logo-hailite.png" alt="Hailite Xteriors" width={60} height={60} style={{ objectFit: 'contain' }} />
          <div><h1 style={{ fontSize: '20px', fontWeight: '900', color: '#ea580c', margin: 0 }}>HAILITE XTERIORS</h1></div>
        </div>
        <div style={{ textAlign: 'right' }}><h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>{TYPE_LABELS[doc.type]}</h2></div>
      </div>
      <p>{formatCurrency(doc.total)}</p>
    </div>
  )
}
