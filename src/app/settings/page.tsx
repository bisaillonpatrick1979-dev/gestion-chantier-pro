'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyStore, CompanyInfo } from '@/store/useCompanyStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useLangStore } from '@/store/useLangStore';
import BottomNav from '@/components/BottomNav';

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const THEMES = [
  { id: 'dark',   name: 'Sombre', emoji: '🌑', accent: '#f97316' },
  { id: 'light',  name: 'Clair',  emoji: '☀️', accent: '#f97316' },
  { id: 'blue',   name: 'Océan',  emoji: '🌊', accent: '#3b82f6' },
  { id: 'green',  name: 'Forêt',  emoji: '🌲', accent: '#22c55e' },
  { id: 'purple', name: 'Violet', emoji: '💜', accent: '#a855f7' },
];

function Section({ title, emoji, children, defaultOpen = false }: {
  title: string; emoji: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
        <span className="font-semibold text-white text-sm">{emoji} {title}</span>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          <ChevronRight />
        </span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">{children}</div>}
    </div>
  );
}

function NavLink({ emoji, title, subtitle, onClick }: {
  emoji: string; title: string; subtitle?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 hover:border-orange-400/30 transition text-left">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className="text-white text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
      </div>
      <ChevronRight />
    </button>
  );
}

function Field({ label, value, onChange, placeholder = '', type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-400 transition" />
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '' }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-28 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-400 transition" />
        {suffix && <span className="text-gray-400 text-xs">{suffix}</span>}
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = '', rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const company = useCompanyStore(s => s.company);
  const updateCompany = useCompanyStore(s => s.updateCompany);
  const employees = useEmployeeStore(s => s.employees);
  const addEmployee = useEmployeeStore(s => s.addEmployee);
  const deleteEmployee = useEmployeeStore(s => s.deleteEmployee);
  const currentEmployeeId = useEmployeeStore(s => s.currentEmployeeId);
  const currentEmployee = currentEmployeeId != null
    ? employees.find(e => e.id === currentEmployeeId)
    : undefined;
  const isAdmin =
    currentEmployee?.role === 'admin' ||
    currentEmployeeId == null;

  // ── Thème — vrais noms du store ──
  const themeId = useThemeStore(s => s.themeId);
  const setTheme = useThemeStore(s => s.setTheme);

  // ── Langue — vrais noms du store ──
  const lang = useLangStore(s => s.lang);
  const setLang = useLangStore(s => s.setLang);

  const [form, setForm] = useState<CompanyInfo>({ ...company });
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(company.logo || company.logoUrl || '');
  const fileRef = useRef<HTMLInputElement>(null);
  const [newEmp, setNewEmp] = useState({ name: '', role: 'employee' as 'employee' | 'admin', workMode: 'heure' as 'heure' | 'surface', hourlyRate: 45, pin: '0000' });
  const [showAddEmp, setShowAddEmp] = useState(false);

  const setField = (field: keyof CompanyInfo) => (v: string) => setForm(p => ({ ...p, [field]: v }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const data = ev.target?.result as string;
      setLogoPreview(data);
      setForm(p => ({ ...p, logo: data, logoUrl: data }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateCompany({ ...form, logoUrl: form.logo || form.logoUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddEmployee = () => {
    if (!newEmp.name.trim()) return;
    addEmployee({
      name: newEmp.name.trim(),
      role: newEmp.role,
      workMode: newEmp.workMode,
      hourlyRate: newEmp.hourlyRate,
      pin: newEmp.pin || '0000',
      active: true,
      color: '#f59e0b',
    });
    setNewEmp({ name: '', role: 'employee', workMode: 'heure', hourlyRate: 45, pin: '0000' });
    setShowAddEmp(false);
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
              className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition">
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
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">⚙️ Réglages</h1>
          <p className="text-xs text-gray-400">Hailite Xteriors</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
          }`}>
          {saved ? '✅ Sauvegardé!' : <><SaveIcon /> Sauvegarder</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-2">

        {/* Liens rapides */}
        <div className="mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 px-1">Navigation rapide</p>
          <div className="space-y-2">
            <NavLink emoji="👥" title="Clients" subtitle="Gérer la liste des clients" onClick={() => router.push('/clients')} />
            <NavLink emoji="📦" title="Catalogue matériaux" subtitle="Prix et inventaire" onClick={() => router.push('/catalogue')} />
            <NavLink emoji="💼" title="Comptabilité" subtitle="Revenus, dépenses, rapports" onClick={() => router.push('/comptabilite')} />
            <NavLink emoji="📋" title="Livre de paye" subtitle="Employés, heures, paie" onClick={() => router.push('/paye')} />
            <NavLink emoji="📁" title="Projets" subtitle="Chantiers en cours" onClick={() => router.push('/projects')} />
          </div>
        </div>

        {/* Langue */}
        <Section emoji="🌐" title="Langue / Language">
          <div className="flex gap-3">
            <button onClick={() => setLang('fr')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm border transition ${
                lang === 'fr' ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}>
              🇫🇷 Français
            </button>
            <button onClick={() => setLang('en')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm border transition ${
                lang === 'en' ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}>
              🇨🇦 English
            </button>
          </div>
        </Section>

        {/* Thèmes */}
        <Section emoji="🎨" title="Thème / Skin">
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(th => (
              <button key={th.id} onClick={() => setTheme(th.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${
                  themeId === th.id ? 'border-orange-400 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}>
                <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: th.accent }} />
                <span className="text-xs text-white font-medium">{th.emoji} {th.name}</span>
                {themeId === th.id && <span className="text-xs text-orange-400 font-bold">✓ Actif</span>}
              </button>
            ))}
          </div>
        </Section>

        {/* Infos compagnie */}
        <Section emoji="🏢" title="Informations Compagnie" defaultOpen>
          <div className="flex items-center gap-4 mb-2">
            <div onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-orange-400 transition overflow-hidden bg-white/5">
              {logoPreview
                ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                : <div className="text-center text-gray-500 text-xs">📷<br />Logo</div>
              }
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Logo compagnie</p>
              <p className="text-xs text-gray-400">PNG, JPG — max 2 MB</p>
              <button onClick={() => fileRef.current?.click()} className="mt-2 text-xs text-orange-400 underline">
                Changer le logo
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
          <Field label="Nom" value={form.name} onChange={setField('name')} placeholder="Hailite Xteriors" />
          <Field label="Adresse" value={form.address} onChange={setField('address')} placeholder="123 Main St" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Ville" value={form.city} onChange={setField('city')} placeholder="Calgary" />
            <Field label="Province" value={form.province} onChange={setField('province')} placeholder="AB" />
          </div>
          <Field label="Code postal" value={form.postalCode} onChange={setField('postalCode')} placeholder="T2P 1J9" />
          <Field label="Téléphone" value={form.phone} onChange={setField('phone')} type="tel" placeholder="(403) 555-0100" />
          <Field label="Courriel" value={form.email} onChange={setField('email')} type="email" placeholder="info@hailitexteriors.ca" />
          <Field label="Site web" value={form.website} onChange={setField('website')} placeholder="www.hailitexteriors.ca" />
        </Section>

        {/* Numéros légaux */}
        <Section emoji="📋" title="Numéros légaux & Taxes">
          <Field label="Numéro GST" value={form.gstNumber} onChange={setField('gstNumber')} placeholder="123456789 RT0001" />
          <Field label="Numéro WCB" value={form.wcbNumber} onChange={setField('wcbNumber')} placeholder="WCB-XXXX" />
          <Field label="Numéro de licence" value={form.licenseNumber} onChange={setField('licenseNumber')} placeholder="Contractor #" />
          <NumberField label="Taux GST (%)" value={form.defaultGstRate}
            onChange={v => setForm(p => ({ ...p, gstRate: v, defaultGstRate: v }))}
            step={0.5} suffix="Alberta = 5% seulement" />
        </Section>

        {/* Paiement */}
        <Section emoji="💳" title="Paiement & Modalités">
          <Field label="E-Transfer (courriel)" value={form.eTransferEmail} onChange={setField('eTransferEmail')} type="email" placeholder="factures@hailitexteriors.ca" />
          <Field label="Délai de paiement" value={form.paymentTerms} onChange={setField('paymentTerms')} placeholder="Net 30" />
          <NumberField label="Dépôt par défaut (%)" value={form.defaultDepositPercent}
            onChange={v => setForm(p => ({ ...p, defaultDepositPercent: v }))} suffix="% du total" />
          <TextArea label="Info bancaire" value={form.bankInfo} onChange={setField('bankInfo')}
            placeholder="E-Transfer : factures@hailitexteriors.ca" rows={2} />
        </Section>

        {/* Numéros séquentiels */}
        <Section emoji="🔢" title="Numéros séquentiels">
          <NumberField label="Prochain # Facture" value={form.invoiceNextNumber}
            onChange={v => setForm(p => ({ ...p, invoiceNextNumber: Math.floor(v) }))}
            min={1} max={99999} suffix="→ FACT-2026-XXXX" />
          <NumberField label="Prochain # Devis" value={form.quoteNextNumber}
            onChange={v => setForm(p => ({ ...p, quoteNextNumber: Math.floor(v) }))}
            min={1} max={99999} suffix="→ DEV-2026-XXXX" />
          <NumberField label="Prochain # Contrat" value={form.contractNextNumber}
            onChange={v => setForm(p => ({ ...p, contractNextNumber: Math.floor(v) }))}
            min={1} max={99999} suffix="→ CONT-2026-XXXX" />
        </Section>

        {/* Notes */}
        <Section emoji="📝" title="Notes & Conditions par défaut">
          <TextArea label="Notes par défaut" value={form.invoiceNotes}
            onChange={v => setForm(p => ({ ...p, invoiceNotes: v, defaultNotes: v }))}
            placeholder="Merci pour votre confiance!" rows={3} />
          <TextArea label="Conditions générales" value={form.defaultTerms} onChange={setField('defaultTerms')}
            placeholder="Paiement dû dans les 30 jours..." rows={3} />
        </Section>

        {/* Employés */}
        <Section emoji="👷" title="Employés & PIN">
          <div className="space-y-2">
            {employees.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-3">Aucun employé enregistré.</p>
            ) : (
              employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-white text-sm font-medium">{emp.name}</p>
                    <p className="text-gray-400 text-xs">
                      {emp.role === 'admin' ? '👑 Admin' : '👷 Employé'}
                      {emp.hourlyRate ? ` · $${emp.hourlyRate}/h` : ''}
                      {` · ${emp.workMode === 'surface' ? '📐 Surface' : '⏱️ Heure'}`}
                    </p>
                  </div>
                  <button onClick={() => deleteEmployee(String(emp.id))}
                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10">✕</button>
                </div>
              ))
            )}
          </div>
          {!showAddEmp ? (
            <button onClick={() => setShowAddEmp(true)}
              className="w-full mt-2 py-2.5 border border-dashed border-orange-500/40 text-orange-400 rounded-xl text-sm font-semibold hover:bg-orange-500/5 transition">
              ＋ Ajouter un employé
            </button>
          ) : (
            <div className="mt-2 space-y-2 border border-white/10 rounded-xl p-3 bg-white/5">
              <p className="text-xs font-bold text-orange-400">Nouvel employé</p>
              <input value={newEmp.name} onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))}
                placeholder="Nom complet"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-400" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newEmp.role} onChange={e => setNewEmp(p => ({ ...p, role: e.target.value as 'employee' | 'admin' }))}
                  className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="employee">👷 Employé</option>
                  <option value="admin">👑 Admin</option>
                </select>
                <input type="number" value={newEmp.hourlyRate}
                  onChange={e => setNewEmp(p => ({ ...p, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="$/h"
                  className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <select value={newEmp.workMode} onChange={e => setNewEmp(p => ({ ...p, workMode: e.target.value as 'heure' | 'surface' }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                <option value="heure">⏱️ À l'heure</option>
                <option value="surface">📐 Au pied carré</option>
              </select>
              <input value={newEmp.pin} onChange={e => setNewEmp(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="PIN (4 chiffres)" maxLength={4} type="password"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-400" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddEmp(false)}
                  className="flex-1 py-2 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5">Annuler</button>
                <button onClick={handleAddEmployee}
                  className="flex-1 py-2 bg-orange-500 rounded-xl text-white font-bold text-sm hover:bg-orange-600">Ajouter</button>
              </div>
            </div>
          )}
          <button onClick={() => router.push('/paye')}
            className="w-full mt-2 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/10 transition">
            📚 Livre de paye & Reset PIN →
          </button>
        </Section>

        {/* Sécurité */}
        <Section emoji="🔒" title="Sécurité">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-sm text-orange-300">
            ⚠️ Reset PIN admin → <strong>Livre de paye</strong>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300">
            💡 Connecté : <strong>{currentEmployee?.name ?? 'Admin'}</strong>
          </div>
        </Section>

        <button onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}>
          {saved ? '✅ Réglages sauvegardés!' : <><SaveIcon /> Sauvegarder tous les réglages</>}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
