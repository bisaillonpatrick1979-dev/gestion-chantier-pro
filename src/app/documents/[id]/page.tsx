'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useClientStore } from '@/store/useClientStore';

// ─── Types ───────────────────────────────────────────────────────────────────
type DocType = 'invoice' | 'quote' | 'contract';

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface DocumentData {
  id: string;
  type: DocType;
  number: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'declined';
  // Client
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientPhone: string;
  clientEmail: string;
  // Company snapshot (at time of creation)
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyProvince: string;
  companyPostalCode: string;
  companyPhone: string;
  companyEmail: string;
  companyGstNumber: string;
  companyLogoUrl: string;
  // Line items
  items: LineItem[];
  // Financials
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  discountPercent: number;
  discountAmount: number;
  depositPercent: number;
  depositAmount: number;
  total: number;
  balanceDue: number;
  // Notes
  notes: string;
  paymentTerms: string;
  // Signature
  signatureData: string;
  signedAt: string;
  // Contract specific
  scopeOfWork: string;
  startDate: string;
  endDate: string;
}

// ─── Zustand Document Store (inline simple) ──────────────────────────────────
// If you have a useDocumentStore, import it instead.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DocumentStore {
  documents: DocumentData[];
  addDocument: (doc: DocumentData) => void;
  updateDocument: (id: string, updates: Partial<DocumentData>) => void;
  deleteDocument: (id: string) => void;
}

const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documents: [],
      addDocument: (doc) =>
        set((state) => ({ documents: [...state.documents, doc] })),
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
    }),
    { name: 'document-store-v1' }
  )
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: number) => `$${n.toFixed(2)}`;
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
};

function newItem(): LineItem {
  return { id: uid(), description: '', qty: 1, unit: 'unit', unitPrice: 0 };
}

const DOC_LABELS: Record<DocType, { fr: string; en: string; emoji: string; color: string }> = {
  invoice:  { fr: 'Facture',  en: 'Invoice',  emoji: '🧾', color: 'orange' },
  quote:    { fr: 'Devis',    en: 'Quote',    emoji: '📋', color: 'blue' },
  contract: { fr: 'Contrat',  en: 'Contract', emoji: '📝', color: 'purple' },
};

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-gray-500/20 text-gray-300 border-gray-500/30',
  sent:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  paid:     'bg-green-500/20 text-green-300 border-green-500/30',
  overdue:  'bg-red-500/20 text-red-300 border-red-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  declined: 'bg-red-500/20 text-red-300 border-red-500/30',
};

// ─── Signature Pad ────────────────────────────────────────────────────────────
function SignaturePad({
  onSave,
  existing,
}: {
  onSave: (data: string) => void;
  existing?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="space-y-2">
      {existing ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3">
          <p className="text-xs text-green-400 mb-2">✅ Signature enregistrée</p>
          <img src={existing} alt="signature" className="max-h-16 mx-auto" />
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        width={600}
        height={150}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={() => setDrawing(false)}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={() => setDrawing(false)}
        className="w-full rounded-xl border border-white/20 bg-white/5 cursor-crosshair touch-none"
        style={{ height: '120px' }}
      />
      <div className="flex gap-2">
        <button
          onClick={clear}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
        >
          🗑️ Effacer
        </button>
        <button
          onClick={save}
          className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 py-2 text-sm font-bold text-white transition"
        >
          ✅ Signer
        </button>
      </div>
    </div>
  );
}

// ─── Client Picker Modal ──────────────────────────────────────────────────────
function ClientPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (clientId: string) => void;
  onClose: () => void;
}) {
  const { clients } = useClientStore();
  const [search, setSearch] = useState('');

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl bg-gray-900 border-t border-white/10 p-5 pb-8 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">👥 Choisir un client</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none mb-3"
        />
        <div className="overflow-y-auto space-y-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full text-left rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:border-orange-400/50 hover:bg-orange-500/10 transition"
            >
              <p className="font-semibold text-white text-sm">{c.name}</p>
              <p className="text-xs text-gray-400">{c.email} · {c.phone}</p>
              <p className="text-xs text-gray-500">{c.address}, {c.city}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-6">Aucun client trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const { company, setCompany } = useCompanyStore();
  const { clients } = useClientStore();
  const { documents, addDocument, updateDocument } = useDocumentStore();

  const isNew = docId === 'new' || docId === 'new-invoice' || docId === 'new-quote' || docId === 'new-contract';
  const typeFromUrl: DocType =
    docId.includes('quote') ? 'quote' :
    docId.includes('contract') ? 'contract' :
    'invoice';

  const existingDoc = documents.find((d) => d.id === docId);
  const isFr = (typeof window !== 'undefined' && localStorage.getItem('lang')) !== 'en';

  const [doc, setDoc] = useState<DocumentData>(() => {
    if (existingDoc) return existingDoc;
    // Auto-fill company info from store
    const docDate = today();
    const dueDate = addDays(docDate, 15);
    const docNumber =
      typeFromUrl === 'invoice'
        ? `INV-${company.invoiceNextNumber}`
        : typeFromUrl === 'quote'
        ? `QTE-${company.quoteNextNumber}`
        : `CTR-${company.contractNextNumber}`;

    return {
      id: uid(),
      type: typeFromUrl,
      number: docNumber,
      date: docDate,
      dueDate,
      status: 'draft',
      // Client (empty, user picks)
      clientId: '',
      clientName: '',
      clientAddress: '',
      clientCity: '',
      clientPhone: '',
      clientEmail: '',
      // Company auto-filled from store ✅
      companyName: company.name,
      companyAddress: company.address,
      companyCity: `${company.city}, ${company.province} ${company.postalCode}`,
      companyProvince: company.province,
      companyPostalCode: company.postalCode,
      companyPhone: company.phone,
      companyEmail: company.email,
      companyGstNumber: company.gstNumber,
      companyLogoUrl: company.logoUrl,
      // Items
      items: [newItem()],
      // Financials
      subtotal: 0,
      gstRate: company.defaultGstRate,
      gstAmount: 0,
      discountPercent: 0,
      discountAmount: 0,
      depositPercent: company.defaultDepositPercent,
      depositAmount: 0,
      total: 0,
      balanceDue: 0,
      // Notes
      notes: company.invoiceNotes,
      paymentTerms: company.paymentTerms,
      // Signature
      signatureData: '',
      signedAt: '',
      // Contract
      scopeOfWork: '',
      startDate: docDate,
      endDate: addDays(docDate, 30),
    };
  });

  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [tab, setTab] = useState<'details' | 'items' | 'financials' | 'preview'>('details');
  const [saved, setSaved] = useState(false);

  // ── Recalculate on items/rates change ─────────────────────────────────────
  useEffect(() => {
    const subtotal = doc.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const discountAmount = (subtotal * doc.discountPercent) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * doc.gstRate) / 100;
    const total = afterDiscount + gstAmount;
    const depositAmount = (total * doc.depositPercent) / 100;
    const balanceDue = total - depositAmount;
    setDoc((d) => ({ ...d, subtotal, discountAmount, gstAmount, total, depositAmount, balanceDue }));
  }, [doc.items, doc.gstRate, doc.discountPercent, doc.depositPercent]);

  // ── Client picker ─────────────────────────────────────────────────────────
  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setDoc((d) => ({
      ...d,
      clientId: client.id,
      clientName: client.name,
      clientAddress: client.address || '',
      clientCity: client.city || '',
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
    }));
    setShowClientPicker(false);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (isNew || !existingDoc) {
      addDocument(doc);
      // Increment next number in company store
      if (doc.type === 'invoice') setCompany({ invoiceNextNumber: company.invoiceNextNumber + 1 });
      if (doc.type === 'quote') setCompany({ quoteNextNumber: company.quoteNextNumber + 1 });
      if (doc.type === 'contract') setCompany({ contractNextNumber: company.contractNextNumber + 1 });
    } else {
      updateDocument(doc.id, doc);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Line items ────────────────────────────────────────────────────────────
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const items = [...doc.items];
    items[idx] = { ...items[idx], [field]: value };
    setDoc((d) => ({ ...d, items }));
  };

  const addItem = () => setDoc((d) => ({ ...d, items: [...d.items, newItem()] }));
  const removeItem = (idx: number) =>
    setDoc((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));

  const label = DOC_LABELS[doc.type];
  const t = (fr: string, en: string) => (isFr ? fr : en);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'details' as const,    label: t('Détails', 'Details') },
    { id: 'items' as const,      label: t('Lignes', 'Items') },
    { id: 'financials' as const, label: t('Montants', 'Amounts') },
    { id: 'preview' as const,    label: t('Aperçu', 'Preview') },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ←
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{label.emoji}</span>
              <span className="font-black text-lg">
                {isFr ? label.fr : label.en} #{doc.number}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[doc.status]}`}>
                {doc.status}
              </span>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              saved ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'
            } text-white`}
          >
            {saved ? '✅' : '💾'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-white/5 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* ── TAB: DETAILS ─────────────────────────────────────────────── */}
        {tab === 'details' && (
          <div className="space-y-4">
            {/* Company Info (auto-filled, editable override) */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                  🏢 {t('Votre compagnie', 'Your Company')}
                </h3>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                  ✅ {t('Auto depuis Réglages', 'Auto from Settings')}
                </span>
              </div>
              {company.logoUrl && (
                <img
                  src={company.logoUrl}
                  alt="logo"
                  className="h-12 mb-3 rounded-lg object-contain"
                />
              )}
              <div className="text-sm text-gray-300 space-y-0.5">
                <p className="font-bold text-white">{doc.companyName}</p>
                <p>{doc.companyAddress}</p>
                <p>{doc.companyCity}</p>
                <p>{doc.companyPhone}</p>
                <p>{doc.companyEmail}</p>
                {doc.companyGstNumber && <p>GST: {doc.companyGstNumber}</p>}
              </div>
              <button
                onClick={() => router.push('/settings')}
                className="mt-3 text-xs text-orange-400 underline"
              >
                ✏️ {t('Modifier dans Réglages', 'Edit in Settings')}
              </button>
            </div>

            {/* Client */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  👤 {t('Client', 'Client')}
                </h3>
                <button
                  onClick={() => setShowClientPicker(true)}
                  className="rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 text-xs font-bold hover:bg-blue-500/30 transition"
                >
                  👥 {t('Choisir client', 'Choose client')}
                </button>
              </div>
              {doc.clientName ? (
                <div className="text-sm text-gray-300 space-y-0.5">
                  <p className="font-bold text-white">{doc.clientName}</p>
                  <p>{doc.clientAddress}</p>
                  <p>{doc.clientCity}</p>
                  <p>{doc.clientPhone}</p>
                  <p>{doc.clientEmail}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { key: 'clientName' as keyof DocumentData, label: t('Nom', 'Name'), placeholder: 'John Smith' },
                    { key: 'clientAddress' as keyof DocumentData, label: t('Adresse', 'Address'), placeholder: '456 Oak Ave' },
                    { key: 'clientCity' as keyof DocumentData, label: t('Ville', 'City'), placeholder: 'Calgary, AB' },
                    { key: 'clientPhone' as keyof DocumentData, label: t('Téléphone', 'Phone'), placeholder: '403-555-0000' },
                    { key: 'clientEmail' as keyof DocumentData, label: 'Email', placeholder: 'client@email.com' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        value={doc[key] as string}
                        onChange={(e) => setDoc((d) => ({ ...d, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">
                📅 {t('Dates', 'Dates')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('Date', 'Date')}</label>
                  <input
                    type="date"
                    value={doc.date}
                    onChange={(e) => setDoc((d) => ({ ...d, date: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {doc.type === 'invoice' ? t('Échéance', 'Due Date') : t('Valide jusqu\'au', 'Valid Until')}
                  </label>
                  <input
                    type="date"
                    value={doc.dueDate}
                    onChange={(e) => setDoc((d) => ({ ...d, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>
              {doc.type === 'contract' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('Début travaux', 'Work Start')}</label>
                    <input
                      type="date"
                      value={doc.startDate}
                      onChange={(e) => setDoc((d) => ({ ...d, startDate: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('Fin travaux', 'Work End')}</label>
                    <input
                      type="date"
                      value={doc.endDate}
                      onChange={(e) => setDoc((d) => ({ ...d, endDate: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contract: Scope of Work */}
            {doc.type === 'contract' && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                  📋 {t('Description des travaux', 'Scope of Work')}
                </h3>
                <textarea
                  value={doc.scopeOfWork}
                  onChange={(e) => setDoc((d) => ({ ...d, scopeOfWork: e.target.value }))}
                  rows={5}
                  placeholder={t('Décrivez les travaux à effectuer...', 'Describe the work to be done...')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Notes */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                📝 {t('Notes / Termes', 'Notes / Terms')}
              </h3>
              <textarea
                value={doc.notes}
                onChange={(e) => setDoc((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
                placeholder={t('Notes additionnelles...', 'Additional notes...')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none resize-none mb-3"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('Termes de paiement', 'Payment Terms')}</label>
                <input
                  value={doc.paymentTerms}
                  onChange={(e) => setDoc((d) => ({ ...d, paymentTerms: e.target.value }))}
                  placeholder="Net 15"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Signature */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
                  ✍️ {t('Signature', 'Signature')}
                </h3>
                <button
                  onClick={() => setShowSignaturePad(!showSignaturePad)}
                  className="text-xs text-orange-400 underline"
                >
                  {showSignaturePad ? t('Masquer', 'Hide') : t('Afficher', 'Show')}
                </button>
              </div>
              {showSignaturePad && (
                <SignaturePad
                  onSave={(data) =>
                    setDoc((d) => ({
                      ...d,
                      signatureData: data,
                      signedAt: new Date().toISOString(),
                    }))
                  }
                  existing={doc.signatureData}
                />
              )}
              {doc.signedAt && (
                <p className="text-xs text-green-400 mt-2">
                  ✅ {t('Signé le', 'Signed on')} {new Date(doc.signedAt).toLocaleDateString('fr-CA')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: LINE ITEMS ──────────────────────────────────────────── */}
        {tab === 'items' && (
          <div className="space-y-3">
            {doc.items.map((item, idx) => (
              <div key={item.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-400 mt-0.5">#{idx + 1}</span>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-red-400 hover:text-red-300 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('Description', 'Description')}</label>
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder={t('Ex: Réparation toiture...', 'e.g. Roof repair...')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('Qté', 'Qty')}</label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(idx, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('Unité', 'Unit')}</label>
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        placeholder="sqft"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">$/unit</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-orange-400">
                      = {fmt(item.qty * item.unitPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addItem}
              className="w-full rounded-2xl border border-dashed border-orange-500/50 bg-orange-500/5 py-4 text-orange-400 font-bold hover:bg-orange-500/10 transition text-sm"
            >
              ＋ {t('Ajouter une ligne', 'Add Line Item')}
            </button>
          </div>
        )}

        {/* ── TAB: FINANCIALS ──────────────────────────────────────────── */}
        {tab === 'financials' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">
                💰 {t('Calcul des montants', 'Amount Calculation')}
              </h3>

              <div className="space-y-3 mb-4">
                {[
                  { label: t('GST (%)', 'GST (%)'), key: 'gstRate' as keyof DocumentData, placeholder: '5' },
                  { label: t('Remise (%)', 'Discount (%)'), key: 'discountPercent' as keyof DocumentData, placeholder: '0' },
                  { label: t('Dépôt requis (%)', 'Required Deposit (%)'), key: 'depositPercent' as keyof DocumentData, placeholder: '30' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <label className="text-sm text-gray-300 flex-1">{label}</label>
                    <input
                      type="number"
                      value={doc[key] as number}
                      onChange={(e) =>
                        setDoc((d) => ({ ...d, [key]: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder={placeholder}
                      className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white text-right focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-black/30 border border-white/10 p-4 space-y-2">
                {([
                  { label: t('Sous-total', 'Subtotal'), value: doc.subtotal, dim: false, bold: false, big: false },
                  { label: `${t('Remise', 'Discount')} (${doc.discountPercent}%)`, value: -doc.discountAmount, dim: true, bold: false, big: false },
                  { label: `GST (${doc.gstRate}%)`, value: doc.gstAmount, dim: true, bold: false, big: false },
                  { label: t('TOTAL', 'TOTAL'), value: doc.total, dim: false, bold: true, big: false },
                  { label: `${t('Dépôt requis', 'Deposit Required')} (${doc.depositPercent}%)`, value: -doc.depositAmount, dim: true, bold: false, big: false },
                  { label: t('SOLDE DÛ', 'BALANCE DUE'), value: doc.balanceDue, dim: false, bold: false, big: true },
                ] as { label: string; value: number; dim: boolean; bold: boolean; big: boolean }[]).map(({ label, value, dim, bold, big }) => (
                  <div key={label} className={`flex justify-between items-center ${(bold || big) ? 'border-t border-white/10 pt-2 mt-2' : ''}`}>
                    <span className={`text-sm ${dim ? 'text-gray-500' : bold ? 'font-bold text-white' : big ? 'font-black text-orange-400 text-base' : 'text-gray-300'}`}>
                      {label}
                    </span>
                    <span className={`font-mono text-sm ${dim ? 'text-gray-500' : bold ? 'font-bold text-white' : big ? 'font-black text-orange-400 text-lg' : 'text-white'}`}>
                      {value < 0 ? `-${fmt(Math.abs(value))}` : fmt(value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* E-Transfer */}
              {company.eTransferEmail && (
                <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                  <p className="text-xs text-green-400 font-semibold mb-1">
                    💳 {t('Paiement par E-Transfer', 'E-Transfer Payment')}
                  </p>
                  <p className="text-sm text-white">{company.eTransferEmail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: PREVIEW ─────────────────────────────────────────────── */}
        {tab === 'preview' && (
          <div className="rounded-2xl bg-white text-gray-900 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                {doc.companyLogoUrl && (
                  <img src={doc.companyLogoUrl} alt="logo" className="h-14 mb-2 object-contain" />
                )}
                <p className="font-black text-xl text-gray-900">{doc.companyName}</p>
                <p className="text-xs text-gray-500">{doc.companyAddress}</p>
                <p className="text-xs text-gray-500">{doc.companyCity}</p>
                <p className="text-xs text-gray-500">{doc.companyPhone}</p>
                <p className="text-xs text-gray-500">{doc.companyEmail}</p>
                {doc.companyGstNumber && (
                  <p className="text-xs text-gray-500">GST: {doc.companyGstNumber}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-black text-2xl text-orange-500">
                  {isFr ? label.fr.toUpperCase() : label.en.toUpperCase()}
                </p>
                <p className="text-sm font-bold text-gray-700">#{doc.number}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('Date', 'Date')}: {doc.date}
                </p>
                <p className="text-xs text-gray-500">
                  {doc.type === 'invoice' ? t('Échéance', 'Due') : t('Valide jusqu\'au', 'Valid Until')}: {doc.dueDate}
                </p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  doc.status === 'paid' ? 'bg-green-100 text-green-700' :
                  doc.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {doc.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Client */}
            {doc.clientName && (
              <div className="mb-6 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  {t('Facturé à', 'Bill To')}
                </p>
                <p className="font-bold">{doc.clientName}</p>
                <p className="text-xs text-gray-600">{doc.clientAddress}</p>
                <p className="text-xs text-gray-600">{doc.clientCity}</p>
                <p className="text-xs text-gray-600">{doc.clientPhone}</p>
                <p className="text-xs text-gray-600">{doc.clientEmail}</p>
              </div>
            )}

            {/* Scope */}
            {doc.type === 'contract' && doc.scopeOfWork && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('Description des travaux', 'Scope of Work')}</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{doc.scopeOfWork}</p>
              </div>
            )}

            {/* Items table */}
            <table className="w-full text-sm mb-5">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-xs font-bold text-gray-500 uppercase">{t('Description', 'Description')}</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">{t('Qté', 'Qty')}</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">$/unit</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-800">{item.description || '—'}</td>
                    <td className="py-2 text-right text-gray-600">{item.qty} {item.unit}</td>
                    <td className="py-2 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                    <td className="py-2 text-right font-semibold">{fmt(item.qty * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="ml-auto w-52 space-y-1 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>{t('Sous-total', 'Subtotal')}</span>
                <span>{fmt(doc.subtotal)}</span>
              </div>
              {doc.discountAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>{t('Remise', 'Discount')} ({doc.discountPercent}%)</span>
                  <span>-{fmt(doc.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST ({doc.gstRate}%)</span>
                <span>{fmt(doc.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-300 pt-1 text-gray-900">
                <span>TOTAL</span>
                <span>{fmt(doc.total)}</span>
              </div>
              {doc.depositAmount > 0 && (
                <>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>{t('Dépôt requis', 'Deposit Required')} ({doc.depositPercent}%)</span>
                    <span>-{fmt(doc.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between font-black text-orange-600 text-base border-t border-orange-200 pt-1">
                    <span>{t('SOLDE DÛ', 'BALANCE DUE')}</span>
                    <span>{fmt(doc.balanceDue)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            {doc.notes && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p>
                <p className="text-xs text-gray-600">{doc.notes}</p>
              </div>
            )}
            {doc.paymentTerms && (
              <p className="text-xs text-gray-500">{t('Termes', 'Terms')}: {doc.paymentTerms}</p>
            )}

            {/* Signature */}
            {doc.signatureData && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                  {t('Signature autorisée', 'Authorized Signature')}
                </p>
                <img src={doc.signatureData} alt="signature" className="h-12 border-b border-gray-400" />
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(doc.signedAt).toLocaleDateString('fr-CA')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* PDF + Send buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-2xl bg-gray-800 hover:bg-gray-700 border border-white/10 py-3.5 text-sm font-bold text-white transition"
          >
            🖨️ {t('Imprimer / PDF', 'Print / PDF')}
          </button>
          <button
            onClick={() => {
              const subject = `${isFr ? label.fr : label.en} #${doc.number} — ${doc.companyName}`;
              const body = `${t('Veuillez trouver ci-joint votre', 'Please find attached your')} ${isFr ? label.fr.toLowerCase() : label.en.toLowerCase()} #${doc.number}.`;
              window.location.href = `mailto:${doc.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 py-3.5 text-sm font-bold text-white transition"
          >
            📧 {t('Envoyer par email', 'Send by Email')}
          </button>
        </div>
      </div>

      {/* Client Picker Modal */}
      {showClientPicker && (
        <ClientPickerModal
          onSelect={handleSelectClient}
          onClose={() => setShowClientPicker(false)}
        />
      )}
    </div>
  );
}
