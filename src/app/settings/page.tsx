'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyStore, CompanyInfo } from '@/store/useCompanyStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import BottomNav from '@/components/BottomNav';

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

function Section({
  title, emoji, children, defaultOpen = false,
}: {
  title: string; emoji: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white">{emoji} {title}</span>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          <ChevronRight />
        </span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">{children}</div>}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder = '', type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400 transition"
      />
    </div>
  );
}

function NumberField({
  label, value, onChange, min = 0, max = 100, step = 1, suffix = '',
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-28 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400 transition"
        />
        {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function TextArea({
  label, value, onChange, placeholder = '', rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400 transition resize-none"
      />
    </div>
  );
}

type AnyEmployee = {
  id: string | number;
  role?: string;
  isAdmin?: boolean;
  name?: string;
  hourlyRate?: number;
};

export default function SettingsPage() {
  const router = useRouter();

  const company = useCompanyStore((state) => state.company);
  const updateCompany = useCompanyStore((state) => state.updateCompany);

  const employees = useEmployeeStore((state) => state.employees) as AnyEmployee[];
  const storeState = useEmployeeStore((state) => state) as unknown as {
    currentEmployeeId?: string | number;
  };
  const currentEmployeeId = storeState.currentEmployeeId;

  const currentEmployee = currentEmployeeId != null
    ? employees.find((e) => e.id === currentEmployeeId)
    : undefined;

  const isAdmin =
    currentEmployee?.role === 'admin' ||
    currentEmployee?.isAdmin === true ||
    currentEmployeeId == null;

  const [form, setForm] = useState<CompanyInfo>({ ...company });
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(company.logo || company.logoUrl || '');
  const fileRef = useRef<HTMLInputElement>(null);

  const setField = (field: keyof CompanyInfo) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setLogoPreview(data);
      // Sync les deux champs logo pour compatibilité
      setForm((prev) => ({ ...prev, logo: data, logoUrl: data }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Sync logoUrl = logo pour compatibilité documents
    const finalForm = { ...form, logoUrl: form.logo || form.logoUrl };
    updateCompany(finalForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">🔒</div>
            <h2 className="text-xl font-bold text-white">Accès restreint</h2>
            <p className="text-gray-400 text-sm">Seuls les administrateurs peuvent accéder aux réglages.</p>
            <button onClick={() => router.push('/')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition">
              Retour au tableau de bord
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">⚙️ Réglages</h1>
          <p className="text-xs text-gray-400">Hailite Xteriors</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
          }`}>
          {saved ? '✅ Sauvegardé!' : <><SaveIcon /> Sauvegarder</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-1">

        {/* ── Infos compagnie ── */}
        <Section emoji="🏢" title="Informations Compagnie" defaultOpen>
          <div className="flex items-center gap-4 mb-2">
            <div onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden bg-white/5">
              {logoPreview
                ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                : <div className="text-center text-gray-500"><ImageIcon /><p className="text-xs mt-1">Logo</p></div>
              }
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Logo compagnie</p>
              <p className="text-xs text-gray-400">PNG, JPG — max 2 MB</p>
              <button onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline">
                Changer le logo
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
          <Field label="Nom de la compagnie" value={form.name} onChange={setField('name')} placeholder="Hailite Xteriors" />
          <Field label="Adresse" value={form.address} onChange={setField('address')} placeholder="123 Main St" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville" value={form.city} onChange={setField('city')} placeholder="Calgary" />
            <Field label="Province" value={form.province} onChange={setField('province')} placeholder="AB" />
          </div>
          <Field label="Code postal" value={form.postalCode} onChange={setField('postalCode')} placeholder="T2P 1J9" />
          <Field label="Téléphone" value={form.phone} onChange={setField('phone')} type="tel" placeholder="(403) 555-0100" />
          <Field label="Courriel" value={form.email} onChange={setField('email')} type="email" placeholder="info@hailitexteriors.ca" />
          <Field label="Site web" value={form.website} onChange={setField('website')} placeholder="www.hailitexteriors.ca" />
        </Section>

        {/* ── Numéros légaux ── */}
        <Section emoji="📋" title="Numéros légaux & Taxes">
          <Field label="Numéro GST (Alberta 5%)" value={form.gstNumber} onChange={setField('gstNumber')} placeholder="123456789 RT0001" />
          <Field label="Numéro WCB" value={form.wcbNumber} onChange={setField('wcbNumber')} placeholder="WCB-XXXX" />
          <Field label="Numéro de licence" value={form.licenseNumber} onChange={setField('licenseNumber')} placeholder="Contractor #" />
          <NumberField
            label="Taux GST par défaut (%)"
            value={form.defaultGstRate}
            onChange={(v) => setForm((p) => ({ ...p, gstRate: v, defaultGstRate: v }))}
            step={0.5}
            suffix="Alberta = 5% GST seulement"
          />
        </Section>

        {/* ── Paiement ── */}
        <Section emoji="💳" title="Paiement & Modalités">
          <Field label="E-Transfer (courriel)" value={form.eTransferEmail} onChange={setField('eTransferEmail')} type="email" placeholder="factures@hailitexteriors.ca" />
          <Field label="Délai de paiement" value={form.paymentTerms} onChange={setField('paymentTerms')} placeholder="Net 30" />
          <NumberField
            label="Dépôt par défaut (%)"
            value={form.defaultDepositPercent}
            onChange={(v) => setForm((p) => ({ ...p, defaultDepositPercent: v }))}
            suffix="% du total"
          />
          <TextArea label="Info bancaire" value={form.bankInfo} onChange={setField('bankInfo')} placeholder="E-Transfer : factures@hailitexteriors.ca" rows={2} />
        </Section>

        {/* ── Numéros séquentiels ── */}
        <Section emoji="🔢" title="Numéros séquentiels">
          <p className="text-xs text-gray-500">Prochain numéro pour chaque type de document.</p>
          <NumberField
            label="Prochain # Facture"
            value={form.invoiceNextNumber}
            onChange={(v) => setForm((p) => ({ ...p, invoiceNextNumber: Math.floor(v) }))}
            min={1} max={99999} step={1}
            suffix="→ FACT-2026-XXXX"
          />
          <NumberField
            label="Prochain # Devis"
            value={form.quoteNextNumber}
            onChange={(v) => setForm((p) => ({ ...p, quoteNextNumber: Math.floor(v) }))}
            min={1} max={99999} step={1}
            suffix="→ DEV-2026-XXXX"
          />
          <NumberField
            label="Prochain # Contrat"
            value={form.contractNextNumber}
            onChange={(v) => setForm((p) => ({ ...p, contractNextNumber: Math.floor(v) }))}
            min={1} max={99999} step={1}
            suffix="→ CONT-2026-XXXX"
          />
        </Section>

        {/* ── Notes par défaut ── */}
        <Section emoji="📝" title="Notes & Conditions par défaut">
          <TextArea
            label="Notes par défaut (factures/devis)"
            value={form.invoiceNotes}
            onChange={(v) => setForm((p) => ({ ...p, invoiceNotes: v, defaultNotes: v }))}
            placeholder="Merci pour votre confiance!"
            rows={3}
          />
          <TextArea
            label="Conditions générales"
            value={form.defaultTerms}
            onChange={setField('defaultTerms')}
            placeholder="Paiement dû dans les 30 jours..."
            rows={3}
          />
        </Section>

        {/* ── Sécurité ── */}
        <Section emoji="🔒" title="Sécurité & PIN Admin">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-sm text-orange-300">
            ⚠️ Pour changer le PIN admin, utilisez <strong>Livre de paye → Reset PIN</strong>.
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300">
            💡 Connecté comme : <strong>{currentEmployee?.name ?? 'Admin'}</strong> (Administrateur)
          </div>
        </Section>

        {/* ── Employés ── */}
        <Section emoji="👷" title="Employés actifs">
          <div className="space-y-2">
            {employees.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Aucun employé enregistré.</p>
            ) : (
              employees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-white text-sm font-medium">{emp.name}</p>
                    <p className="text-gray-400 text-xs">
                      {emp.role === 'admin' || emp.isAdmin ? '👑 Admin' : '👷 Employé'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {emp.hourlyRate ? `$${emp.hourlyRate}/h` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
          <button onClick={() => router.push('/paye')}
            className="w-full mt-2 py-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-600/30 transition">
            Gérer dans Livre de paye →
          </button>
        </Section>

        {/* Bouton save bas */}
        <button onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}>
          {saved ? '✅ Réglages sauvegardés!' : <><SaveIcon /> Sauvegarder tous les réglages</>}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
