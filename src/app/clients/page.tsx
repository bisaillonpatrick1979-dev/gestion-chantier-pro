'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useClientStore, Client } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { formatCurrency } from '@/lib/formatters'

const emptyClient = {
  name: '', phone: '', email: '',
  address: '', city: '', province: '',
  postalCode: '', notes: '',
}

export default function ClientsPage() {
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const { documents, addDocument, updateDocument } = useDocumentStore()
  const router = useRouter()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyClient)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  }

  const inputStyle = {
    width: '100%',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '10px 12px',
    color: theme.colors.text,
    fontSize: '14px',
    outline: 'none',
    marginTop: '4px',
  }

  const labelStyle = {
    color: theme.colors.textMuted,
    fontSize: '11px',
    fontWeight: '600' as const,
  }

  const handleSave = () => {
    if (!form.name) return
    if (editingId) {
      updateClient(editingId, form)
      setEditingId(null)
    } else {
      addClient(form)
      setShowAdd(false)
    }
    setForm(emptyClient)
  }

  const handleEdit = (client: Client) => {
    setEditingId(client.id)
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      city: client.city,
      province: client.province,
      postalCode: client.postalCode,
      notes: client.notes,
    })
    setSelectedClient(null)
  }

  const handleDelete = (client: Client) => {
    if (window.confirm(`${t('Supprimer', 'Delete')} ${client.name} ?`)) {
      deleteClient(client.id)
      setSelectedClient(null)
    }
  }

  const handleCreateInvoice = (client: Client) => {
    const doc = addDocument('facture')
    updateDocument(doc.id, {
      client: {
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        city: client.city,
        province: client.province,
        postalCode: client.postalCode,
      }
    })
    router.push(`/documents/${doc.id}`)
  }

  const handleCreateQuote = (client: Client) => {
    const doc = addDocument('devis')
    updateDocument(doc.id, {
      client: {
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        city: client.city,
        province: client.province,
        postalCode: client.postalCode,
      }
    })
    router.push(`/documents/${doc.id}`)
  }

  // Get client documents history
  const getClientDocs = (client: Client) =>
    documents.filter(d =>
      d.client.name.toLowerCase() === client.name.toLowerCase()
    )

  const formCard = (
    <div style={card}>
      <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
        {editingId ? t('✏️ MODIFIER CLIENT', '✏️ EDIT CLIENT') : t('➕ NOUVEAU CLIENT', '➕ NEW CLIENT')}
      </p>

      {[
        { label: t('Nom complet *', 'Full name *'), field: 'name', placeholder: 'Jean Tremblay' },
        { label: t('Téléphone', 'Phone'), field: 'phone', placeholder: '514-555-0000' },
        { label: 'Email', field: 'email', placeholder: 'client@email.com' },
        { label: t('Adresse', 'Address'), field: 'address', placeholder: '123 Rue Principale' },
        { label: t('Ville', 'City'), field: 'city', placeholder: 'Montréal' },
        { label: t('Province', 'Province'), field: 'province', placeholder: 'QC' },
        { label: t('Code postal', 'Postal code'), field: 'postalCode', placeholder: 'H1A 1A1' },
      ].map(({ label, field, placeholder }) => (
        <div key={field}>
          <label style={labelStyle}>{label}</label>
          <input
            value={(form as Record<string, string>)[field]}
            onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
            placeholder={placeholder}
            style={inputStyle}
          />
        </div>
      ))}

      <div>
        <label style={labelStyle}>{t('Notes', 'Notes')}</label>
        <textarea
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          placeholder={t('Notes additionnelles...', 'Additional notes...')}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' as const }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button onClick={() => {
          setShowAdd(false)
          setEditingId(null)
          setForm(emptyClient)
        }} style={{
          padding: '12px', borderRadius: '10px', cursor: 'pointer',
          border: `1px solid ${theme.colors.border}`,
          background: 'transparent', color: theme.colors.textMuted,
          fontSize: '14px', fontWeight: '700',
        }}>
          {t('Annuler', 'Cancel')}
        </button>
        <button onClick={handleSave} style={{
          padding: '12px', borderRadius: '10px', cursor: 'pointer',
          border: 'none', background: theme.colors.primary,
          color: 'white', fontSize: '14px', fontWeight: '700',
        }}>
          ✅ {t('Sauvegarder', 'Save')}
        </button>
      </div>
    </div>
  )

  // CLIENT DETAIL VIEW
  if (selectedClient) {
    const clientDocs = getClientDocs(selectedClient)
    const totalRevenue = clientDocs
      .filter(d => d.status === 'paye')
      .reduce((s, d) => s + d.total, 0)
    const pendingRevenue = clientDocs
      .filter(d => d.status === 'envoye' || d.status === 'accepte')
      .reduce((s, d) => s + d.balanceDue, 0)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setSelectedClient(null)} style={{
            color: theme.colors.textMuted, background: 'none',
            border: 'none', cursor: 'pointer', fontSize: '13px'
          }}>← {t('Retour', 'Back')}</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleEdit(selectedClient)} style={{
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${theme.colors.primary}`,
              background: 'transparent', color: theme.colors.primary,
              fontSize: '12px', fontWeight: '700',
            }}>✏️</button>
            <button onClick={() => handleDelete(selectedClient)} style={{
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              border: '1px solid #ef4444',
              background: 'transparent', color: '#ef4444',
              fontSize: '12px', fontWeight: '700',
            }}>🗑️</button>
          </div>
        </div>

        {editingId === selectedClient.id && formCard}

        {/* CLIENT INFO */}
        {editingId !== selectedClient.id && (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: '900', color: 'white', flexShrink: 0,
              }}>
                {selectedClient.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ color: theme.colors.text, fontSize: '18px', fontWeight: '800' }}>
                  {selectedClient.name}
                </p>
                <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                  {t('Client depuis', 'Client since')} {new Date(selectedClient.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')}
                </p>
              </div>
            </div>

            {[
              { label: t('Téléphone', 'Phone'), value: selectedClient.phone, icon: '📞' },
              { label: 'Email', value: selectedClient.email, icon: '📧' },
              { label: t('Adresse', 'Address'), value: `${selectedClient.address}, ${selectedClient.city} ${selectedClient.postalCode}`, icon: '📍' },
            ].filter(f => f.value.trim()).map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: theme.colors.surface, borderRadius: '8px', padding: '10px 12px',
              }}>
                <span style={{ fontSize: '16px' }}>{f.icon}</span>
                <div>
                  <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{f.label}</p>
                  <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '600' }}>{f.value}</p>
                </div>
              </div>
            ))}

            {selectedClient.notes && (
              <div style={{
                background: theme.colors.surface, borderRadius: '8px', padding: '10px 12px',
              }}>
                <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginBottom: '4px' }}>
                  {t('Notes', 'Notes')}
                </p>
                <p style={{ color: theme.colors.text, fontSize: '13px' }}>{selectedClient.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* REVENUE SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={card}>
            <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
              {t('Total encaissé', 'Total collected')}
            </p>
            <p style={{ color: '#22c55e', fontSize: '20px', fontWeight: '800' }}>
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div style={card}>
            <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
              {t('En attente', 'Pending')}
            </p>
            <p style={{ color: '#f59e0b', fontSize: '20px', fontWeight: '800' }}>
              {formatCurrency(pendingRevenue)}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button onClick={() => handleCreateInvoice(selectedClient)} style={{
            padding: '14px', borderRadius: '12px', cursor: 'pointer',
            border: `1px solid ${theme.colors.primary}`,
            background: theme.colors.glow1, color: theme.colors.primary,
            fontSize: '13px', fontWeight: '700',
            display: 'flex', flexDirection: 'column' as const,
            alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '20px' }}>📄</span>
            {t('Nouvelle facture', 'New invoice')}
          </button>
          <button onClick={() => handleCreateQuote(selectedClient)} style={{
            padding: '14px', borderRadius: '12px', cursor: 'pointer',
            border: `1px solid ${theme.colors.secondary}`,
            background: `rgba(245,158,11,0.1)`, color: theme.colors.secondary,
            fontSize: '13px', fontWeight: '700',
            display: 'flex', flexDirection: 'column' as const,
            alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '20px' }}>📋</span>
            {t('Nouveau devis', 'New quote')}
          </button>
        </div>

        {/* DOCUMENT HISTORY */}
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            📁 {t('HISTORIQUE', 'HISTORY')} ({clientDocs.length})
          </p>
          {clientDocs.length === 0 ? (
            <p style={{ color: theme.colors.textMuted, textAlign: 'center' as const, fontSize: '13px', padding: '16px' }}>
              {t('Aucun document pour ce client', 'No documents for this client')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...clientDocs].reverse().map(doc => {
                const statusColors: Record<string, string> = {
                  brouillon: '#64748b', envoye: '#3b82f6',
                  accepte: '#22c55e', refuse: '#ef4444', paye: '#f59e0b'
                }
                const typeEmojis: Record<string, string> = {
                  facture: '📄', devis: '📋', contrat: '📝'
                }
                return (
                  <button key={doc.id}
                    onClick={() => router.push(`/documents/${doc.id}`)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: theme.colors.surface, borderRadius: '10px', padding: '12px',
                      border: `1px solid ${theme.colors.border}`, cursor: 'pointer',
                      textAlign: 'left' as const,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{typeEmojis[doc.type]}</span>
                      <div>
                        <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                          {doc.number}
                        </p>
                        <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                          {doc.date}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: '700' }}>
                        {formatCurrency(doc.total)}
                      </p>
                      <p style={{
                        color: statusColors[doc.status] || theme.colors.textMuted,
                        fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' as const
                      }}>
                        {doc.status}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      </div>
    )
  }

  // MAIN LIST VIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: theme.colors.primary, fontSize: '14px', letterSpacing: '3px', fontWeight: '700' }}>
          👥 {t('CLIENTS', 'CLIENTS')}
        </h1>
        <button onClick={() => { setShowAdd(true); setEditingId(null); setForm(emptyClient) }} style={{
          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
          border: `1px solid ${theme.colors.primary}`,
          background: theme.colors.glow1, color: theme.colors.primary,
          fontSize: '13px', fontWeight: '700',
        }}>
          + {t('Ajouter', 'Add')}
        </button>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('🔍 Rechercher un client...', '🔍 Search client...')}
        style={{
          width: '100%', background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '10px', padding: '12px 16px',
          color: theme.colors.text, fontSize: '14px', outline: 'none',
        }}
      />

      {/* ADD FORM */}
      {showAdd && formCard}

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={card}>
          <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
            {t('Total clients', 'Total clients')}
          </p>
          <p style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: '800' }}>
            {clients.length}
          </p>
        </div>
        <div style={card}>
          <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
            {t('Total revenus', 'Total revenue')}
          </p>
          <p style={{ color: theme.colors.secondary, fontSize: '18px', fontWeight: '800' }}>
            {formatCurrency(
              documents
                .filter(d => d.status === 'paye')
                .reduce((s, d) => s + d.total, 0)
            )}
          </p>
        </div>
      </div>

      {/* CLIENT LIST */}
      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center' as const, padding: '40px' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>👥</p>
          <p style={{ color: theme.colors.textMuted, fontSize: '14px' }}>
            {search
              ? t('Aucun client trouvé', 'No client found')
              : t('Aucun client. Ajoutez-en un !', 'No clients yet. Add one!')
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(client => {
            const clientDocs = getClientDocs(client)
            const totalPaid = clientDocs
              .filter(d => d.status === 'paye')
              .reduce((s, d) => s + d.total, 0)

            return (
              <button key={client.id}
                onClick={() => setSelectedClient(client)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.card, textAlign: 'left' as const,
                }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '900', color: 'white',
                }}>
                  {client.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: theme.colors.text, fontSize: '15px', fontWeight: '700' }}>
                    {client.name}
                  </p>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                    {client.city || client.phone || client.email}
                  </p>
                </div>
                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                  {clientDocs.length > 0 && (
                    <>
                      <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: '700' }}>
                        {formatCurrency(totalPaid)}
                      </p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>
                        {clientDocs.length} {t('doc(s)', 'doc(s)')}
                      </p>
                    </>
                  )}
                  <span style={{ color: theme.colors.textMuted, fontSize: '16px' }}>›</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

    </div>
  )
}

