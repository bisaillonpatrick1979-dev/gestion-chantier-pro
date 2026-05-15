'use client';

// src/components/PunchInModal.tsx
// Ce composant remplace le simple punch in/out existant
// Il gère : sélection projet, mode paiement, matériaux au punch out

import { useState } from 'react';
import { useProjectStore, MaterialEntry, PayMode } from '@/store/useProjectStore';

interface Props {
  employeeId: string;
  employeeName: string;
  employeeHourlyRate: number;
  mode: 'in' | 'out';
  onComplete: () => void;
  onCancel: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: number) => `$${n.toFixed(2)}`;

export default function PunchInModal({
  employeeId,
  employeeName,
  employeeHourlyRate,
  mode,
  onComplete,
  onCancel,
}: Props) {
  const { getProjectsForEmployee, getActiveLogForEmployee, punchIn, punchOut } = useProjectStore();

  // ── PUNCH IN state ────────────────────────────────────────────────────────
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [customRate, setCustomRate] = useState(employeeHourlyRate.toString());
  const [jobPayAmount, setJobPayAmount] = useState('');

  // ── PUNCH OUT state — matériaux ───────────────────────────────────────────
  const [materials, setMaterials] = useState<MaterialEntry[]>([
    { id: uid(), material: '', sqft: 0, ratePerSqft: 0 },
  ]);

  const availableProjects = getProjectsForEmployee(employeeId);
  const activeEntry = getActiveLogForEmployee(employeeId);

  const selectedProject = availableProjects.find((p) => p.id === selectedProjectId)
    ?? activeEntry?.project;

  const payMode: PayMode = selectedProject?.payMode ?? 'hourly';

  // ── Matériaux helpers ─────────────────────────────────────────────────────
  const updateMaterial = (idx: number, field: keyof MaterialEntry, value: string | number) => {
    setMaterials((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const addMaterial = () =>
    setMaterials((prev) => [...prev, { id: uid(), material: '', sqft: 0, ratePerSqft: 0 }]);

  const removeMaterial = (idx: number) =>
    setMaterials((prev) => prev.filter((_, i) => i !== idx));

  const totalMaterialRevenue = materials.reduce(
    (sum, m) => sum + m.sqft * m.ratePerSqft, 0
  );

  // ── PUNCH IN ──────────────────────────────────────────────────────────────
  const handlePunchIn = () => {
    if (!selectedProjectId) return;
    punchIn(selectedProjectId, {
      employeeId,
      employeeName,
      hourlyRate: parseFloat(customRate) || employeeHourlyRate,
      punchIn: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      ...(payMode === 'job' && jobPayAmount
        ? { jobPay: parseFloat(jobPayAmount) }
        : {}),
    });
    onComplete();
  };

  // ── PUNCH OUT ─────────────────────────────────────────────────────────────
  const handlePunchOut = () => {
    if (!activeEntry) return;
    punchOut(activeEntry.project.id, employeeId, {
      materials: payMode === 'sqft'
        ? materials.filter((m) => m.material && m.sqft > 0)
        : undefined,
    });
    onComplete();
  };

  // ── RENDER PUNCH IN ───────────────────────────────────────────────────────
  if (mode === 'in') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
        <div className="w-full max-w-lg bg-gray-900 rounded-t-3xl border-t border-white/10 pb-8">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-white text-xl">⏱️ Punch In</h2>
                <p className="text-sm text-gray-400 mt-0.5">{employeeName}</p>
              </div>
              <button onClick={onCancel} className="text-gray-400 text-2xl hover:text-white">✕</button>
            </div>
          </div>

          <div className="px-5 pt-5 space-y-4">
            {/* Sélection projet */}
            <div>
              <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                🏗️ Sur quel projet travailles-tu ?
              </label>
              {availableProjects.length === 0 ? (
                <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-center">
                  <p className="text-yellow-300 text-sm font-semibold">
                    Aucun projet assigné
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    L'admin doit t'assigner à un projet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                        selectedProjectId === p.id
                          ? 'border-orange-400 bg-orange-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <p className="font-bold text-white text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        📍 {p.address}, {p.city}
                      </p>
                      <p className="text-xs text-orange-400 mt-0.5">
                        {p.payMode === 'hourly' && `⏱️ À l'heure`}
                        {p.payMode === 'job' && `💰 À la job`}
                        {p.payMode === 'sqft' && `📐 Au pied carré`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Taux selon le mode */}
            {selectedProjectId && payMode === 'hourly' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  💵 Ton taux horaire ($/h)
                </label>
                <input
                  type="number"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-bold text-white focus:border-orange-400 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Taux par défaut : ${employeeHourlyRate}/h
                </p>
              </div>
            )}

            {selectedProjectId && payMode === 'job' && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
                <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                  💰 Ta paye pour cette job ($)
                </label>
                <input
                  type="number"
                  value={jobPayAmount}
                  onChange={(e) => setJobPayAmount(e.target.value)}
                  placeholder="Ex: 350"
                  className="w-full rounded-xl border border-green-500/30 bg-black/20 px-4 py-3 text-xl font-bold text-white focus:border-green-400 focus:outline-none"
                />
                {selectedProject?.jobAmount && (
                  <p className="text-xs text-green-400 mt-1">
                    💡 Montant total job : {fmt(selectedProject.jobAmount)}
                  </p>
                )}
              </div>
            )}

            {selectedProjectId && payMode === 'sqft' && (
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3">
                <p className="text-xs text-blue-400 font-semibold">
                  📐 Mode pied carré — tu entreras les matériaux au punch out.
                </p>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-3">
                  ⏱️ Ton taux horaire ($/h) pour ce projet
                </label>
                <input
                  type="number"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white focus:border-orange-400 focus:outline-none"
                />
              </div>
            )}

            {/* Bouton Punch In */}
            <button
              onClick={handlePunchIn}
              disabled={!selectedProjectId || availableProjects.length === 0}
              className="w-full rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-black py-5 text-xl transition-all mt-2"
            >
              🟢 PUNCH IN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER PUNCH OUT ──────────────────────────────────────────────────────
  if (!activeEntry) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 text-center max-w-sm w-full">
          <p className="text-gray-400">Aucun punch in actif trouvé.</p>
          <button onClick={onCancel} className="mt-4 text-orange-400 underline text-sm">Fermer</button>
        </div>
      </div>
    );
  }

  const punchInTime = new Date(activeEntry.log.punchIn);
  const now = new Date();
  const hoursElapsed = (now.getTime() - punchInTime.getTime()) / (1000 * 60 * 60);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-lg bg-gray-900 rounded-t-3xl border-t border-white/10 pb-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-white text-xl">🔴 Punch Out</h2>
              <p className="text-sm text-gray-400 mt-0.5">{employeeName}</p>
            </div>
            <button onClick={onCancel} className="text-gray-400 text-2xl hover:text-white">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pt-5 space-y-4">
          {/* Projet actif */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-gray-400 mb-1">Projet en cours</p>
            <p className="font-black text-white">{activeEntry.project.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              📍 {activeEntry.project.address}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Temps écoulé</span>
              <span className="text-2xl font-black text-orange-400">
                {hoursElapsed.toFixed(2)}h
              </span>
            </div>
            {payMode === 'hourly' && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">Montant</span>
                <span className="text-lg font-bold text-green-400">
                  {fmt(hoursElapsed * activeEntry.log.hourlyRate)}
                </span>
              </div>
            )}
          </div>

          {/* Matériaux — mode pi² seulement */}
          {payMode === 'sqft' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  📐 Matériaux installés aujourd'hui
                </label>
              </div>

              <div className="space-y-3">
                {materials.map((mat, idx) => (
                  <div key={mat.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-bold">Matériau #{idx + 1}</span>
                      {materials.length > 1 && (
                        <button
                          onClick={() => removeMaterial(idx)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      value={mat.material}
                      onChange={(e) => updateMaterial(idx, 'material', e.target.value)}
                      placeholder="Ex: Siding vinyl, Soffit, Bardeau..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pi² installés</label>
                        <input
                          type="number"
                          value={mat.sqft || ''}
                          onChange={(e) => updateMaterial(idx, 'sqft', parseFloat(e.target.value) || 0)}
                          placeholder="300"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">$/pi²</label>
                        <input
                          type="number"
                          value={mat.ratePerSqft || ''}
                          onChange={(e) => updateMaterial(idx, 'ratePerSqft', parseFloat(e.target.value) || 0)}
                          placeholder="2.25"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    {mat.sqft > 0 && mat.ratePerSqft > 0 && (
                      <p className="text-right text-xs text-orange-400 font-bold mt-1">
                        = {fmt(mat.sqft * mat.ratePerSqft)}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addMaterial}
                className="w-full rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 py-3 text-blue-400 text-sm font-bold hover:bg-blue-500/10 transition mt-2"
              >
                ➕ Ajouter un matériau
              </button>

              {totalMaterialRevenue > 0 && (
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 flex justify-between items-center mt-2">
                  <span className="text-sm text-blue-300 font-bold">Total revenue pi²</span>
                  <span className="text-xl font-black text-blue-400">{fmt(totalMaterialRevenue)}</span>
                </div>
              )}
            </div>
          )}

          {/* Résumé forfait */}
          {payMode === 'job' && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
              <p className="text-xs text-green-400 font-bold mb-2">💰 Résumé job</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Paye job</span>
                <span className="font-bold text-white">{fmt(activeEntry.log.jobPay ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-300">Temps travaillé</span>
                <span className="font-bold text-white">{hoursElapsed.toFixed(2)}h</span>
              </div>
              <div className="flex justify-between text-sm mt-1 border-t border-white/10 pt-2">
                <span className="text-gray-300">Taux effectif</span>
                <span className={`font-black ${
                  (activeEntry.log.jobPay ?? 0) / hoursElapsed >= 30 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {fmt((activeEntry.log.jobPay ?? 0) / hoursElapsed)}/h
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bouton Punch Out */}
        <div className="px-5 pb-2 pt-3 shrink-0">
          <button
            onClick={handlePunchOut}
            className="w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black py-5 text-xl transition-all"
          >
            🔴 PUNCH OUT
          </button>
        </div>
      </div>
    </div>
  );
}
