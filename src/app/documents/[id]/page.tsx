'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useClientStore } from '@/store/useClientStore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientPhone: string;
  clientEmail: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyProvince: string;
  companyPostalCode: string;
  companyPhone: string;
  companyEmail: string;
  companyGstNumber: string;
  companyLogoUrl: string;
  items: LineItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  discountPercent: number;
  discountAmount: number;
  depositPercent: number;
  depositAmount: number;
  total: number;
  balanceDue: number;
  notes: string;
  paymentTerms: string;
  signatureData: string;
  signedAt: string;
  scopeOfWork: string;
  startDate: string;
  endDate: string;
}

// ─── Document Store ───────────────────────────────────────────────────────────
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
      addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),
      updateDocument: (id, updates) =>
        set((s) => ({ documents: s.documents.map((d) => d.id === id ? { ...d, ...updates } : d) })),
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
    }),
    { name: 'document-store-v1' }
  )
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: number) => `$${n.toFixed(2)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
};

// ── Format numéros séquentiels ────────────────────────────────────────────────
// FACT-2026-1001 / DEV-2026-1001 / CONT-2026-1001
function buildDocNumber(type: DocType, nextNum: number): string {
  const year = new Date().getFullYear();
  const prefix = type === 'invoice' ? 'FACT' : type === 'quote' ? 'DEV' : 'CONT';
  return `${prefix}-${year}-${nextNum}`;
}

function newItem(): LineItem {
  return { id: uid(), description: '', qty: 1, unit: 'h', unitPrice: 0 };
}

const DOC_LABELS: Record<DocType, { fr: string; en: string; emoji: string }> = {
  invoice:  { fr: 'Facture',  en: 'Invoice',  emoji: '🧾' },
  quote:    { fr: 'Devis',    en: 'Quote',    emoji: '📋' },
  contract: { fr: 'Contrat',  en: 'Contract', emoji: '📝' },
};

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-gray-500/20 text-gray-300 border-gray-500/30',
  sent:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  paid:     'bg-green-500/20 text-green-300 border-green-500/30',
  overdue:  'bg-red-500/20 text-red-300 border-red-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  declined: 'bg-red-500/20 text-red-300 border-red-500/30',
};

// ─── Signature Pad — TOUJOURS VISIBLE ────────────────────────────────────────
function SignaturePad({ onSave, existing, onClear }: {
  onSave: (data: string) => void;
  existing?: string;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDraw, setHasDraw] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    setDrawing(true); setHasDraw(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); setDrawing(false); };

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasDraw(false); onClear();
  };

  const save = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-yellow-400 uppercase tracking-widest">
        ✍️ Signature
      </label>
      {existing && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-2 mb-1">
          <p className="text-xs text-green-400 mb-1">✅ Signature enregistrée</p>
          <img src={existing} alt="sig" className="max-h-10 mx-auto" />
        </div>
      )}
      <p className="text-xs text-gray-500 text-center">
        {existing ? 'Signez ici pour remplacer ↓' : 'Signez avec votre doigt ↓'}
      </p>
      <canvas
        ref={canvasRef} width={600} height={150}
        onMouseDown={startDraw} onMouseMove={draw}
        onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        className="w-full rounded-xl border-2 border-dashed border-orange-400/50 bg-white/5 cursor-crosshair touch-none"
        style={{ height: '110px' }}
      />
      <div className="flex gap-2">
        <button onClick={clear}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition font-semibold">
          🗑️ Effacer
        </button>
        <button onClick={save} disabled={!hasDraw && !existing}
          className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 py-2.5 text-sm font-bold text-white transition">
          ✅ Enregistrer signature
        </button>
      </div>
    </div>
  );
}

// ─── Client Picker Modal ──────────────────────────────────────────────────────
function ClientPickerModal({ onSelect, onClose }: {
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { clients } = useClientStore();
  const [search, setSearch] = useState('');
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl bg-gray-900 border-t border-white/10 p-5 pb-8 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">👥 Choisir un client</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..." autoFocus
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none mb-3" />
        <div className="overflow-y-auto space-y-2 flex-1">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className="w-full text-left rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:border-orange-400/50 hover:bg-orange-500/10 transition">
              <p className="font-semibold text-white text-sm">{c.name}</p>
              <p className="text-xs text-gray-400">{c.email} · {c.phone}</p>
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

// ─── Barre d'actions fixe en bas ─────────────────────────────────────────────
function ActionBar({ doc, onSave, saved, isFr }: {
  doc: DocumentData; onSave: () => void; saved: boolean; isFr: boolean;
}) {
  const label = DOC_LABELS[doc.type];

  const handleEmail = () => {
    const subj = encodeURIComponent(`${isFr ? label.fr : label.en} #${doc.number} — ${doc.companyName}`);
    const body = encodeURIComponent(
      isFr
        ? `Bonjour ${doc.clientName},\n\nVeuillez trouver ci-joint votre ${label.fr.toLowerCase()} #${doc.number}.\n\nTotal : ${fmt(doc.total)} | Solde dû : ${fmt(doc.balanceDue)}\n\nMerci,\n${doc.companyName}`
        : `Hello ${doc.clientName},\n\nPlease find attached your ${label.en.toLowerCase()} #${doc.number}.\n\nTotal: ${fmt(doc.total)} | Balance due: ${fmt(doc.balanceDue)}\n\nThank you,\n${doc.companyName}`
    );
    window.location.href = `mailto:${doc.clientEmail}?subject=${subj}&body=${body}`;
  };

  const handleSMS = () => {
    const msg = encodeURIComponent(
      `${doc.companyName} — ${isFr ? label.fr : label.en} #${doc.number}\n${isFr ? 'Total' : 'Total'}: ${fmt(doc.total)} | ${isFr ? 'Solde dû' : 'Balance due'}: ${fmt(doc.balanceDue)}`
    );
    window.location.href = `sms:${doc.clientPhone}?body=${msg}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/98 backdrop-blur-md border-t border-white/10 px-3 py-3">
      <div className="flex gap-2 max-w-lg mx-auto">
        <button
          onClick={() => document.getElementById('doc-preview')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-white/5 border border-white/10 py-2.5 hover:bg-white/10 transition">
          <span className="text-base">👁️</span>
          <span className="text-[10px] text-gray-400 font-bold">{isFr ? 'Aperçu' : 'Preview'}</span>
        </button>
        <button onClick={() => window.print()}
          className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-white/5 border border-white/10 py-2.5 hover:bg-white/10 transition">
          <span className="text-base">📄</span>
          <span className="text-[10px] text-gray-400 font-bold">PDF</span>
        </button>
        <button onClick={handleEmail}
          className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-blue-500/20 border border-blue-500/30 py-2.5 hover:bg-blue-500/30 transition">
          <span className="text-base">📧</span>
          <span className="text-[10px] text-blue-300 font-bold">Email</span>
        </button>
        <button onClick={handleSMS}
          className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-green-500/20 border border-green-500/30 py-2.5 hover:bg-green-500/30 transition">
          <span className="text-base">💬</span>
          <span className="text-[10px] text-green-300 font-bold">SMS</span>
        </button>
        <button onClick={onSave}
          className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2.5 transition font-bold border ${
            saved ? 'bg-green-500 border-green-400' : 'bg-orange-500 hover:bg-orange-600 border-orange-400'
          }`}>
          <span className="text-base">{saved ? '✅' : '💾'}</span>
          <span className="text-[10px] text-white font-bold">
            {saved ? (isFr ? 'Sauvé!' : 'Saved!') : (isFr ? 'Sauver' : 'Save')}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const { company, setCompany } = useCompanyStore();
  const { clients } = useClientStore();
  const { documents, addDocument, updateDocument } = useDocumentStore();

  // ── FIX HYDRATATION ── attendre le client avant de lire le store ──────────
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const isNew = !docId || docId === 'new' || docId.startsWith('new-');
  const typeFromUrl: DocType =
    docId?.includes('quote') ? 'quote' :
    docId?.includes('contract') ? 'contract' : 'invoice';

  const existingDoc = documents.find((d) => d.id === docId);
  const isFr = typeof window !== 'undefined' ? localStorage.getItem('lang') !== 'en' : true;
  const t = (fr: string, en: string) => (isFr ? fr : en);

  const [doc, setDoc] = useState<DocumentData>(() => {
    if (existingDoc) return existingDoc;
    const docDate = todayStr();
    const nextNum =
      typeFromUrl === 'invoice' ? company.invoiceNextNumber :
      typeFromUrl === 'quote'   ? company.quoteNextNumber :
                                  company.contractNextNumber;
    return {
      id: uid(),
      type: typeFromUrl,
      number: buildDocNumber(typeFromUrl, nextNum),
      date: docDate,
      dueDate: addDays(docDate, 15),
      status: 'draft',
      clientId: '', clientName: '', clientAddress: '',
      clientCity: '', clientPhone: '', clientEmail: '',
      companyName: company.name,
      companyAddress: company.address,
      companyCity: `${company.city}, ${company.province} ${company.postalCode}`.trim(),
      companyProvince: company.province,
      companyPostalCode: company.postalCode,
      companyPhone: company.phone,
      companyEmail: company.email,
      companyGstNumber: company.gstNumber,
      companyLogoUrl: company.logoUrl,
      items: [newItem()],
      subtotal: 0, gstRate: company.defaultGstRate,
      gstAmount: 0, discountPercent: 0, discountAmount: 0,
      depositPercent: company.defaultDepositPercent,
      depositAmount: 0, total: 0, balanceDue: 0,
      notes: company.invoiceNotes,
      paymentTerms: company.paymentTerms,
      signatureData: '', signedAt: '',
      scopeOfWork: '', startDate: docDate, endDate: addDays(docDate, 30),
    };
  });

  const [showClientPicker, setShowClientPicker] = useState(false);
  const [tab, setTab] = useState<'details' | 'items' | 'financials' | 'preview'>('details');
  const [saved, setSaved] = useState(false);

  // Recalcul automatique
  useEffect(() => {
    const subtotal = doc.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const discountAmount = (subtotal * doc.discountPercent) / 100;
    const after = subtotal - discountAmount;
    const gstAmount = (after * doc.gstRate) / 100;
    const total = after + gstAmount;
    const depositAmount = (total * doc.depositPercent) / 100;
    const balanceDue = total - depositAmount;
    setDoc((d) => ({ ...d, subtotal, discountAmount, gstAmount, total, depositAmount, balanceDue }));
  }, [doc.items, doc.gstRate, doc.discountPercent, doc.depositPercent]);

  const handleSelectClient = (clientId: string) => {
    const c = clients.find((cl) => cl.id === clientId);
    if (!c) return;
    const cr = c as unknown as Record<string, unknown>;
    setDoc((d) => ({
      ...d, clientId: c.id, clientName: c.name,
      clientAddress: cr.address as string ?? '',
      clientCity: cr.city as string ?? '',
      clientPhone: cr.phone as string ?? '',
      clientEmail: cr.email as string ?? '',
    }));
    setShowClientPicker(false);
  };

  const handleSave = () => {
    if (isNew || !existingDoc) {
      addDocument(doc);
      if (doc.type === 'invoice')  setCompany({ invoiceNextNumber:  company.invoiceNextNumber  + 1 });
      if (doc.type === 'quote')    setCompany({ quoteNextNumber:    company.quoteNextNumber    + 1 });
      if (doc.type === 'contract') setCompany({ contractNextNumber: company.contractNextNumber + 1 });
    } else {
      updateDocument(doc.id, doc);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateItem = (idx: number, field: keyof LineItem, val: string | number) => {
    const items = [...doc.items];
    items[idx] = { ...items[idx], [field]: val };
    setDoc((d) => ({ ...d, items }));
  };

  const label = DOC_LABELS[doc.type];

  // ── Spinner pendant hydratation ───────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce">{label.emoji}</div>
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'details'    as const, label: t('Détails','Details') },
    { id: 'items'      as const, label: t('Lignes','Items') },
    { id: 'financials' as const, label: t('Montants','Amounts') },
    { id: 'preview'    as const, label: t('Aperçu','Preview') },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-36">

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-gray-950/98 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-2xl">←</button>
          <span className="text-lg">{label.emoji}</span>
          <span className="font-black text-base flex-1 truncate">
            {isFr ? label.fr : label.en} {doc.number}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[doc.status]}`}>
            {doc.status}
          </span>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {TABS.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tab === tb.id ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ═══ DÉTAILS ═══ */}
        {tab === 'details' && (
          <>
            {/* Compagnie */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">🏢 {t('Compagnie','Company')}</h3>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">✅ Auto</span>
              </div>
              {doc.companyLogoUrl && <img src={doc.companyLogoUrl} alt="logo" className="h-10 mb-2 rounded object-contain" />}
              <div className="text-sm text-gray-300 space-y-0.5">
                <p className="font-bold text-white">{doc.companyName || 'Hailite Xteriors'}</p>
                {doc.companyAddress && <p>{doc.companyAddress}</p>}
                {doc.companyCity && <p>{doc.companyCity}</p>}
                {doc.companyPhone && <p>{doc.companyPhone}</p>}
                {doc.companyEmail && <p>{doc.companyEmail}</p>}
                {doc.companyGstNumber && <p className="text-xs">GST: {doc.companyGstNumber}</p>}
              </div>
              <button onClick={() => router.push('/settings')} className="mt-2 text-xs text-orange-400 underline">
                ✏️ {t('Modifier dans Réglages','Edit in Settings')}
              </button>
            </div>

            {/* Client */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">👤 Client</h3>
                <button onClick={() => setShowClientPicker(true)}
                  className="rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 text-xs font-bold hover:bg-blue-500/30 transition">
                  👥 {t('Choisir','Choose')}
                </button>
              </div>
              {doc.clientName ? (
                <div className="text-sm text-gray-300 space-y-0.5">
                  <p className="font-bold text-white">{doc.clientName}</p>
                  {doc.clientAddress && <p>{doc.clientAddress}</p>}
                  {doc.clientCity && <p>{doc.clientCity}</p>}
                  {doc.clientPhone && <p>{doc.clientPhone}</p>}
                  {doc.clientEmail && <p>{doc.clientEmail}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  {([
                    { k: 'clientName'    as keyof DocumentData, lbl: t('Nom','Name'),       ph: 'John Smith'       },
                    { k: 'clientAddress' as keyof DocumentData, lbl: t('Adresse','Address'),ph: '456 Oak Ave'      },
                    { k: 'clientCity'    as keyof DocumentData, lbl: t('Ville','City'),      ph: 'Calgary, AB'      },
                    { k: 'clientPhone'   as keyof DocumentData, lbl: t('Tél','Phone'),       ph: '403-555-0000'     },
                    { k: 'clientEmail'   as keyof DocumentData, lbl: 'Email',                ph: 'client@email.com' },
                  ] as {k:keyof DocumentData;lbl:string;ph:string}[]).map(({ k, lbl, ph }) => (
                    <div key={k as string}>
                      <label className="block text-xs text-gray-500 mb-1">{lbl}</label>
                      <input value={doc[k] as string}
                        onChange={(e) => setDoc((d) => ({ ...d, [k]: e.target.value }))}
                        placeholder={ph}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">📅 {t('Dates','Dates')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('Date','Date')}</label>
                  <input type="date" value={doc.date} onChange={(e) => setDoc((d) => ({ ...d, date: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {doc.type === 'invoice' ? t('Échéance','Due Date') : t('Valide jusqu\'au','Valid Until')}
                  </label>
                  <input type="date" value={doc.dueDate} onChange={(e) => setDoc((d) => ({ ...d, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                </div>
              </div>
              {doc.type === 'contract' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('Début','Start')}</label>
                    <input type="date" value={doc.startDate} onChange={(e) => setDoc((d) => ({ ...d, startDate: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('Fin','End')}</label>
                    <input type="date" value={doc.endDate} onChange={(e) => setDoc((d) => ({ ...d, endDate: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Scope — contrat */}
            {doc.type === 'contract' && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                  📋 {t('Description des travaux','Scope of Work')}
                </h3>
                <textarea value={doc.scopeOfWork}
                  onChange={(e) => setDoc((d) => ({ ...d, scopeOfWork: e.target.value }))}
                  rows={5} placeholder={t('Décrivez les travaux...','Describe the work...')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none resize-none" />
              </div>
            )}

            {/* Notes */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">📝 Notes</h3>
              <textarea value={doc.notes} onChange={(e) => setDoc((d) => ({ ...d, notes: e.target.value }))}
                rows={3} placeholder="Notes..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none resize-none mb-3" />
              <label className="block text-xs text-gray-500 mb-1">{t('Termes de paiement','Payment Terms')}</label>
              <input value={doc.paymentTerms} onChange={(e) => setDoc((d) => ({ ...d, paymentTerms: e.target.value }))}
                placeholder="Net 15"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
            </div>

            {/* SIGNATURE — toujours visible */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <SignaturePad
                onSave={(data) => setDoc((d) => ({ ...d, signatureData: data, signedAt: new Date().toISOString() }))}
                existing={doc.signatureData}
                onClear={() => setDoc((d) => ({ ...d, signatureData: '', signedAt: '' }))}
              />
              {doc.signedAt && (
                <p className="text-xs text-green-400 mt-2">
                  ✅ {t('Signé le','Signed')} {new Date(doc.signedAt).toLocaleDateString('fr-CA')}
                </p>
              )}
            </div>
          </>
        )}

        {/* ═══ LIGNES ═══ */}
        {tab === 'items' && (
          <div className="space-y-3">
            {doc.items.map((item, idx) => (
              <div key={item.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                  <button onClick={() => setDoc((d) => ({ ...d, items: d.items.filter((_,i) => i!==idx) }))}
                    className="text-red-400 hover:text-red-300">✕</button>
                </div>
                <div className="space-y-2">
                  <input value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    placeholder={t('Description...','Description...')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('Qté','Qty')}</label>
                      <input type="number" value={item.qty}
                        onChange={(e) => updateItem(idx, 'qty', parseFloat(e.target.value)||0)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('Unité','Unit')}</label>
                      <input value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        placeholder="h / pi²"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">$/u</label>
                      <input type="number" value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value)||0)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                    </div>
                  </div>
                  <p className="text-right text-sm font-bold text-orange-400">= {fmt(item.qty * item.unitPrice)}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setDoc((d) => ({ ...d, items: [...d.items, newItem()] }))}
              className="w-full rounded-2xl border border-dashed border-orange-500/50 bg-orange-500/5 py-4 text-orange-400 font-bold hover:bg-orange-500/10 transition text-sm">
              ＋ {t('Ajouter une ligne','Add Line')}
            </button>
          </div>
        )}

        {/* ═══ MONTANTS ═══ */}
        {tab === 'financials' && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">💰 {t('Montants','Amounts')}</h3>
            <div className="space-y-3">
              {([
                { lbl: 'GST (%)',                              k: 'gstRate'         as keyof DocumentData, ph: '5'  },
                { lbl: t('Remise (%)','Discount (%)'),         k: 'discountPercent' as keyof DocumentData, ph: '0'  },
                { lbl: t('Dépôt requis (%)','Deposit (%)'),    k: 'depositPercent'  as keyof DocumentData, ph: '30' },
              ] as {lbl:string;k:keyof DocumentData;ph:string}[]).map(({ lbl, k, ph }) => (
                <div key={k as string} className="flex items-center justify-between gap-3">
                  <label className="text-sm text-gray-300 flex-1">{lbl}</label>
                  <input type="number" value={doc[k] as number}
                    onChange={(e) => setDoc((d) => ({ ...d, [k]: parseFloat(e.target.value)||0 }))}
                    placeholder={ph}
                    className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white text-right focus:border-orange-400 focus:outline-none" />
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4 space-y-2">
              {([
                { lbl: t('Sous-total','Subtotal'),                                  val: doc.subtotal,       cls: 'text-gray-400 text-sm'                        },
                { lbl: `${t('Remise','Disc.')} (${doc.discountPercent}%)`,          val: -doc.discountAmount,cls: 'text-gray-500 text-sm'                        },
                { lbl: `GST (${doc.gstRate}%)`,                                     val: doc.gstAmount,      cls: 'text-gray-400 text-sm'                        },
                { lbl: 'TOTAL',                                                      val: doc.total,          cls: 'font-bold text-white text-sm border-t border-white/10 pt-2 mt-2' },
                { lbl: `${t('Dépôt','Dep.')} (${doc.depositPercent}%)`,             val: -doc.depositAmount, cls: 'text-gray-500 text-xs'                        },
                { lbl: t('SOLDE DÛ','BALANCE DUE'),                                 val: doc.balanceDue,     cls: 'font-black text-orange-400 text-base border-t border-white/10 pt-2 mt-2' },
              ] as {lbl:string;val:number;cls:string}[]).map(({ lbl, val, cls }) => (
                <div key={lbl} className={`flex justify-between items-center ${cls}`}>
                  <span>{lbl}</span>
                  <span className="font-mono">{val < 0 ? `-${fmt(Math.abs(val))}` : fmt(val)}</span>
                </div>
              ))}
            </div>
            {company.eTransferEmail && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                <p className="text-xs text-green-400 font-semibold mb-1">💳 E-Transfer</p>
                <p className="text-sm text-white">{company.eTransferEmail}</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ APERÇU ═══ */}
        {tab === 'preview' && (
          <div id="doc-preview" className="rounded-2xl bg-white text-gray-900 p-5 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                {doc.companyLogoUrl && <img src={doc.companyLogoUrl} alt="logo" className="h-12 mb-2 object-contain" />}
                <p className="font-black text-xl">{doc.companyName || 'Hailite Xteriors'}</p>
                {doc.companyAddress && <p className="text-xs text-gray-500">{doc.companyAddress}</p>}
                {doc.companyCity && <p className="text-xs text-gray-500">{doc.companyCity}</p>}
                {doc.companyPhone && <p className="text-xs text-gray-500">{doc.companyPhone}</p>}
                {doc.companyEmail && <p className="text-xs text-gray-500">{doc.companyEmail}</p>}
                {doc.companyGstNumber && <p className="text-xs text-gray-500">GST: {doc.companyGstNumber}</p>}
              </div>
              <div className="text-right">
                <p className="font-black text-2xl text-orange-500">
                  {(isFr ? label.fr : label.en).toUpperCase()}
                </p>
                <p className="font-bold text-gray-700">#{doc.number}</p>
                <p className="text-xs text-gray-500">{t('Date','Date')}: {doc.date}</p>
                <p className="text-xs text-gray-500">
                  {doc.type==='invoice' ? t('Échéance','Due') : t('Valide','Valid')}: {doc.dueDate}
                </p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  doc.status==='paid'?'bg-green-100 text-green-700':
                  doc.status==='draft'?'bg-gray-100 text-gray-600':'bg-orange-100 text-orange-700'
                }`}>{doc.status.toUpperCase()}</span>
              </div>
            </div>
            {doc.clientName && (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('Facturé à','Bill To')}</p>
                <p className="font-bold">{doc.clientName}</p>
                {doc.clientAddress && <p className="text-xs text-gray-600">{doc.clientAddress}</p>}
                {doc.clientCity && <p className="text-xs text-gray-600">{doc.clientCity}</p>}
                {doc.clientPhone && <p className="text-xs text-gray-600">{doc.clientPhone}</p>}
                {doc.clientEmail && <p className="text-xs text-gray-600">{doc.clientEmail}</p>}
              </div>
            )}
            {doc.type==='contract' && doc.scopeOfWork && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('Travaux','Scope')}</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{doc.scopeOfWork}</p>
              </div>
            )}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-xs font-bold text-gray-500 uppercase">{t('Description','Description')}</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">{t('Qté','Qty')}</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">$/u</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-800">{item.description||'—'}</td>
                    <td className="py-2 text-right text-gray-600">{item.qty} {item.unit}</td>
                    <td className="py-2 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                    <td className="py-2 text-right font-semibold">{fmt(item.qty*item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto w-52 space-y-1 text-sm mb-4">
              <div className="flex justify-between text-gray-600"><span>{t('Sous-total','Subtotal')}</span><span>{fmt(doc.subtotal)}</span></div>
              {doc.discountAmount>0 && <div className="flex justify-between text-gray-600"><span>{t('Remise','Disc.')} ({doc.discountPercent}%)</span><span>−{fmt(doc.discountAmount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>GST ({doc.gstRate}%)</span><span>{fmt(doc.gstAmount)}</span></div>
              <div className="flex justify-between font-bold border-t border-gray-300 pt-1"><span>TOTAL</span><span>{fmt(doc.total)}</span></div>
              {doc.depositAmount>0 && <>
                <div className="flex justify-between text-xs text-gray-500"><span>{t('Dépôt','Dep.')} ({doc.depositPercent}%)</span><span>−{fmt(doc.depositAmount)}</span></div>
                <div className="flex justify-between font-black text-orange-600 text-base border-t border-orange-200 pt-1"><span>{t('SOLDE DÛ','BALANCE DUE')}</span><span>{fmt(doc.balanceDue)}</span></div>
              </>}
            </div>
            {doc.notes && <div className="border-t border-gray-200 pt-3 mb-2"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p><p className="text-xs text-gray-600">{doc.notes}</p></div>}
            {doc.paymentTerms && <p className="text-xs text-gray-500">{t('Termes','Terms')}: {doc.paymentTerms}</p>}
            {company.eTransferEmail && <p className="text-xs text-gray-500 mt-1">💳 E-Transfer: {company.eTransferEmail}</p>}
            {doc.signatureData && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('Signature','Signature')}</p>
                <img src={doc.signatureData} alt="sig" className="h-12 border-b border-gray-400" />
                <p className="text-xs text-gray-400 mt-1">{new Date(doc.signedAt).toLocaleDateString('fr-CA')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showClientPicker && <ClientPickerModal onSelect={handleSelectClient} onClose={() => setShowClientPicker(false)} />}

      {/* BARRE D'ACTIONS FIXE EN BAS */}
      <ActionBar doc={doc} onSave={handleSave} saved={saved} isFr={isFr} />
    </div>
  );
}
