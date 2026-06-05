'use client';

import { useState } from 'react';
import { useProjectStore, calcProjectStats, PayMode, Project } from '@/store/useProjectStore';
import { useClientStore } from '@/store/useClientStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useLangStore } from '@/store/useLangStore';
import { useCatalogueStore } from '@/store/useCatalogueStore';

function DecoGravure({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 40" fill="none" style={{ width: '100%', opacity: 0.18, pointerEvents: 'none', ...style }}>
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
      <div style={{ position:'absolute', top:8, left:8, width:16, height:16, borderTop:'1.5px solid var(--primary,#D4AF37)', borderLeft:'1.5px solid var(--primary,#D4AF37)', opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:8, right:8, width:16, height:16, borderTop:'1.5px solid var(--primary,#D4AF37)', borderRight:'1.5px solid var(--primary,#D4AF37)', opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:8, left:8, width:16, height:16, borderBottom:'1.5px solid var(--primary,#D4AF37)', borderLeft:'1.5px solid var(--primary,#D4AF37)', opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:8, right:8, width:16, height:16, borderBottom:'1.5px solid var(--primary,#D4AF37)', borderRight:'1.5px solid var(--primary,#D4AF37)', opacity:0.5, pointerEvents:'none' }} />
    </>
  )
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

const PAY_MODE_LABELS: Record<PayMode, { fr: string; en: string; icon: string }> = {
  hourly: { fr: "À l'heure",    en: 'By Hour',    icon: '⏱️' },
  job:    { fr: 'À la job',      en: 'Flat Rate',  icon: '💰' },
  sqft:   { fr: 'Au pied carré', en: 'Per Sq.ft.', icon: '📐' },
};

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--bg, #0a0a0a)', color: 'var(--text, #fff)', paddingBottom: '80px' }
const cardStyle: React.CSSProperties = { background: 'var(--card, #1a1a1a)', border: '1px solid var(--border, #2a2a2a)', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden' }
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--surface, #111)', border: '1px solid var(--border, #333)', borderRadius: '10px', padding: '10px 12px', color: 'var(--text, #fff)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }

// ── Modal Carte Projet ────────────────────────────────────────────────────────
function JobCardModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { addExpense, removeExpense, closeProject, updateProject, addTask, toggleTask, removeTask, workerCompleteProject, adminVerifyAndClose } = useProjectStore();
  const { theme } = useThemeStore();
  const { lang } = useLangStore();
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;
  const employeeStore = useEmployeeStore();
  const allEmployees = (employeeStore as unknown as Record<string, unknown>).employees as Array<{ id: string; name: string; hourlyRate?: number; role?: string }> ?? [];
  const currentEmpId = (employeeStore as unknown as Record<string, unknown>).currentEmployeeId as string | undefined;
  const currentEmployee = allEmployees.find(e => e.id === currentEmpId);
  const isAdmin = !currentEmpId || !currentEmployee || currentEmployee.role === 'admin';
  const { materials: catMaterials } = useCatalogueStore();

  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [taskLabel, setTaskLabel] = useState('');
  const [tab, setTab] = useState<'overview' | 'employees' | 'expenses' | 'logs' | 'tasks'>('overview');

  // ── Géofencing dans la carte projet ──────────────────────────────────────
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [geoError, setGeoError]   = useState('')

  const handleUseMyLocationCard = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoError(t('GPS non supporté.', 'GPS not supported.'))
      return
    }
    setGeoStatus('loading')
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        updateProject(project.id, { jobsiteLatLng: `${lat},${lng}` })
        setGeoStatus('success')
        setTimeout(() => setGeoStatus('idle'), 3000)
      },
      () => {
        setGeoStatus('error')
        setGeoError(t('Permission GPS refusée.', 'GPS permission denied.'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const googleMapsUrl = project.jobsiteLatLng
    ? `https://maps.google.com/?q=${project.jobsiteLatLng}`
    : null

  const stats = calcProjectStats(project);
  const marginColor = stats.marginPercent >= 40 ? theme.colors.success : stats.marginPercent >= 20 ? theme.colors.warning : theme.colors.danger;

  const handleAddExpense = () => {
    if (!expDesc || !expAmt) return;
    addExpense(project.id, { description: expDesc, amount: parseFloat(expAmt), date: new Date().toISOString().slice(0, 10) });
    setExpDesc(''); setExpAmt('');
  };

  const toggleAssignEmployee = (empId: string) => {
    const current = project.assignedEmployeeIds ?? [];
    updateProject(project.id, { assignedEmployeeIds: current.includes(empId) ? current.filter(id => id !== empId) : [...current, empId] });
  };

  const tasksDone  = (project.tasks ?? []).filter(t => t.done).length;
  const tasksTotal = (project.tasks ?? []).length;
  const tabs = [
    { id: 'overview'  as const, label: `📊 ${t('Vue', 'Overview')}` },
    { id: 'tasks'     as const, label: `📋 ${t('Tâches', 'Tasks')}${tasksTotal > 0 ? ` ${tasksDone}/${tasksTotal}` : ''}` },
    { id: 'employees' as const, label: `👷 ${t('Équipe', 'Team')}` },
    { id: 'expenses'  as const, label: `💸 ${t('Dépenses', 'Expenses')}` },
    { id: 'logs'      as const, label: `🕐 ${t('Logs', 'Logs')}` },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '64px' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: 'var(--surface, #111)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 64px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }} />
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <h2 style={{ fontWeight: 900, fontSize: '18px', color: 'var(--text)', margin: 0 }}>{project.name}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{project.address}, {project.city}</p>
              <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '2px' }}>
                {PAY_MODE_LABELS[project.payMode].icon} {PAY_MODE_LABELS[project.payMode][lang === 'fr' ? 'fr' : 'en']}
                {project.payMode === 'hourly' && project.hourlyRate && ` · $${project.hourlyRate}/h`}
                {project.payMode === 'job' && project.jobAmount && ` · ${fmt(project.jobAmount)}`}
                {project.payMode === 'sqft' && project.sqftRate && ` · $${project.sqftRate}/pi²`}
              </p>
              {/* Badge GPS */}
              {project.jobsiteLatLng ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 700 }}>
                    📍 {t('GPS actif', 'GPS active')}
                  </span>
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                      🗺️ {t('Vérifier', 'Verify')}
                    </a>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
                  📍 {t('Pas de GPS', 'No GPS')}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--card)', borderRadius: '10px', padding: '4px', marginTop: '12px' }}>
            {tabs.map(tab2 => (
              <button key={tab2.id} onClick={() => setTab(tab2.id)} style={{ flex: 1, borderRadius: '8px', padding: '8px 4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === tab2.id ? 'var(--primary)' : 'transparent', color: tab === tab2.id ? '#000' : 'var(--text-muted)', transition: 'all 0.2s' }}>{tab2.label}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tab === 'overview' && (
            <>
              {project.clientAmount !== undefined && (
                <div style={{ ...cardStyle, border: `1px solid ${theme.colors.primary}44`, background: `${theme.colors.primary}11` }}>
                  <DecoCorners />
                  <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>💼 {t('Montant client', 'Client amount')}</p>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text)' }}>{fmt(project.clientAmount)}</p>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={cardStyle}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>👷 {t("Main d'œuvre", 'Labour')}</p>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{fmt(stats.totalLaborCost)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-weak)', marginTop: '4px' }}>{stats.totalHours.toFixed(1)}h total</p>
                </div>
                <div style={cardStyle}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>💸 {t('Dépenses', 'Expenses')}</p>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{fmt(stats.totalExpenses)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-weak)', marginTop: '4px' }}>{project.expenses.length} {t('entrée(s)', 'entry(ies)')}</p>
                </div>
              </div>
              {stats.clientRevenue > 0 && (
                <div style={{ ...cardStyle, border: `1px solid ${marginColor}44`, background: `${marginColor}11` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>📈 {t('Marge nette', 'Net margin')}</p>
                      <p style={{ fontSize: '28px', fontWeight: 900, color: marginColor }}>{fmt(stats.margin)}</p>
                    </div>
                    <p style={{ fontSize: '36px', fontWeight: 900, color: marginColor }}>{stats.marginPercent.toFixed(0)}%</p>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    {[
                      { label: t('Revenue client',  'Client revenue'),  value: fmt(stats.clientRevenue),        color: 'var(--text)' },
                      { label: `− ${t("Main d'œuvre", 'Labour')}`,        value: `−${fmt(stats.totalLaborCost)}`,  color: 'var(--text-muted)' },
                      { label: `− ${t('Dépenses', 'Expenses')}`,           value: `−${fmt(stats.totalExpenses)}`,   color: 'var(--text-muted)' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: row.color, marginBottom: '4px' }}>
                        <span>{row.label}</span><span>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: marginColor, borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span>= {t('MARGE', 'MARGIN')}</span><span>{fmt(stats.margin)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Section GPS dans la carte projet ── */}
              <div style={{ ...cardStyle, border: project.jobsiteLatLng ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)', background: project.jobsiteLatLng ? 'rgba(34,197,94,0.06)' : 'var(--card)' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: project.jobsiteLatLng ? '#22c55e' : 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  📍 {t('Géofencing chantier', 'Jobsite Geofencing')}
                </p>

                {/* Bouton position actuelle */}
                <button
                  onClick={handleUseMyLocationCard}
                  disabled={geoStatus === 'loading'}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer', border: geoStatus === 'success' ? '1px solid rgba(34,197,94,0.5)' : '1px solid var(--border)', background: geoStatus === 'success' ? 'rgba(34,197,94,0.15)' : 'var(--surface)', color: geoStatus === 'success' ? '#22c55e' : 'var(--text)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', opacity: geoStatus === 'loading' ? 0.6 : 1 }}
                >
                  {geoStatus === 'loading' && <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                  {geoStatus === 'success' ? '✅' : '📍'}
                  {geoStatus === 'loading' ? t('Localisation...', 'Getting location...') : geoStatus === 'success' ? t('Position sauvegardée!', 'Position saved!') : t('Utiliser ma position actuelle', 'Use my current location')}
                </button>

                {geoStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '8px' }}>🚫 {geoError}</p>
                )}

                {/* Instructions Google Maps */}
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: '8px' }}>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    🗺️ {t('Google Maps : appui long sur le chantier → copie les coordonnées → colle ici', 'Google Maps: long press on jobsite → copy coordinates → paste here')}
                  </p>
                </div>

                {/* Champ coordonnées */}
                <input
                  value={project.jobsiteLatLng || ''}
                  onChange={e => updateProject(project.id, { jobsiteLatLng: e.target.value || undefined })}
                  placeholder="51.044733, -114.071883"
                  inputMode="decimal"
                  style={{ ...inputStyle, marginBottom: '8px', fontFamily: 'monospace', fontSize: '13px' }}
                />

                {/* Aperçu + lien Maps */}
                {project.jobsiteLatLng && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <p style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>
                      ✅ {t('GPS configuré — géofencing actif tant que le projet est ouvert', 'GPS set — geofencing active while project is open')}
                    </p>
                    {googleMapsUrl && (
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                        style={{ flexShrink: 0, padding: '6px 10px', borderRadius: '8px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>
                        🗺️
                      </a>
                    )}
                  </div>
                )}

                {/* Effacer */}
                {project.jobsiteLatLng && (
                  <button
                    onClick={() => updateProject(project.id, { jobsiteLatLng: undefined })}
                    style={{ width: '100%', marginTop: '8px', padding: '8px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '11px', fontWeight: 700 }}
                  >
                    🗑️ {t('Effacer les coordonnées', 'Clear coordinates')}
                  </button>
                )}
              </div>

              <DecoGravure />
              {project.status === 'open' && isAdmin && tasksTotal === 0 && (
                <button onClick={() => { adminVerifyAndClose(project.id); onClose(); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--info)', background: `${theme.colors.info}18`, color: 'var(--info)', fontWeight: 700, fontSize: '14px' }}>
                  🔒 {t('Fermer le projet', 'Close project')}
                </button>
              )}
              {project.status === 'open' && isAdmin && tasksTotal > 0 && project.workerCompletedAt && !project.adminVerifiedAt && (
                <button onClick={() => { adminVerifyAndClose(project.id); onClose(); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(251,191,36,0.5)', background: 'rgba(251,191,36,0.12)', color: 'var(--primary)', fontWeight: 800, fontSize: '14px' }}>
                  🔐 {t('Vérifier et fermer le projet', 'Verify and close project')}
                </button>
              )}
              {project.status === 'open' && isAdmin && tasksTotal > 0 && !project.workerCompletedAt && (
                <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ⏳ {t('En attente de confirmation terrain — voir onglet Tâches', 'Waiting for field confirmation — see Tasks tab')}
                  </p>
                </div>
              )}
              {project.status === 'open' && !isAdmin && tasksTotal > 0 && !project.workerCompletedAt && (project.tasks ?? []).every(t => t.done) && (
                <button onClick={() => { workerCompleteProject(project.id); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(34,197,94,0.5)', background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 800, fontSize: '14px' }}>
                  ✅ {t('Confirmer les travaux terminés', 'Confirm work completed')}
                </button>
              )}
              {project.status === 'closed' && (
                <button
                  onClick={() => {
                    if (confirm(t('Rouvrir ce projet ? Le géofencing se réactivera automatiquement si des coordonnées GPS sont configurées.', 'Reopen this project? Geofencing will reactivate automatically if GPS coordinates are set.'))) {
                      updateProject(project.id, { status: 'open', closedAt: undefined })
                      onClose()
                    }
                  }}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(34,197,94,0.5)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 700, fontSize: '14px' }}
                >
                  🔓 {t('Rouvrir le projet', 'Reopen project')}
                </button>
              )}
            </>
          )}

          {tab === 'employees' && (
            <>
              <div style={cardStyle}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  ✏️ {t("Gérer l'équipe", 'Manage team')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allEmployees.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>{t('Aucun employé.', 'No employees.')}</p>}
                  {allEmployees.map(emp => {
                    const assigned = (project.assignedEmployeeIds ?? []).includes(emp.id);
                    return (
                      <button key={emp.id} onClick={() => toggleAssignEmployee(emp.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', border: assigned ? '1px solid var(--primary)' : '1px solid var(--border)', background: assigned ? 'var(--primary)18' : 'var(--card)', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>{assigned ? '✅' : '⬜'}</span>
                          <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{emp.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>${emp.hourlyRate ?? 0}/h · {emp.role === 'admin' ? '👑 Admin' : `👷 ${t('Employé', 'Employee')}`}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: assigned ? 'var(--primary)30' : 'transparent', color: assigned ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {assigned ? t('Assigné', 'Assigned') : t('Ajouter', 'Add')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {Object.values(stats.byEmployee).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>📊 {t('Heures enregistrées', 'Recorded hours')}</p>
                  {Object.values(stats.byEmployee).map(emp => (
                    <div key={emp.employeeId} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{emp.employeeName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>${emp.hourlyRate}/h · {emp.sessions} {t('session(s)', 'session(s)')}</p>
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
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{t("Total main d'œuvre", 'Total labour')}</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>{fmt(stats.totalLaborCost)}</span>
                  </div>
                </div>
              )}
              {Object.values(stats.byEmployee).length === 0 && (<><DecoGravure /><p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>{t('Aucune heure enregistrée.', 'No hours recorded.')}</p></>)}
            </>
          )}

          {tab === 'expenses' && (
            <>
              <div style={cardStyle}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  ➕ {t('Ajouter une dépense', 'Add an expense')}
                </p>
                <input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder={t('Description (gaz, matériaux...)', 'Description (gas, materials...)')} style={{ ...inputStyle, marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder={t('Montant $', 'Amount $')} style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={handleAddExpense} style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}>➕</button>
                </div>
              </div>
              {project.expenses.length === 0 && (<><DecoGravure /><p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>{t('Aucune dépense.', 'No expenses.')}</p></>)}
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
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--danger)' }}>{t('Total dépenses', 'Total expenses')}</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--danger)' }}>{fmt(stats.totalExpenses)}</span>
                </div>
              )}
            </>
          )}

          {tab === 'tasks' && (
            <>
              {/* Progress bar */}
              {tasksTotal > 0 && (
                <div style={{ ...cardStyle, border: tasksDone === tasksTotal ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                      {tasksDone === tasksTotal ? '✅' : '📋'} {tasksDone}/{tasksTotal} {t('tâches complétées', 'tasks completed')}
                    </p>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: tasksDone === tasksTotal ? '#22c55e' : 'var(--primary)' }}>{tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: tasksDone === tasksTotal ? '#22c55e' : 'var(--primary)', borderRadius: '3px', width: `${tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0}%`, transition: 'width 0.3s ease' }} />
                  </div>
                  {project.workerCompletedAt && (
                    <p style={{ fontSize: '11px', color: '#22c55e', marginTop: '8px', fontWeight: 700 }}>
                      ✅ {t('Terrain confirmé', 'Field confirmed')} — {new Date(project.workerCompletedAt).toLocaleDateString()}
                    </p>
                  )}
                  {project.adminVerifiedAt && (
                    <p style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', fontWeight: 700 }}>
                      🔐 {t("Vérifié par l'admin", 'Admin verified')} — {new Date(project.adminVerifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Task list */}
              {tasksTotal === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>📋 {t('Aucune tâche pour ce projet.', 'No tasks for this project.')}</p>
                  {isAdmin && <p style={{ color: 'var(--text-weak)', fontSize: '12px', marginTop: '4px' }}>{t('Ajoutez des tâches ci-dessous.', 'Add tasks below.')}</p>}
                </div>
              )}

              {(project.tasks ?? []).map(task => (
                <div key={task.id} style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: '12px', border: task.done ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)', background: task.done ? 'rgba(34,197,94,0.05)' : 'var(--card)', opacity: project.status === 'closed' ? 0.8 : 1 }}>
                  <button
                    onClick={() => toggleTask(project.id, task.id, currentEmployee?.name ?? 'Admin')}
                    disabled={project.status === 'closed'}
                    style={{ flexShrink: 0, marginTop: '2px', width: '22px', height: '22px', borderRadius: '6px', border: task.done ? '2px solid #22c55e' : '2px solid var(--border)', background: task.done ? '#22c55e' : 'transparent', cursor: project.status === 'closed' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#000', fontWeight: 900, transition: 'all 0.2s' }}
                  >
                    {task.done ? '✓' : ''}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: task.done ? 400 : 700, color: task.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</p>
                    {(task.qty !== undefined || task.unit) && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{task.qty !== undefined && `${task.qty} `}{task.unit}</p>
                    )}
                    {task.done && task.doneBy && (
                      <p style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>✅ {task.doneBy} — {task.doneAt ? new Date(task.doneAt).toLocaleDateString() : ''}</p>
                    )}
                  </div>
                  {isAdmin && project.status === 'open' && (
                    <button onClick={() => removeTask(project.id, task.id)} style={{ flexShrink: 0, background: 'none', border: 'none', color: 'var(--text-weak)', cursor: 'pointer', fontSize: '16px', padding: '2px 4px', lineHeight: 1 }}>✕</button>
                  )}
                </div>
              ))}

              {/* Add task — admin only */}
              {isAdmin && project.status === 'open' && (
                <div style={cardStyle}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                    ➕ {t('Ajouter une tâche', 'Add a task')}
                  </p>

                  {/* Catalogue quick-add */}
                  {catMaterials.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>{t('Du catalogue :', 'From catalogue:')}</p>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '2px' }}>
                        {catMaterials.map(mat => (
                          <button
                            key={mat.id}
                            onClick={() => addTask(project.id, { label: mat.name, catalogItemId: mat.id, unit: mat.unit, done: false })}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'left', transition: 'background 0.15s' }}
                          >
                            <span style={{ fontSize: '14px', flexShrink: 0 }}>{mat.emoji ?? '📦'}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.name}</span>
                            {mat.unit && <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{mat.unit}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual input */}
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>{t('Ou instruction manuelle :', 'Or manual instruction:')}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={taskLabel}
                      onChange={e => setTaskLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && taskLabel.trim()) {
                          addTask(project.id, { label: taskLabel.trim(), done: false });
                          setTaskLabel('');
                        }
                      }}
                      placeholder={t('Ex: Nettoyer le chantier', 'Ex: Clean up the site')}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      onClick={() => { if (taskLabel.trim()) { addTask(project.id, { label: taskLabel.trim(), done: false }); setTaskLabel(''); } }}
                      disabled={!taskLabel.trim()}
                      style={{ background: taskLabel.trim() ? 'var(--primary)' : 'var(--border)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: taskLabel.trim() ? '#000' : 'var(--text-muted)', fontWeight: 800, cursor: taskLabel.trim() ? 'pointer' : 'default', fontSize: '16px', transition: 'all 0.2s' }}
                    >
                      ➕
                    </button>
                  </div>
                </div>
              )}

              <DecoGravure />

              {/* Worker — confirm completion */}
              {!isAdmin && project.status === 'open' && !project.workerCompletedAt && tasksTotal > 0 && tasksDone === tasksTotal && (
                <button onClick={() => workerCompleteProject(project.id)} style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(34,197,94,0.5)', background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 800, fontSize: '14px' }}>
                  ✅ {t('Confirmer les travaux terminés', 'Confirm work completed')}
                </button>
              )}
              {!isAdmin && project.status === 'open' && project.workerCompletedAt && (
                <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#22c55e', fontWeight: 700 }}>✅ {t("Travaux confirmés — en attente de vérification admin", 'Work confirmed — pending admin verification')}</p>
                </div>
              )}
              {!isAdmin && project.status === 'open' && tasksTotal > 0 && tasksDone < tasksTotal && (
                <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⏳ {t(`Coche toutes les tâches pour confirmer les travaux (${tasksDone}/${tasksTotal})`, `Check all tasks to confirm work (${tasksDone}/${tasksTotal})`)}</p>
                </div>
              )}

              {/* Admin — verify and close */}
              {isAdmin && project.status === 'open' && tasksTotal > 0 && project.workerCompletedAt && !project.adminVerifiedAt && (
                <button onClick={() => { adminVerifyAndClose(project.id); onClose(); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(251,191,36,0.5)', background: 'rgba(251,191,36,0.12)', color: 'var(--primary)', fontWeight: 800, fontSize: '14px' }}>
                  🔐 {t('Vérifier et fermer le projet', 'Verify and close project')}
                </button>
              )}
              {isAdmin && project.status === 'open' && tasksTotal > 0 && !project.workerCompletedAt && (
                <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ⏳ {t('En attente de confirmation terrain', 'Waiting for field crew confirmation')}
                  </p>
                </div>
              )}
            </>
          )}

          {tab === 'logs' && (
            <>
              {project.workLogs.length === 0 && (<><DecoGravure /><p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px 0' }}>{t('Aucun log de travail.', 'No work logs.')}</p></>)}
              {[...project.workLogs].reverse().map((log, idx) => (
                <div key={idx} style={{ ...cardStyle, border: !log.punchOut ? '1px solid var(--success)44' : '1px solid var(--border)', background: !log.punchOut ? 'var(--success)11' : 'var(--card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{log.employeeName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.date} · ${log.hourlyRate}/h</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {log.punchOut ? (<><p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>{log.hoursWorked?.toFixed(2)}h</p><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmt((log.hoursWorked ?? 0) * log.hourlyRate)}</p></>) : (<span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>🟢 {t('En cours', 'In progress')}</span>)}
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
  const { lang } = useLangStore();
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;
  const employeeStore = useEmployeeStore();
  const employees = (employeeStore as unknown as Record<string, unknown>).employees as Array<{ id: string; name: string; hourlyRate?: number }> ?? [];

  const [form, setForm] = useState({
    name: '', clientId: '', address: '', city: '',
    payMode: 'hourly' as PayMode,
    hourlyRate: '', jobAmount: '', sqftRate: '', clientAmount: '',
    assignedEmployeeIds: [] as string[], notes: '',
    jobsiteLatLng: '',
  });

  // ── GPS pour le nouveau projet ────────────────────────────────────────────
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [geoError, setGeoError]   = useState('')

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoError(t('GPS non supporté.', 'GPS not supported.'))
      return
    }
    setGeoStatus('loading')
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        setForm(f => ({ ...f, jobsiteLatLng: `${lat},${lng}` }))
        setGeoStatus('success')
        setTimeout(() => setGeoStatus('idle'), 3000)
      },
      () => {
        setGeoStatus('error')
        setGeoError(t('Permission GPS refusée. Activez la localisation.', 'GPS permission denied. Enable location.'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const toggleEmployee = (id: string) => setForm(f => ({ ...f, assignedEmployeeIds: f.assignedEmployeeIds.includes(id) ? f.assignedEmployeeIds.filter(e => e !== id) : [...f.assignedEmployeeIds, id] }));

  const handleSubmit = () => {
    if (!form.name || !form.address) return;
    const client = clients.find(c => c.id === form.clientId);
    addProject({
      name: form.name,
      clientId: form.clientId,
      clientName: client?.name ?? '',
      address: form.address,
      city: form.city,
      payMode: form.payMode,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
      jobAmount: form.jobAmount ? parseFloat(form.jobAmount) : undefined,
      sqftRate: form.sqftRate ? parseFloat(form.sqftRate) : undefined,
      clientAmount: form.clientAmount ? parseFloat(form.clientAmount) : undefined,
      assignedEmployeeIds: form.assignedEmployeeIds,
      notes: form.notes,
      jobsiteLatLng: form.jobsiteLatLng.trim() || undefined,
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '64px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: '100%', maxWidth: '520px', background: 'var(--surface)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 64px)', overflow: 'hidden' }}>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', flexShrink: 0 }} />
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontWeight: 900, fontSize: '18px', color: 'var(--text)', margin: 0 }}>🏗️ {t('Nouveau projet', 'New project')}</h2>
          <button onClick={onClose} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Infos de base */}
          {[
            { label: t('Nom du projet *', 'Project name *'), key: 'name', placeholder: t('Ex: Toiture — 123 Main St', 'Ex: Roofing — 123 Main St') },
            { label: t('Adresse du chantier *', 'Job site address *'), key: 'address', placeholder: '123 Main St' },
            { label: t('Ville', 'City'), key: 'city', placeholder: 'Calgary' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{f.label}</label>
              <input type="text" value={(form as unknown as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={inputStyle}/>
            </div>
          ))}

          {/* Client */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('Client', 'Client')}</label>
            <select value={form.clientId} onChange={e => set('clientId', e.target.value)} style={{ ...inputStyle }}>
              <option value="">— {t('Choisir client', 'Choose client')} —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Mode de paiement */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('Mode de paiement des employés', 'Employee pay mode')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {(Object.entries(PAY_MODE_LABELS) as [PayMode, { fr: string; en: string; icon: string }][]).map(([mode, l]) => (
                <button key={mode} onClick={() => set('payMode', mode)} style={{ padding: '12px 6px', borderRadius: '10px', cursor: 'pointer', border: form.payMode === mode ? '1px solid var(--primary)' : '1px solid var(--border)', background: form.payMode === mode ? 'var(--primary)22' : 'var(--card)', color: form.payMode === mode ? 'var(--primary)' : 'var(--text-muted)', fontSize: '11px', fontWeight: 700, transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{l.icon}</div>
                  {lang === 'fr' ? l.fr : l.en}
                </button>
              ))}
            </div>
          </div>

          {form.payMode === 'hourly' && (<div><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('Taux horaire ($/h)', 'Hourly rate ($/h)')}</label><input type="number" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="45" style={inputStyle} /></div>)}
          {form.payMode === 'job'    && (<div><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('Montant total à la job ($)', 'Total flat rate ($)')}</label><input type="number" value={form.jobAmount} onChange={e => set('jobAmount', e.target.value)} placeholder="1500" style={inputStyle} /></div>)}
          {form.payMode === 'sqft'   && (<div><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('Taux pi² ($/pi²)', 'Rate per sqft ($/sqft)')}</label><input type="number" value={form.sqftRate} onChange={e => set('sqftRate', e.target.value)} placeholder="2.25" style={inputStyle} /></div>)}

          {/* Montant client */}
          <div style={{ background: 'var(--primary)11', border: '1px solid var(--primary)33', borderRadius: '10px', padding: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--primary)', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              💼 {t('Montant client (admin seulement)', 'Client amount (admin only)')}
            </label>
            <input type="number" value={form.clientAmount} onChange={e => set('clientAmount', e.target.value)} placeholder={t('Ex: 3500', 'Ex: 3500')} style={{ ...inputStyle, border: '1px solid var(--primary)44' }} />
          </div>

          {/* ── SECTION GPS / GÉOFENCING ── */}
          <div style={{ background: form.jobsiteLatLng ? 'rgba(34,197,94,0.06)' : 'var(--card)', border: form.jobsiteLatLng ? '1px solid rgba(34,197,94,0.35)' : '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: form.jobsiteLatLng ? '#22c55e' : 'var(--text-muted)', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              📍 {t('GPS Chantier — Géofencing automatique', 'Jobsite GPS — Auto Geofencing')}
            </label>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
              {t(
                'En ajoutant les coordonnées, le géofencing s\'active automatiquement. Il s\'arrête quand tu fermes le projet.',
                'Adding coordinates automatically activates geofencing. It stops when you close the project.'
              )}
            </p>

            {/* Bouton Option A — Ma position */}
            <button
              onClick={handleUseMyLocation}
              disabled={geoStatus === 'loading'}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer', border: geoStatus === 'success' ? '1px solid rgba(34,197,94,0.5)' : '1px solid var(--border)', background: geoStatus === 'success' ? 'rgba(34,197,94,0.15)' : 'var(--surface)', color: geoStatus === 'success' ? '#22c55e' : 'var(--text)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', opacity: geoStatus === 'loading' ? 0.6 : 1, transition: 'all 0.2s' }}
            >
              {geoStatus === 'loading' && (
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
              {geoStatus === 'success' ? '✅' : '📍'}
              {geoStatus === 'loading'
                ? t('Localisation en cours...', 'Getting location...')
                : geoStatus === 'success'
                ? t('Position sauvegardée!', 'Position saved!')
                : t('📍 Utiliser ma position actuelle', '📍 Use my current location')}
            </button>

            {/* Erreur GPS */}
            {geoStatus === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '8px' }}>🚫 {geoError}</p>
            )}

            {/* Option C — Instructions Google Maps */}
            <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: '8px' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                🗺️ {t(
                  'Google Maps : 1. Ouvre Maps  2. Appui long sur le chantier  3. Copie les chiffres  4. Colle ici',
                  'Google Maps: 1. Open Maps  2. Long press on jobsite  3. Copy numbers  4. Paste here'
                )}
              </p>
            </div>

            {/* Champ coordonnées */}
            <input
              value={form.jobsiteLatLng}
              onChange={e => { set('jobsiteLatLng', e.target.value); if (geoStatus !== 'idle') setGeoStatus('idle') }}
              placeholder="51.044733, -114.071883"
              inputMode="decimal"
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px' }}
            />

            {/* Aperçu si valide */}
            {form.jobsiteLatLng.includes(',') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>
                  ✅ {t('GPS configuré — géofencing actif dès création', 'GPS set — geofencing active on creation')}
                </span>
                <a
                  href={`https://maps.google.com/?q=${form.jobsiteLatLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', marginLeft: 'auto' }}
                >
                  🗺️ {t('Vérifier', 'Verify')}
                </a>
              </div>
            )}
          </div>

          {/* Employés assignés */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('Employés assignés', 'Assigned employees')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {employees.map(emp => (
                <button key={emp.id} onClick={() => toggleEmployee(emp.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', border: form.assignedEmployeeIds.includes(emp.id) ? '1px solid var(--primary)' : '1px solid var(--border)', background: form.assignedEmployeeIds.includes(emp.id) ? 'var(--primary)18' : 'var(--card)', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{emp.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${emp.hourlyRate ?? 0}/h</span>
                    {form.assignedEmployeeIds.includes(emp.id) && <span style={{ color: 'var(--primary)' }}>✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('Notes', 'Notes')}</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder={t('Instructions, matériaux requis...', 'Instructions, materials needed...')} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
        </div>
        <div style={{ padding: '16px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <button onClick={handleSubmit} disabled={!form.name || !form.address} style={{ width: '100%', padding: '16px', borderRadius: '14px', cursor: 'pointer', border: 'none', fontWeight: 900, fontSize: '15px', background: !form.name || !form.address ? 'var(--border)' : 'var(--primary)', color: !form.name || !form.address ? 'var(--text-muted)' : '#000', opacity: !form.name || !form.address ? 0.5 : 1, transition: 'all 0.2s' }}>
            🏗️ {t('Créer le projet', 'Create project')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { projects, getOpenProjects } = useProjectStore();
  const { lang } = useLangStore();
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;
  const [showNew, setShowNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const filters = [
    { id: 'open'   as const, label: `🟢 ${t('Ouverts', 'Open')}` },
    { id: 'closed' as const, label: `🔒 ${t('Fermés', 'Closed')}` },
    { id: 'all'    as const, label: `📋 ${t('Tous', 'All')}` },
  ];

  const statusLabel: Record<string, string> = {
    open:     t('Ouvert', 'Open'),
    closed:   t('Fermé', 'Closed'),
    invoiced: t('Facturé', 'Invoiced'),
  };

  const statusColor: Record<string, string> = { open: 'var(--success)', closed: 'var(--text-muted)', invoiced: 'var(--info)' };

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes projectFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .project-card { animation: projectFadeIn 0.3s ease both; }
        .project-card:active { transform: scale(0.98); transition: transform 0.15s; }
      `}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '16px 16px 12px' }}>
        <DecoGravure style={{ marginBottom: '8px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>🏗️ {t('Projets', 'Projects')}</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {getOpenProjects().length} {t('projet(s) ouvert(s)', 'open project(s)')}
            </p>
          </div>
          <button onClick={() => setShowNew(true)} style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#000', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
            + {t('Nouveau', 'New')}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--card)', borderRadius: '10px', padding: '4px' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: filter === f.id ? 'var(--primary)' : 'transparent', color: filter === f.id ? '#000' : 'var(--text-muted)', transition: 'all 0.2s' }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <DecoGravure style={{ marginBottom: '24px' }} />
            <p style={{ fontSize: '48px', marginBottom: '8px' }}>🏗️</p>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px' }}>{t('Aucun projet', 'No projects')}</p>
            <p style={{ color: 'var(--text-weak)', fontSize: '13px', marginTop: '4px' }}>
              {filter === 'open' ? t('Créez votre premier projet ci-dessus.', 'Create your first project above.') : t('Rien à afficher.', 'Nothing to show.')}
            </p>
            <DecoGravure style={{ marginTop: '24px' }} />
          </div>
        )}

        {filtered.map((project, idx) => {
          const stats = calcProjectStats(project);
          return (
            <button key={project.id} className="project-card" onClick={() => setSelectedProject(project)} style={{ ...cardStyle, textAlign: 'left', cursor: 'pointer', width: '100%', animationDelay: `${idx * 0.05}s`, transition: 'border-color 0.2s' }}>
              <DecoCorners />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 900, fontSize: '15px', color: 'var(--text)' }}>{project.name}</span>
                    {stats.activeLog && (<span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'var(--success)22', color: 'var(--success)', border: '1px solid var(--success)44', fontWeight: 700 }}>🟢 {t('En cours', 'Active')}</span>)}
                    {/* Badge GPS sur la carte */}
                    {project.jobsiteLatLng && project.status === 'open' && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', fontWeight: 700 }}>
                        📍 GPS
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{project.address}, {project.city}</p>
                  {project.clientName && <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '2px' }}>👤 {project.clientName}</p>}
                </div>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: `${statusColor[project.status]}22`, color: statusColor[project.status], border: `1px solid ${statusColor[project.status]}44`, fontWeight: 700, flexShrink: 0 }}>
                  {statusLabel[project.status] ?? project.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{PAY_MODE_LABELS[project.payMode].icon} {PAY_MODE_LABELS[project.payMode][lang === 'fr' ? 'fr' : 'en']}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👷 {project.assignedEmployeeIds.length} {t('emp.', 'emp.')}</span>
                {stats.totalHours > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱️ {stats.totalHours.toFixed(1)}h</span>}
                {stats.margin !== 0 && (<span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 800, color: stats.marginPercent >= 40 ? 'var(--success)' : stats.marginPercent >= 20 ? 'var(--warning)' : 'var(--danger)' }}>{stats.marginPercent.toFixed(0)}% {t('marge', 'margin')}</span>)}
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
