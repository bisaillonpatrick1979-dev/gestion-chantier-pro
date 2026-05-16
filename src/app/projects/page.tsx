'use client';

import { useState } from 'react';
import { useProjectStore, calcProjectStats, PayMode, Project } from '@/store/useProjectStore';
import { useClientStore } from '@/store/useClientStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useThemeStore } from '@/store/useThemeStore';

// ── Gravure décorative ────────────────────────────────────────────────────────
function DecoGravure({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      style={{ width: '100%', opacity: 0.18, pointerEvents: 'none', ...style }}
    >
      <line x1="0" y1="20" x2="60" y2="20" stroke="var(--primary,#D4AF37)" strokeWidth="0.8"/>
      <polygon points="65,20 72,14 79,20 72,26" stroke="var(--primary,#D4AF37)" strokeWidth="0.8" fill="none"/>
      <line x1="84" y1="20" x2="116" y2="20" stroke="var(--primary,#D4AF37)" strokeWidth="0.8"/>
      <circle cx="100" cy="20" r="5" stroke="var(--primary,#D4AF37)" strokeWidth="0.8" fill="none"/>
      <circle cx="100" cy="20" r="2" fill="var(--primary,#D4AF37)" opacity="0.5"/>
      <line x1="121" y1="20" x2="135" y2="20" stroke="var(--primary,#D4AF37)" strokeWidth="0.8"/>
      <polygon points="140,20 147,14 154,20 147,26" stroke="var(--primary,#D4AF37)" strokeWidth="0.8" fill="none"/>
      <line x1="141" y1="20" x2="200" y2="20" stroke="var(--primary,#D4AF37)" strokeWidth="0.8"/>
    </svg>
  )
}

function DecoCorners() {
  return (
    <>
      <div style={{ position:'absolute', top:8, left:8, width:16, height:16,
        borderTop:'1.5px solid var(--primary,#D4AF37)', borderLeft:'1.5px solid var(--primary,#D4AF37)',
        opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:8, right:8, width:16, height:16,
        borderTop:'1.5px solid var(--primary,#D4AF37)', borderRight:'1.5px solid var(--primary,#D4AF37)',
        opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:8, left:8, width:16, height:16,
        borderBottom:'1.5px solid var(--primary,#D4AF37)', borderLeft:'1.5px solid var(--primary,#D4AF37)',
        opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:8, right:8, width:16, height:16,
        borderBottom:'1.5px solid var(--primary,#D4AF37)', borderRight:'1.5px solid var(--primary,#D4AF37)',
        opacity:0.5, pointerEvents:'none' }} />
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toFixed(2)}`;

const PAY_MODE_LABELS: Record<PayMode, { fr: string; icon: string }> = {
  hourly: { fr: "À l'heure",     icon: '⏱️' },
  job:    { fr: 'À la job',       icon: '💰' },
  sqft:   { fr: 'Au pied carré',  icon: '📐' },
};

// ── Styles dynamiques ─────────────────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg, #0a0a0a)',
  color: 'var(--text, #fff)',
  paddingBottom: '80px',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card, #1a1a1a)',
  border: '1px solid var(--border, #2a2a2a)',
  borderRadius: '16px',
  padding: '16px',
  position: 'relative',
  overflow: 'hidden',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface, #111)',
  border: '1px solid var(--border, #333)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: 'var(--text, #fff)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

// ── Modal Carte Projet ────────────────────────────────────────────────────────
function JobCardModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { addExpense, removeExpense, closeProject, updateProject } = useProjectStore();
  const { theme } = useThemeStore();
  const employeeStore = useEmployeeStore();
  const allEmployees = (employeeStore as unknown as Record<string, unknown>).employees as Array<{
    id: string; name: string; hourlyRate?: number; role?: string;
  }> ?? [];

  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [tab, setTab] = useState<'overview' | 'employees' | 'expenses' | 'logs'>('overview');
  const stats = calcProjectStats(project);
  const marginColor = stats.marginPercent >= 40
    ? theme.colors.success
    : stats.marginPercent >= 20
    ? theme.colors.warning
    : theme.colors.danger;

  const handleAddExpense = () => {
    if (!expDesc || !expAmt) return;
    addExpense(project.id, {
      description: expDesc,
      amount: parseFloat(expAmt),
      date: new Date().toISOString().slice(0, 10),
    });
    setExpDesc(''); setExpAmt('');
  };

  const toggleAssignEmployee = (empId: string) => {
    const current = project.assignedEmployeeIds ?? [];
    const updated = current.includes(empId)
      ? current.filter(id => id !== empId)
      : [...current, empId];
    updateProject(project.id, { assignedEmployeeIds: updated });
  };

  const tabs = [
    { id: 'overview'  as const, label: '📊 Vue'      },
    { id: 'employees' as const, label: '👷 Équipe'   },
    { id: 'expenses'  as const, label: '💸 Dépenses' },
    { id: 'logs'      as const, label: '🕐 Logs'     },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      paddingBottom: '64px',
    }}>
      <div style={{
        width: '100%', maxWidth: '520px',
        background: 'var(--surface, #111)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100dvh - 64px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ligne déco en haut */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, var(--primary), transparent)` }} />

        {/* Header */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <h2 style={{ fontWeight: 900, fontSize: '18px', color: 'var(--text)', margin: 0 }}>{project.name}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{project.address}, {project.city}</p>
              <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '2px' }}>
                {PAY_MODE_LABELS[project.payMode].icon} {PAY_MODE_LABELS[project.payMode].fr}
                {project.payMode === 'hourly' && project.hourlyRate && ` · $${project.hourlyRate}/h`}
                {project.payMode === 'job' && project.jobAmount && ` · ${fmt(project.jobAmount)}`}
                {project.payMode === 'sqft' && project.sqftRate && ` · $${project.sqftRate}/pi²`}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--card)', borderRadius: '10px', padding: '4px', marginTop: '12px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, borderRadius: '8px', padding: '8px 4px',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none',
                background: tab === t.id ? 'var(--primary)' : 'transparent',
                color: tab === t.id ? '#000' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <>
              {project.clientAmount !== undefined && (
                <div style={{ ...cardStyle, border: `1px solid ${theme.colors.primary}44`, background: `${theme.colors.primary}11` }}>
                  <DecoCorners />
                  <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    💼 Montant client
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text)' }}>{fmt(project.clientAmount)}</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={cardStyle}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>👷 Main d'œuvre</p>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{fmt(stats.totalLaborCost)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-weak)', marginTop: '4px' }}>{stats.totalHours.toFixed(1)}h total</p>
                </div>
                <div style={cardStyle}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>💸 Dépenses</p>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{fmt(stats.totalExpenses)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-weak)', marginTop: '4px' }}>{project.expenses.length} entrée(s)</p>
                </div>
              </div>

              {stats.clientRevenue > 0 && (
                <div style={{ ...cardStyle, border: `1px solid ${marginColor}44`, background: `${marginColor}11` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>📈 Marge nette</p>
                      <p style={{ fontSize: '28px', fontWeight: 900, color: marginColor }}>{fmt(stats.margin)}</p>
                    </div>
                    <p style={{ fontSize: '36px', fontWeight: 900, color: marginColor }}>{stats.marginPercent.toFixed(0)}%</p>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    {[
                      { label: 'Revenue client',  value: fmt(stats.clientRevenue),    color: 'var(--text)'      },
                      { label: '− Main d\'œuvre', value: `−${fmt(stats.totalLaborCost)}`, color: 'var(--text-muted)' },
                      { label: '− Dépenses',      value: `−${fmt(stats.totalExpenses)}`,  color: 'var(--text-muted)' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: row.color, marginBottom: '4px' }}>
                        <span>{row.label}</span><span>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: marginColor, borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span>= MARGE</span><span>{fmt(stats.margin)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gravure déco dans l'espace vide */}
              <DecoGravure />

              {project.status === 'open' && (
                <button onClick={() => { closeProject(project.id); onClose(); }} style={{
                  width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  border: '1px solid var(--info)', background: `${theme.colors.info}18`,
                  color: 'var(--info)', fontWeight: 700, fontSize: '14px',
                }}>
                  🔒 Fermer le projet → Générer facture
                </button>
              )}
            </>
          )}

          {/* ── ÉQUIPE ── */}
          {tab === 'employees' && (
            <>
              <div style={cardStyle}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  ✏️ Gérer l'équipe
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allEmployees.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>Aucun employé.</p>
                  )}
                  {allEmployees.map(emp => {
                    const assigned = (project.assignedEmployeeIds ?? []).includes(emp.id);
                    return (
                      <button key={emp.id} onClick={() => toggleAssignEmployee(emp.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                        border: assigned ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: assigned ? 'var(--primary)18' : 'var(--card)',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>{assigned ? '✅' : '⬜'}</span>
                          <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{emp.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>${emp.hourlyRate ?? 0}/h · {emp.role === 'admin' ? '👑 Admin' : '👷 Employé'}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: assigned ? 'var(--primary)30' : 'transparent', color: assigned ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {assigned ? 'Assigné' : 'Ajouter'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {Object.values(stats.byEmployee).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>📊 Heures enregistrées</p>
                  {Object.values(stats.byEmployee).map(emp => (
                    <div key={emp.employeeId} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{emp.employeeName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>${emp.hourlyRate}/h · {emp.sessions} session(s)</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>{fmt(emp.totalPay)}</p>
                          {emp.totalHours > 0 && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.totalHours.toFixed(2)}h</p>}
                        </div>
                      </div>
                      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px', width: `${Math.min(100, (emp.totalPay / (stats.totalLaborCost || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ ...cardStyle, border: '1px solid var(--primary)44', background: 'var(--primary)11', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>Total main d'œuvre</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>{fmt(stats.totalLaborCost)}</span>
                  </div>
                </div>
              )}

              {Object.values(stats.byEmployee).length === 0 && (
                <>
                  <DecoGravure />
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>Aucune heure enregistrée.</p>
                </>
              )}
            </>
          )}

          {/* ── DÉPENSES ── */}
          {tab === 'expenses' && (
            <>
              <div style={cardStyle}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  ➕ Ajouter une dépense
                </p>
                <input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Description (gaz, matériaux...)" style={{ ...inputStyle, marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="Montant $" style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={handleAddExpense} style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}>➕</button>
                </div>
              </div>

              {project.expenses.length === 0 && (
                <>
                  <DecoGravure />
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>Aucune dépense.</p>
                </>
              )}

              {project.expenses.map(exp => (
                <div key={exp.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 600 }}>{exp.description}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.date}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{fmt(exp.amount)}</span>
                    <button onClick={() => removeExpense(project.id, exp.id)} style={{ background: 'none', border: 'none', color: 'var(--text-weak)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                  </div>
                </div>
              ))}

              {project.expenses.length > 0 && (
                <div style={{ ...cardStyle, border: '1px solid var(--danger)44', background: 'var(--danger)11', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--danger)' }}>Total dépenses</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--danger)' }}>{fmt(stats.totalExpenses)}</span>
                </div>
              )}
            </>
          )}

          {/* ── LOGS ── */}
          {tab === 'logs' && (
            <>
              {project.workLogs.length === 0 && (
                <>
                  <DecoGravure />
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px 0' }}>Aucun log de travail.</p>
                </>
              )}
              {[...project.workLogs].reverse().map((log, idx) => (
                <div key={idx} style={{
                  ...cardStyle,
                  border: !log.punchOut ? '1px solid var(--success)44' : '1px solid var(--border)',
                  background: !log.punchOut ? 'var(--success)11' : 'var(--card)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{log.employeeName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.date} · ${log.hourlyRate}/h</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {log.punchOut ? (
                        <>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>{log.hoursWorked?.toFixed(2)}h</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmt((log.hoursWorked ?? 0) * log.hourlyRate)}</p>
                        </>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>🟢 En cours</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal Nouveau Projet ──────────────────────────────────────────────────────
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '64px' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: 'var(--surface)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 64px)', overflow: 'hidden' }}>

        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', flexShrink: 0 }} />

        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontWeight: 900, fontSize: '18px', color: 'var(--text)', margin: 0 }}>🏗️ Nouveau projet</h2>
          <button onClick={onClose} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {[
            { label: 'Nom du projet *', key: 'name', placeholder: 'Ex: Toiture — 123 Main St', type: 'text' },
            { label: 'Adresse du chantier *', key: 'address', placeholder: '123 Main St', type: 'text' },
            { label: 'Ville', key: 'city', placeholder: 'Calgary', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{f.label}</label>
              <input
                type={f.type}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Client</label>
            <select value={form.clientId} onChange={e => set('clientId', e.target.value)} style={{ ...inputStyle }}>
              <option value="">— Choisir client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Mode de paiement des employés</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {(Object.entries(PAY_MODE_LABELS) as [PayMode, { fr: string; icon: string }][]).map(([mode, l]) => (
                <button key={mode} onClick={() => set('payMode', mode)} style={{
                  padding: '12px 6px', borderRadius: '10px', cursor: 'pointer',
                  border: form.payMode === mode ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: form.payMode === mode ? 'var(--primary)22' : 'var(--card)',
                  color: form.payMode === mode ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '11px', fontWeight: 700, transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{l.icon}</div>
                  {l.fr}
                </button>
              ))}
            </div>
          </div>

          {form.payMode === 'hourly' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Taux horaire ($/h)</label>
              <input type="number" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="45" style={inputStyle} />
            </div>
          )}
          {form.payMode === 'job' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Montant total à la job ($)</label>
              <input type="number" value={form.jobAmount} onChange={e => set('jobAmount', e.target.value)} placeholder="1500" style={inputStyle} />
            </div>
          )}
          {form.payMode === 'sqft' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Taux pi² ($/pi²)</label>
              <input type="number" value={form.sqftRate} onChange={e => set('sqftRate', e.target.value)} placeholder="2.25" style={inputStyle} />
            </div>
          )}

          <div style={{ background: 'var(--primary)11', border: '1px solid var(--primary)33', borderRadius: '10px', padding: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--primary)', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              💼 Montant client (admin seulement)
            </label>
            <input type="number" value={form.clientAmount} onChange={e => set('clientAmount', e.target.value)} placeholder="Ex: 3500" style={{ ...inputStyle, border: '1px solid var(--primary)44' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Employés assignés</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {employees.map(emp => (
                <button key={emp.id} onClick={() => toggleEmployee(emp.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                  border: form.assignedEmployeeIds.includes(emp.id) ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: form.assignedEmployeeIds.includes(emp.id) ? 'var(--primary)18' : 'var(--card)',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{emp.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${emp.hourlyRate ?? 0}/h</span>
                    {form.assignedEmployeeIds.includes(emp.id) && <span style={{ color: 'var(--primary)' }}>✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Instructions, matériaux requis..." style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
        </div>

        <div style={{ padding: '16px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <button onClick={handleSubmit} disabled={!form.name || !form.address} style={{
            width: '100%', padding: '16px', borderRadius: '14px', cursor: 'pointer',
            border: 'none', fontWeight: 900, fontSize: '15px',
            background: !form.name || !form.address ? 'var(--border)' : 'var(--primary)',
            color: !form.name || !form.address ? 'var(--text-muted)' : '#000',
            opacity: !form.name || !form.address ? 0.5 : 1,
            transition: 'all 0.2s',
          }}>
            🏗️ Créer le projet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { projects, getOpenProjects } = useProjectStore();
  const [showNew, setShowNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const filters = [
    { id: 'open'   as const, label: '🟢 Ouverts' },
    { id: 'closed' as const, label: '🔒 Fermés'  },
    { id: 'all'    as const, label: '📋 Tous'     },
  ];

  const statusLabel: Record<string, string> = {
    open: 'Ouvert', closed: 'Fermé', invoiced: 'Facturé',
  };

  const statusColor: Record<string, string> = {
    open:     'var(--success)',
    closed:   'var(--text-muted)',
    invoiced: 'var(--info)',
  };

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes projectFadeIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .project-card { animation: projectFadeIn 0.3s ease both; }
        .project-card:active { transform: scale(0.98); transition: transform 0.15s; }
      `}</style>

      {/* Header sticky */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 16px 12px',
      }}>
        {/* Gravure déco en haut */}
        <DecoGravure style={{ marginBottom: '8px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>🏗️ Projets</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {getOpenProjects().length} projet(s) ouvert(s)
            </p>
          </div>
          <button onClick={() => setShowNew(true)} style={{
            background: 'var(--primary)', border: 'none', borderRadius: '10px',
            padding: '10px 16px', color: '#000', fontWeight: 800,
            fontSize: '13px', cursor: 'pointer',
          }}>
            + Nouveau
          </button>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--card)', borderRadius: '10px', padding: '4px' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              flex: 1, padding: '8px 4px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: filter === f.id ? 'var(--primary)' : 'transparent',
              color: filter === f.id ? '#000' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Liste des projets */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            {/* Gravure dans l'espace vide */}
            <DecoGravure style={{ marginBottom: '24px' }} />
            <p style={{ fontSize: '48px', marginBottom: '8px' }}>🏗️</p>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px' }}>Aucun projet</p>
            <p style={{ color: 'var(--text-weak)', fontSize: '13px', marginTop: '4px' }}>
              {filter === 'open' ? 'Créez votre premier projet ci-dessus.' : 'Rien à afficher.'}
            </p>
            <DecoGravure style={{ marginTop: '24px' }} />
          </div>
        )}

        {filtered.map((project, idx) => {
          const stats = calcProjectStats(project);
          return (
            <button
              key={project.id}
              className="project-card"
              onClick={() => setSelectedProject(project)}
              style={{
                ...cardStyle,
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                animationDelay: `${idx * 0.05}s`,
                transition: 'border-color 0.2s',
              }}
            >
              <DecoCorners />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 900, fontSize: '15px', color: 'var(--text)' }}>{project.name}</span>
                    {stats.activeLog && (
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                        background: 'var(--success)22', color: 'var(--success)',
                        border: '1px solid var(--success)44', fontWeight: 700,
                      }}>🟢 En cours</span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{project.address}, {project.city}</p>
                  {project.clientName && <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '2px' }}>👤 {project.clientName}</p>}
                </div>
                <span style={{
                  fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                  background: `${statusColor[project.status]}22`,
                  color: statusColor[project.status],
                  border: `1px solid ${statusColor[project.status]}44`,
                  fontWeight: 700, flexShrink: 0,
                }}>
                  {statusLabel[project.status] ?? project.status}
                </span>
              </div>

              {/* Stats bar */}
              <div style={{ display: 'flex', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {PAY_MODE_LABELS[project.payMode].icon} {PAY_MODE_LABELS[project.payMode].fr}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  👷 {project.assignedEmployeeIds.length} emp.
                </span>
                {stats.totalHours > 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ⏱️ {stats.totalHours.toFixed(1)}h
                  </span>
                )}
                {stats.margin !== 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 800, color: stats.marginPercent >= 40 ? 'var(--success)' : stats.marginPercent >= 20 ? 'var(--warning)' : 'var(--danger)' }}>
                    {stats.marginPercent.toFixed(0)}% marge
                  </span>
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
    </div>
  );
}
