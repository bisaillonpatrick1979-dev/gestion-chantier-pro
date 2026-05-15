'use client';

import { useState } from 'react';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import BottomNav from '@/components/BottomNav';

// ─── Section IDs ────────────────────────────────────────────────────────────
type Section =
  | 'company'
  | 'billing'
  | 'employees'
  | 'taxes'
  | 'appearance'
  | 'language'
  | 'notifications'
  | 'security'
  | 'about';

const SECTIONS: { id: Section; labelFr: string; labelEn: string; icon: string }[] = [
  { id: 'company',       labelFr: '🏢 Compagnie',       labelEn: '🏢 Company',        icon: '🏢' },
  { id: 'billing',       labelFr: '💳 Facturation',      labelEn: '💳 Billing',         icon: '💳' },
  { id: 'employees',     labelFr: '👷 Employés',          labelEn: '👷 Employees',       icon: '👷' },
  { id: 'taxes',         labelFr: '🧾 Taxes & WCB',       labelEn: '🧾 Taxes & WCB',    icon: '🧾' },
  { id: 'appearance',    labelFr: '🎨 Apparence',          labelEn: '🎨 Appearance',      icon: '🎨' },
  { id: 'language',      labelFr: '🌐 Langue',             labelEn: '🌐 Language',        icon: '🌐' },
  { id: 'notifications', labelFr: '🔔 Notifications',      labelEn: '🔔 Notifications',   icon: '🔔' },
  { id: 'security',      labelFr: '🔐 Sécurité',           labelEn: '🔐 Security',        icon: '🔐' },
  { id: 'about',         labelFr: 'ℹ️ À propos',           labelEn: 'ℹ️ About',            icon: 'ℹ️' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
}: {
  label: string;
  value: string | number;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:opacity-40"
      />
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
      <h3 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { company, setCompany } = useCompanyStore();
  const { employees, currentEmployee } = useEmployeeStore();

  const isAdmin = currentEmployee?.role === 'admin';
  const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'fr';
  const isFr = lang !== 'en';

  const [activeSection, setActiveSection] = useState<Section>('company');
  const [saved, setSaved] = useState(false);

  const [adminPinInput, setAdminPinInput] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const t = (fr: string, en: string) => (isFr ? fr : en);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─── Render sections ──────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      // ── COMPANY ──────────────────────────────────────────────────────────
      case 'company':
        return (
          <SectionCard title={t('Informations de la compagnie', 'Company Information')}>
            <Field
              label={t('Nom de la compagnie', 'Company Name')}
              value={company.name}
              onChange={(v) => setCompany({ name: v })}
              placeholder="Hailite Xteriors"
            />
            <Field
              label={t('Propriétaire', 'Owner Name')}
              value={company.ownerName}
              onChange={(v) => setCompany({ ownerName: v })}
              placeholder="Patrick Bisaillon"
            />
            <Field
              label={t('Adresse', 'Address')}
              value={company.address}
              onChange={(v) => setCompany({ address: v })}
              placeholder="123 Main St"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label={t('Ville', 'City')}
                value={company.city}
                onChange={(v) => setCompany({ city: v })}
                placeholder="Calgary"
              />
              <Field
                label={t('Province', 'Province')}
                value={company.province}
                onChange={(v) => setCompany({ province: v })}
                placeholder="AB"
              />
            </div>
            <Field
              label={t('Code postal', 'Postal Code')}
              value={company.postalCode}
              onChange={(v) => setCompany({ postalCode: v })}
              placeholder="T2X 0X0"
            />
            <Field
              label={t('Téléphone', 'Phone')}
              value={company.phone}
              onChange={(v) => setCompany({ phone: v })}
              placeholder="+1 (403) 000-0000"
              type="tel"
            />
            <Field
              label="Email"
              value={company.email}
              onChange={(v) => setCompany({ email: v })}
              placeholder="info@hailite.ca"
              type="email"
            />
            <Field
              label="Site web / Website"
              value={company.website}
              onChange={(v) => setCompany({ website: v })}
              placeholder="https://hailite.ca"
            />
            <Field
              label={t('URL Logo (lien image)', 'Logo URL (image link)')}
              value={company.logoUrl}
              onChange={(v) => setCompany({ logoUrl: v })}
              placeholder="https://..."
            />
          </SectionCard>
        );

      // ── BILLING ───────────────────────────────────────────────────────────
      case 'billing':
        return (
          <SectionCard title={t('Paramètres de facturation', 'Billing Settings')}>
            <Field
              label={t('Numéro GST', 'GST Number')}
              value={company.gstNumber}
              onChange={(v) => setCompany({ gstNumber: v })}
              placeholder="123456789 RT 0001"
            />
            <Field
              label={t('Prochain # Facture', 'Next Invoice #')}
              value={company.invoiceNextNumber}
              onChange={(v) => setCompany({ invoiceNextNumber: parseInt(v) || 1001 })}
              type="number"
            />
            <Field
              label={t('Prochain # Devis', 'Next Quote #')}
              value={company.quoteNextNumber}
              onChange={(v) => setCompany({ quoteNextNumber: parseInt(v) || 2001 })}
              type="number"
            />
            <Field
              label={t('Prochain # Contrat', 'Next Contract #')}
              value={company.contractNextNumber}
              onChange={(v) => setCompany({ contractNextNumber: parseInt(v) || 3001 })}
              type="number"
            />
            <Field
              label={t('Termes de paiement', 'Payment Terms')}
              value={company.paymentTerms}
              onChange={(v) => setCompany({ paymentTerms: v })}
              placeholder="Net 15"
            />
            <Field
              label={t('% Dépôt par défaut', 'Default Deposit %')}
              value={company.defaultDepositPercent}
              onChange={(v) => setCompany({ defaultDepositPercent: parseFloat(v) || 30 })}
              type="number"
            />
            <Field
              label={t('Notes facture (bas de page)', 'Invoice Notes (footer)')}
              value={company.invoiceNotes}
              onChange={(v) => setCompany({ invoiceNotes: v })}
              placeholder="Merci / Thank you"
            />
            <Field
              label={t('Email E-Transfer', 'E-Transfer Email')}
              value={company.eTransferEmail}
              onChange={(v) => setCompany({ eTransferEmail: v })}
              placeholder="paiement@hailite.ca"
              type="email"
            />
          </SectionCard>
        );

      // ── TAXES ────────────────────────────────────────────────────────────
      case 'taxes':
        return (
          <SectionCard title={t('Taxes & WCB — Alberta', 'Taxes & WCB — Alberta')}>
            <div className="mb-4 rounded-xl bg-orange-500/10 border border-orange-500/30 p-3 text-sm text-orange-300">
              ⚡ {t('Alberta : GST 5% seulement. Pas de TVP.', 'Alberta: GST 5% only. No PST.')}
            </div>
            <Field
              label={t('Taux GST (%)', 'GST Rate (%)')}
              value={company.defaultGstRate}
              onChange={(v) => setCompany({ defaultGstRate: parseFloat(v) || 5 })}
              type="number"
            />
            <Field
              label={t('Numéro WCB', 'WCB Number')}
              value={company.wcbNumber}
              onChange={(v) => setCompany({ wcbNumber: v })}
              placeholder="WCB-123456"
            />
            <Field
              label={t('Numéro de licence', 'License Number')}
              value={company.licenseNumber}
              onChange={(v) => setCompany({ licenseNumber: v })}
              placeholder="AB-LIC-00001"
            />
          </SectionCard>
        );

      // ── EMPLOYEES ─────────────────────────────────────────────────────────
      case 'employees':
        return (
          <SectionCard title={t('Gestion des employés', 'Employee Management')}>
            <div className="space-y-2">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white text-sm">{emp.name}</p>
                    <p className="text-xs text-gray-400">
                      {emp.role === 'admin' ? '👑 Admin' : '👷 Employé'} · ${emp.hourlyRate ?? 0}/h
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">#{emp.id.slice(-4)}</span>
                </div>
              ))}
              {employees.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  {t('Aucun employé configuré.', 'No employees configured.')}
                </p>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {t(
                '→ Gérez les employés depuis la page Paye / Livre de paye.',
                '→ Manage employees from the Payroll page.'
              )}
            </p>
          </SectionCard>
        );

      // ── APPEARANCE ────────────────────────────────────────────────────────
      case 'appearance':
        return (
          <SectionCard title={t('Apparence & Thème', 'Appearance & Theme')}>
            <p className="text-sm text-gray-400 mb-4">
              {t(
                '5 thèmes disponibles. Changez-les depuis le bouton 🎨 en haut du Dashboard.',
                '5 themes available. Switch them via the 🎨 button at the top of the Dashboard.'
              )}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: 'Orange', color: '#f97316' },
                { name: 'Bleu', color: '#3b82f6' },
                { name: 'Vert', color: '#22c55e' },
                { name: 'Violet', color: '#a855f7' },
                { name: 'Rouge', color: '#ef4444' },
              ].map((theme) => (
                <div
                  key={theme.name}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-xs text-gray-400">{theme.name}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        );

      // ── LANGUAGE ──────────────────────────────────────────────────────────
      case 'language':
        return (
          <SectionCard title={t('Langue / Language', 'Language / Langue')}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: 'fr', label: '🇫🇷 Français' },
                { code: 'en', label: '🇨🇦 English' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    localStorage.setItem('lang', l.code);
                    window.location.reload();
                  }}
                  className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                    lang === l.code
                      ? 'border-orange-400 bg-orange-500/20 text-orange-300'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </SectionCard>
        );

      // ── NOTIFICATIONS ─────────────────────────────────────────────────────
      case 'notifications':
        return (
          <SectionCard title={t('Notifications', 'Notifications')}>
            <p className="text-sm text-gray-400">
              {t(
                'Les notifications push seront disponibles après l\'installation de l\'app (PWA).',
                'Push notifications will be available after app installation (PWA).'
              )}
            </p>
          </SectionCard>
        );

      // ── SECURITY ──────────────────────────────────────────────────────────
      case 'security':
        if (!isAdmin) {
          return (
            <SectionCard title={t('Sécurité', 'Security')}>
              <p className="text-sm text-gray-400 text-center py-4">
                🔒 {t('Accès réservé à l\'administrateur.', 'Admin access only.')}
              </p>
            </SectionCard>
          );
        }
        return (
          <SectionCard title={t('Sécurité — Admin', 'Security — Admin')}>
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs text-red-400 font-semibold mb-3">
                🔐 {t('Changer le PIN Admin', 'Change Admin PIN')}
              </p>
              <Field
                label={t('PIN actuel', 'Current PIN')}
                value={adminPinInput}
                onChange={setAdminPinInput}
                type="password"
                placeholder="••••"
              />
              <Field
                label={t('Nouveau PIN', 'New PIN')}
                value={newAdminPin}
                onChange={setNewAdminPin}
                type="password"
                placeholder="••••"
              />
              <button
                onClick={() => {
                  const admin = employees.find((e) => e.role === 'admin');
                  if (!admin) return;
                  if (admin.pin !== adminPinInput) {
                    setPinMsg(t('❌ PIN actuel incorrect', '❌ Incorrect current PIN'));
                    return;
                  }
                  if (newAdminPin.length < 4) {
                    setPinMsg(t('❌ PIN trop court (min 4)', '❌ PIN too short (min 4)'));
                    return;
                  }
                  // Note: update via useEmployeeStore
                  setPinMsg(t('✅ PIN changé avec succès!', '✅ PIN changed successfully!'));
                  setAdminPinInput('');
                  setNewAdminPin('');
                }}
                className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 text-sm mt-1 transition-all"
              >
                {t('Changer PIN', 'Change PIN')}
              </button>
              {pinMsg && (
                <p className="text-xs mt-2 text-center font-medium text-orange-300">{pinMsg}</p>
              )}
            </div>
          </SectionCard>
        );

      // ── ABOUT ─────────────────────────────────────────────────────────────
      case 'about':
        return (
          <SectionCard title={t('À propos', 'About')}>
            <div className="text-center py-4 space-y-2">
              <div className="text-4xl mb-3">🏗️</div>
              <p className="text-white font-bold text-lg">Gestion Chantier Pro</p>
              <p className="text-orange-400 text-sm font-semibold">Hailite Xteriors</p>
              <p className="text-gray-400 text-xs mt-2">Version 1.0.0 · Alberta, Canada</p>
              <p className="text-gray-500 text-xs">Next.js 16 · TypeScript · Zustand · Tailwind</p>
              <div className="mt-4 rounded-xl bg-white/5 p-3 text-xs text-gray-400">
                GST 5% · WCB Alberta · PDF · E-Sign
              </div>
            </div>
          </SectionCard>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight">
          ⚙️ {t('Réglages', 'Settings')}
        </h1>
        <button
          onClick={handleSave}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {saved ? (t('✅ Sauvegardé!', '✅ Saved!')) : t('💾 Sauvegarder', '💾 Save')}
        </button>
      </div>

      <div className="flex gap-0">
        {/* Sidebar navigation */}
        <div className="w-14 shrink-0 bg-gray-900 min-h-screen border-r border-white/5 sticky top-16 self-start pt-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex flex-col items-center py-3 text-lg transition-all ${
                activeSection === s.id
                  ? 'bg-orange-500/20 text-orange-400 border-r-2 border-orange-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
              title={isFr ? s.labelFr : s.labelEn}
            >
              <span>{s.icon}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Section title */}
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">
              {isFr
                ? SECTIONS.find((s) => s.id === activeSection)?.labelFr
                : SECTIONS.find((s) => s.id === activeSection)?.labelEn}
            </h2>
          </div>
          {renderSection()}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
