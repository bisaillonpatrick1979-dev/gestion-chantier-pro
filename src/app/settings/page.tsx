'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import BottomNav from '@/components/BottomNav';

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
const Icon = {
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  ),
  Tax: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  Palette: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="20 6 9 12 4 9"/>
    </svg>
  ),
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 font-semibold text-white">
          <span className="text-blue-400">{icon}</span>
          {title}
        </div>
        <span
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        >
          <Icon.ChevronRight />
        </span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">{children}</div>}
    </div>
  );
}

// ─── Champ texte ──────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
function TextArea({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition resize-none"
      />
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { company, updateCompany } = useCompanyStore();
  const { employees, currentEmployeeId } = useEmployeeStore();

  // Vraie logique admin — basée sur l'employé connecté
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId);
  const isAdmin = currentEmployee?.role === 'admin' || currentEmployee?.isAdmin === true;

  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(company.logo || '');
  const fileRef = useRef<HTMLInputElement>(null);

  // État local pour édition
  const [form, setForm] = useState({ ...company });

  const set = (field: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setLogoPreview(data);
      setForm((prev) => ({ ...prev, logo: data }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateCompany(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Si employé non-admin, afficher message restreint ──────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">🔒</div>
            <h2 className="text-xl font-bold text-white">Accès restreint</h2>
            <p className="text-gray-400 text-sm">
              Seuls les administrateurs peuvent accéder aux réglages.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition"
            >
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
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
          }`}
        >
          {saved ? (
            <>
              <Icon.Check /> Sauvegardé!
            </>
          ) : (
            <>
              <Icon.Save /> Sauvegarder
            </>
          )}
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-1">

        {/* ── Infos Compagnie ── */}
        <Section icon={<Icon.Building />} title="Informations Compagnie" defaultOpen>
          {/* Logo */}
          <div className="flex items-center gap-4 mb-2">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden bg-white/5"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Icon.Image />
                  <p className="text-xs text-gray-500 mt-1">Logo</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Logo compagnie</p>
              <p className="text-xs text-gray-400">PNG, JPG, SVG — max 2 MB</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Changer le logo
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <Field label="Nom de la compagnie" value={form.name} onChange={set('name')} placeholder="Hailite Xteriors" />
          <Field label="Adresse" value={form.address} onChange={set('address')} placeholder="123 Main St" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville" value={form.city} onChange={set('city')} placeholder="Calgary" />
            <Field label="Province" value={form.province} onChange={set('province')} placeholder="AB" />
          </div>
          <Field label="Code postal" value={form.postalCode} onChange={set('postalCode')} placeholder="T2P 1J9" />
          <Field label="Téléphone" value={form.phone} onChange={set('phone')} placeholder="(403) 555-0100" type="tel" />
          <Field label="Courriel" value={form.email} onChange={set('email')} placeholder="info@hailitexteriors.ca" type="email" />
          <Field label="Site web" value={form.website} onChange={set('website')} placeholder="www.hailitexteriors.ca" />
        </Section>

        {/* ── Numéros légaux ── */}
        <Section icon={<Icon.Tax />} title="Numéros légaux & Taxes">
          <Field label="Numéro GST (Alberta 5%)" value={form.gstNumber} onChange={set('gstNumber')} placeholder="123456789 RT0001" />
          <Field label="Numéro WCB" value={form.wcbNumber} onChange={set('wcbNumber')} placeholder="WCB-XXXX" />
          <Field label="Numéro de licence" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="Contractor #" />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Taux GST (%)</label>
            <input
              type="number"
              value={form.gstRate}
              onChange={(e) => setForm((prev) => ({ ...prev, gstRate: Number(e.target.value) }))}
              min={0}
              max={100}
              step={0.5}
              className="w-32 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400 transition"
            />
            <span className="ml-2 text-gray-400 text-sm">Alberta = 5% (GST seulement)</span>
          </div>
        </Section>

        {/* ── Paiement ── */}
        <Section icon={<Icon.Building />} title="Paiement & Modalités">
          <Field label="Délai de paiement" value={form.paymentTerms} onChange={set('paymentTerms')} placeholder="Net 30" />
          <TextArea
            label="Info bancaire / e-Transfer"
            value={form.bankInfo}
            onChange={set('bankInfo')}
            placeholder="E-Transfer : factures@hailitexteriors.ca"
            rows={2}
          />
        </Section>

        {/* ── Notes documents ── */}
        <Section icon={<Icon.Bell />} title="Notes & Conditions par défaut">
          <TextArea
            label="Notes par défaut (factures/devis)"
            value={form.defaultNotes}
            onChange={set('defaultNotes')}
            placeholder="Merci pour votre confiance!"
            rows={3}
          />
          <TextArea
            label="Conditions générales par défaut"
            value={form.defaultTerms}
            onChange={set('defaultTerms')}
            placeholder="Paiement dû dans les 30 jours..."
            rows={3}
          />
        </Section>

        {/* ── Sécurité PIN ── */}
        <Section icon={<Icon.Lock />} title="Sécurité & PIN Admin">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-sm text-orange-300">
            ⚠️ Pour changer le PIN admin, utilisez la page <strong>Livre de paye</strong> → Reset PIN.
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300">
            💡 Connecté comme : <strong>{currentEmployee?.name || 'Admin'}</strong> (Admin)
          </div>
        </Section>

        {/* ── Employés ── */}
        <Section icon={<Icon.User />} title="Employés actifs">
          <div className="space-y-2">
            {employees.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Aucun employé enregistré.</p>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{emp.name}</p>
                    <p className="text-gray-400 text-xs capitalize">{emp.role === 'admin' ? '👑 Admin' : '👷 Employé'}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {emp.hourlyRate ? `$${emp.hourlyRate}/h` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => router.push('/paye')}
            className="w-full mt-2 py-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-600/30 transition"
          >
            Gérer dans Livre de paye →
          </button>
        </Section>

        {/* Bouton save en bas aussi */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-98'
          }`}
        >
          {saved ? (
            <>✅ Réglages sauvegardés!</>
          ) : (
            <>
              <Icon.Save /> Sauvegarder tous les réglages
            </>
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

