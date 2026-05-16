'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useProjectStore, calcProjectStats, PayMode, Project } from '@/store/useProjectStore';
import { useClientStore } from '@/store/useClientStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';

function BottomNav() {
  const pathname = usePathname();
  const links = [
    { href: '/',          icon: '🏠', label: 'Dashboard' },
    { href: '/projects',  icon: '🏗️', label: 'Projets' },
    { href: '/documents', icon: '🧾', label: 'Docs' },
    { href: '/clients',   icon: '👥', label: 'Clients' },
    { href: '/settings',  icon: '⚙️', label: 'Réglages' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-white/10 flex justify-around items-center h-16 px-1">
      {links.map(({ href, icon, label }) => (
        <a key={href} href={href}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[3rem] ${
            pathname === href ? 'text-orange-400' : 'text-gray-500 hover:text-gray-300'
          }`}>
          <span className="text-xl leading-none">{icon}</span>
          <span className="text-[10px] font-medium">{label}</span>
        </a>
      ))}
    </nav>
  );
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

const PAY_MODE_LABELS: Record<PayMode, { fr: string; icon: string }> = {
  hourly: { fr: "À l'heure",    icon: '⏱️' },
  job:    { fr: 'À la job',      icon: '💰' },
  sqft:   { fr: 'Au pied carré', icon: '📐' },
};

const STATUS_COLORS: Record<string, string> = {
  open:     'bg-green-500/20 text-green-300 border-green-500/30',
  closed:   'bg-gray-500/20 text-gray-300 border-gray-500/30',
  invoiced: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

function JobCardModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { addExpense, removeExpense, closeProject, updateProject } = useProjectStore();
  const employeeStore = useEmployeeStore();
  const allEmployees = (employeeStore as unknown as Record<string, unknown>).employees as Array<{
    id: string; name: string; hourlyRate?: number; role?: string;
  }> ?? [];

  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [tab, setTab] = useState<'overview' | 'employees' | 'expenses' | 'logs'>('overview');
  const stats = calcProjectStats(project);
  const marginColor = stats.marginPercent >= 40 ? 'text-green-400' : stats.marginPercent >= 20 ? 'text-yellow-400' : 'text-red-400';

  const handleAddExpense = () => {
    if (!expDesc || !expAmt) return;
    addExpense(project.id, { description: expDesc, amount: parseFloat(expAmt), date: new Date().toISOString().slice(0, 10) });
    setExpDesc(''); setExpAmt('');
  };

  const toggleAssignEmployee = (empId: string) => {
    const current = project.assignedEmployeeIds ?? [];
    const updated = current.includes(empId)
      ? current.filter(id => id !== empId)
      : [...current, empId];
    updateProject(project.id, { assignedEmployeeIds: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
      style={{ paddingBottom: '64px' }}>
      <div className="w-full max-w-lg bg-gray-900 rounded-t-3xl border-t border-white/10 flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 64px)' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 pr-3">
              <h2 className="font-black text-white text-lg leading-tight">{project.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{project.address}, {project.city}</p>
              <p className="text-xs text-orange-400 mt-0.5">
                {PAY_MODE_LABELS[project.payMode].icon} {PAY_MODE_LABELS[project.payMode].fr}
                {project.payMode === 'hourly' && project.hourlyRate && ` · $${project.hourlyRate}/h`}
                {project.payMode === 'job' && project.jobAmount && ` · ${fmt(project.jobAmount)}`}
                {project.payMode === 'sqft' && project.sqftRate && ` · $${project.sqftRate}/pi²`}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 text-2xl hover:text-white">✕</button>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mt-3">
            {([
              { id: 'overview'  as const, label: '📊 Vue' },
              { id: 'employees' as const, label: '👷 Équipe' },
              { id: 'expenses'  as const, label: '💸 Dépenses' },
              { id: 'logs'      as const, label: '🕐 Logs' },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  tab === t.id ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <>
              {project.clientAmount !== undefined && (
                <div className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-4">
                  <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1">💼 Montant client (admin)</p>
                  <p className="text-3xl font-black text-white">{fmt(project.clientAmount)}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-gray-400 mb-1">👷 Main d'œuvre</p>
                  <p className="text-xl font-black text-white">{fmt(stats.totalLaborCost)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalHours.toFixed(1)}h total</p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-gray-400 mb-1">💸 Dépenses</p>
                  <p className="text-xl font-black text-white">{fmt(stats.totalExpenses)}</p>
                  <p className="text-xs text-gray-500 mt-1">{project.expenses.length} entrée(s)</p>
                </div>
              </div>
              {stats.clientRevenue > 0 && (
                <div className={`rounded-2xl border p-4 ${
                  stats.marginPercent >= 40 ? 'bg-green-500/10 border-green-500/30' :
                  stats.marginPercent >= 20 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">📈 Marge nette</p>
                      <p className={`text-3xl font-black ${marginColor}`}>{fmt(stats.margin)}</p>
                    </div>
                    <div className={`text-4xl font-black ${marginColor}`}>{stats.marginPercent.toFixed(0)}%</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-300"><span>Revenue client</span><span>{fmt(stats.clientRevenue)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>− Main d'œuvre</span><span>−{fmt(stats.totalLaborCost)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>− Dépenses</span><span>−{fmt(stats.totalExpenses)}</span></div>
                    <div className={`flex justify-between font-black border-t border-white/10 pt-1 mt-1 ${marginColor}`}><span>= MARGE</span><span>{fmt(stats.margin)}</span></div>
                  </div>
                </div>
              )}
              {project.status === 'open' && (
                <button onClick={() => { closeProject(project.id); onClose(); }}
                  className="w-full rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold py-3.5 text-sm hover:bg-blue-500/30 transition">
                  🔒 Fermer le projet → Générer facture
                </button>
              )}
            </>
          )}

          {/* ── ÉQUIPE — ajouter/retirer employés en temps réel ── */}
          {tab === 'employees' && (
            <div className="space-y-4">

              {/* Gérer l'équipe */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">
                  ✏️ Gérer l'équipe du projet
                </p>
                <div className="space-y-2">
                  {allEmployees.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-3">Aucun employé dans le système.</p>
                  )}
                  {allEmployees.map(emp => {
                    const assigned = (project.assignedEmployeeIds ?? []).includes(emp.id);
                    return (
                      <button key={emp.id} onClick={() => toggleAssignEmployee(emp.id)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                          assigned ? 'border-orange-400 bg-orange-500/20' : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{assigned ? '✅' : '⬜'}</span>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white">{emp.name}</p>
                            <p className="text-xs text-gray-400">${emp.hourlyRate ?? 0}/h · {emp.role === 'admin' ? '👑 Admin' : '👷 Employé'}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          assigned ? 'bg-orange-500/30 text-orange-300' : 'text-gray-500'
                        }`}>
                          {assigned ? 'Assigné' : 'Ajouter'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats par employé */}
              {Object.values(stats.byEmployee).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">📊 Heures enregistrées</p>
                  {Object.values(stats.byEmployee).map(emp => (
                    <div key={emp.employeeId} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-white">{emp.employeeName}</p>
                          <p className="text-xs text-gray-400">${emp.hourlyRate}/h · {emp.sessions} session(s)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-orange-400">{fmt(emp.totalPay)}</p>
                          {emp.totalHours > 0 && <p className="text-xs text-gray-400">{emp.totalHours.toFixed(2)}h</p>}
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${Math.min(100, (emp.totalPay / (stats.totalLaborCost || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-orange-300">Total main d'œuvre</span>
                    <span className="text-xl font-black text-orange-400">{fmt(stats.totalLaborCost)}</span>
                  </div>
                </div>
              )}

              {Object.values(stats.byEmployee).length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">Aucune heure enregistrée pour ce projet.</p>
              )}
            </div>
          )}

          {/* ── DÉPENSES ── */}
          {tab === 'expenses' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">➕ Ajouter une dépense</p>
                <input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Description (gaz, matériaux...)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none mb-2" />
                <div className="flex gap-2">
                  <input type="number" value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="Montant $"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
                  <button onClick={handleAddExpense}
                    className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-bold text-white transition">➕</button>
                </div>
              </div>
              {project.expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <div>
                    <p className="text-sm text-white font-medium">{exp.description}</p>
                    <p className="text-xs text-gray-500">{exp.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-400">{fmt(exp.amount)}</span>
                    <button onClick={() => removeExpense(project.id, exp.id)} className="text-gray-600 hover:text-red-400 text-lg">✕</button>
                  </div>
                </div>
              ))}
              {project.expenses.length === 0 && <p className="text-center text-gray-500 text-sm py-4">Aucune dépense.</p>}
              {project.expenses.length > 0 && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-red-300">Total dépenses</span>
                  <span className="text-xl font-black text-red-400">{fmt(stats.totalExpenses)}</span>
                </div>
              )}
            </div>
          )}

          {/* ── LOGS ── */}
          {tab === 'logs' && (
            <div className="space-y-2">
              {project.workLogs.length === 0 && <p className="text-center text-gray-500 text-sm py-6">Aucun log de travail.</p>}
              {[...project.workLogs].reverse().map((log, idx) => (
                <div key={idx} className={`rounded-2xl border p-4 ${!log.punchOut ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-sm">{log.employeeName}</p>
                      <p className="text-xs text-gray-400">{log.date} · ${log.hourlyRate}/h</p>
                    </div>
                    <div className="text-right">
                      {log.punchOut
                        ? <><p className="text-sm font-bold text-orange-400">{log.hoursWorked?.toFixed(2)}h</p><p className="text-xs text-gray-400">{fmt((log.hoursWorked ?? 0) * log.hourlyRate)}</p></>
                        : <span className="text-xs text-green-400 font-bold">🟢 En cours</span>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { addProject } = useProjectStore();
  const { clients } = useClientStore();
  const employeeStore = useEmployeeStore();
  const employees = (employeeStore as unknown as Record<string, unknown>).employees as Array<{ id: string; name: string; hourlyRate?: number }> ?? [];

  const [form, setForm] = useState({
    name: '', clientId: '', address: '', city: '',
    payMode: 'hourly' as PayMode,
    hourlyRate: '', jobAmount: '', sqftRate: '', clientAmount: '',
    assignedEmployeeIds: [] as string[], notes: '',
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleEmployee = (id: string) => setForm(f => ({
    ...f,
    assignedEmployeeIds: f.assignedEmployeeIds.includes(id)
      ? f.assignedEmployeeIds.filter(e => e !== id)
      : [...f.assignedEmployeeIds, id],
  }));

  const handleSubmit = () => {
    if (!form.name || !form.address) return;
    const client = clients.find(c => c.id === form.clientId);
    addProject({
      name: form.name, clientId: form.clientId,
      clientName: client?.name ?? '',
      address: form.address, city: form.city, payMode: form.payMode,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
      jobAmount: form.jobAmount ? parseFloat(form.jobAmount) : undefined,
      sqftRate: form.sqftRate ? parseFloat(form.sqftRate) : undefined,
      clientAmount: form.clientAmount ? parseFloat(form.clientAmount) : undefined,
      assignedEmployeeIds: form.assignedEmployeeIds, notes: form.notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
      style={{ paddingBottom: '64px' }}>
      <div className="w-full max-w-lg bg-gray-900 rounded-t-3xl border-t border-white/10 flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 64px)' }}>

        <div className="px-5 pt-5 pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="font-black text-white text-xl">🏗️ Nouveau projet</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl hover:text-white">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nom du projet *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Toiture — 123 Main St"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Client</label>
            <select value={form.clientId} onChange={e => set('clientId', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
              <option value="">— Choisir client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Adresse du chantier *</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Ville</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Calgary"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Mode de paiement des employés</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PAY_MODE_LABELS) as [PayMode, { fr: string; icon: string }][]).map(([mode, l]) => (
                <button key={mode} onClick={() => set('payMode', mode)}
                  className={`rounded-xl border py-3 text-xs font-bold transition-all ${
                    form.payMode === mode ? 'border-orange-400 bg-orange-500/20 text-orange-300' : 'border-white/10 bg-white/5 text-gray-400'
                  }`}>
                  <span className="block text-lg mb-1">{l.icon}</span>{l.fr}
                </button>
              ))}
            </div>
          </div>
          {form.payMode === 'hourly' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Taux horaire par défaut ($/h)</label>
              <input type="number" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="45"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
            </div>
          )}
          {form.payMode === 'job' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Montant total à la job ($)</label>
              <input type="number" value={form.jobAmount} onChange={e => set('jobAmount', e.target.value)} placeholder="1500"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
            </div>
          )}
          {form.payMode === 'sqft' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Taux pi² ($/pi²)</label>
              <input type="number" value={form.sqftRate} onChange={e => set('sqftRate', e.target.value)} placeholder="2.25"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
            </div>
          )}
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-3">
            <label className="block text-xs text-orange-400 font-bold mb-1">💼 Montant client (admin seulement)</label>
            <input type="number" value={form.clientAmount} onChange={e => set('clientAmount', e.target.value)} placeholder="Ex: 3500"
              className="w-full rounded-xl border border-orange-500/30 bg-black/20 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Employés assignés</label>
            <div className="space-y-2">
              {employees.map(emp => (
                <button key={emp.id} onClick={() => toggleEmployee(emp.id)}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                    form.assignedEmployeeIds.includes(emp.id) ? 'border-orange-400 bg-orange-500/20' : 'border-white/10 bg-white/5'
                  }`}>
                  <span className="text-sm font-medium text-white">{emp.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">${emp.hourlyRate ?? 0}/h</span>
                    {form.assignedEmployeeIds.includes(emp.id) && <span className="text-orange-400">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={3} placeholder="Instructions, matériaux requis..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none resize-none" />
          </div>
        </div>

        <div className="px-5 py-4 shrink-0 border-t border-white/10 bg-gray-900">
          <button onClick={handleSubmit} disabled={!form.name || !form.address}
            className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-black py-4 text-base transition-all">
            🏗️ Créer le projet
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, getOpenProjects } = useProjectStore();
  const [showNew, setShowNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');
  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">🏗️ Projets</h1>
            <p className="text-xs text-gray-400 mt-0.5">{getOpenProjects().length} projet(s) ouvert(s)</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition-all">
            ＋ Nouveau
          </button>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mt-3">
          {([
            { id: 'open'   as const, label: '🟢 Ouverts' },
            { id: 'closed' as const, label: '🔒 Fermés' },
            { id: 'all'    as const, label: '📋 Tous' },
          ]).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                filter === f.id ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="text-gray-400 font-semibold">Aucun projet</p>
            <p className="text-gray-600 text-sm mt-1">{filter === 'open' ? 'Créez votre premier projet ci-dessus.' : 'Rien à afficher.'}</p>
          </div>
        )}
        {filtered.map(project => {
          const stats = calcProjectStats(project);
          return (
            <button key={project.id} onClick={() => setSelectedProject(project)}
              className="w-full text-left rounded-2xl bg-white/5 border border-white/10 hover:border-orange-400/40 transition-all p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white text-base">{project.name}</span>
                    {stats.activeLog && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full animate-pulse">🟢 En cours</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{project.address}, {project.city}</p>
                  {project.clientName && <p className="text-xs text-orange-400 mt-0.5">👤 {project.clientName}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${STATUS_COLORS[project.status]}`}>
                  {project.status === 'open' ? 'Ouvert' : project.status === 'closed' ? 'Fermé' : 'Facturé'}
                </span>
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{PAY_MODE_LABELS[project.payMode].icon}</span>
                  <span className="text-xs text-gray-400">{PAY_MODE_LABELS[project.payMode].fr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">👷</span>
                  <span className="text-xs text-gray-400">{project.assignedEmployeeIds.length} employé(s)</span>
                </div>
                {stats.totalHours > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">⏱️</span>
                    <span className="text-xs text-gray-400">{stats.totalHours.toFixed(1)}h</span>
                  </div>
                )}
                {stats.margin !== 0 && (
                  <div className="ml-auto">
                    <span className={`text-xs font-bold ${stats.marginPercent >= 40 ? 'text-green-400' : stats.marginPercent >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {stats.marginPercent.toFixed(0)}% marge
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} />}
      {selectedProject && (
        <JobCardModal
          project={projects.find(p => p.id === selectedProject.id) ?? selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
      <BottomNav />
    </div>
  );
}
