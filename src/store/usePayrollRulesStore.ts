'use client'
// src/store/usePayrollRulesStore.ts
// Moteur RH — 3 couches : calcul ancienneté, conformité légale, alertes

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────────────────────
// 📐 TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface VacationTier {
  id: string
  minYears: number       // Ancienneté minimale (ex: 0)
  maxYears: number       // Ancienneté maximale (ex: 2) — Infinity = pas de limite
  rate: number           // Taux vacances % (ex: 6)
  label: string          // Ex: "0-2 ans → 6%"
  labelEN: string
}

export interface PayrollAuditEntry {
  id: string
  timestamp: string
  employeeId: string
  employeeName: string
  field: string          // Ex: "vacationRate"
  oldValue: string
  newValue: string
  changedBy: string      // ID de l'admin
  reason?: string
}

export interface HRAlert {
  id: string
  type: 'vacation_tier_upgrade'
    | 'contract_renewal'
    | 'legal_minimum_violation'
    | 'anniversary'
    | 'custom'
  severity: 'info' | 'warning' | 'critical'
  employeeId: string
  employeeName: string
  message: string
  messageFR: string
  messageEN: string
  triggeredAt: string    // ISO date
  dueDate?: string       // Date limite d'action
  acknowledged: boolean
}

export interface PayrollRules {
  // Paliers vacances — configurables par entreprise
  vacationTiers: VacationTier[]

  // Minimums légaux par province
  legalMinimums: Record<string, number>  // ex: { AB: 6, QC: 6, ON: 4 }

  // Alertes — combien de jours avant d'avertir
  alertDaysBeforeAnniversary: number     // Ex: 30 jours avant 2 ans
  alertDaysBeforeRenewal: number         // Ex: 60 jours avant renouvellement

  // Garde-fous
  enforceMinimums: boolean               // Empêcher taux sous légal
  autoUpgradeTiers: boolean              // Upgrade auto quand seuil atteint
}

interface PayrollRulesStore {
  rules: PayrollRules
  auditLog: PayrollAuditEntry[]
  alerts: HRAlert[]

  // Rules
  setRules: (updates: Partial<PayrollRules>) => void
  updateVacationTier: (id: string, updates: Partial<VacationTier>) => void
  addVacationTier: (tier: Omit<VacationTier, 'id'>) => void
  removeVacationTier: (id: string) => void

  // Audit
  addAuditEntry: (entry: Omit<PayrollAuditEntry, 'id' | 'timestamp'>) => void

  // Alertes
  addAlert: (alert: Omit<HRAlert, 'id' | 'triggeredAt' | 'acknowledged'>) => void
  acknowledgeAlert: (alertId: string) => void
  dismissAllAlerts: (employeeId: string) => void
  getActiveAlerts: () => HRAlert[]
  getCriticalAlerts: () => HRAlert[]
}

// ─────────────────────────────────────────────────────────────────────────────
// 🏗️ DÉFAUTS — Alberta Construction
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_VACATION_TIERS: VacationTier[] = [
  {
    id: 'tier-0',
    minYears: 0,
    maxYears: 2,
    rate: 6,
    label: '0-2 ans → 6%',
    labelEN: '0-2 years → 6%',
  },
  {
    id: 'tier-1',
    minYears: 2,
    maxYears: 5,
    rate: 8,
    label: '2-5 ans → 8%',
    labelEN: '2-5 years → 8%',
  },
  {
    id: 'tier-2',
    minYears: 5,
    maxYears: Infinity,
    rate: 10,
    label: '5+ ans → 10%',
    labelEN: '5+ years → 10%',
  },
]

const DEFAULT_LEGAL_MINIMUMS: Record<string, number> = {
  AB: 6,   // Alberta — minimum construction
  BC: 6,
  ON: 4,   // Ontario — 2 semaines = 4%
  QC: 6,   // Québec — 3 semaines après 1 an
  SK: 6,
  MB: 6,
  NB: 4,
  NS: 4,
  PE: 4,
  NL: 4,
  NT: 6,
  NU: 6,
  YT: 6,
}

const DEFAULT_RULES: PayrollRules = {
  vacationTiers: DEFAULT_VACATION_TIERS,
  legalMinimums: DEFAULT_LEGAL_MINIMUMS,
  alertDaysBeforeAnniversary: 30,
  alertDaysBeforeRenewal: 60,
  enforceMinimums: true,
  autoUpgradeTiers: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// 🏪 STORE
// ─────────────────────────────────────────────────────────────────────────────

export const usePayrollRulesStore = create<PayrollRulesStore>()(
  persist(
    (set, get) => ({
      rules: DEFAULT_RULES,
      auditLog: [],
      alerts: [],

      // ── Rules ──────────────────────────────────────────────────────────────
      setRules: (updates) =>
        set(state => ({ rules: { ...state.rules, ...updates } })),

      updateVacationTier: (id, updates) =>
        set(state => ({
          rules: {
            ...state.rules,
            vacationTiers: state.rules.vacationTiers.map(t =>
              t.id === id ? { ...t, ...updates } : t
            ),
          },
        })),

      addVacationTier: (tier) =>
        set(state => ({
          rules: {
            ...state.rules,
            vacationTiers: [
              ...state.rules.vacationTiers,
              { ...tier, id: `tier-${Date.now()}` },
            ],
          },
        })),

      removeVacationTier: (id) =>
        set(state => ({
          rules: {
            ...state.rules,
            vacationTiers: state.rules.vacationTiers.filter(t => t.id !== id),
          },
        })),

      // ── Audit ──────────────────────────────────────────────────────────────
      addAuditEntry: (entry) =>
        set(state => ({
          auditLog: [
            {
              ...entry,
              id: `audit-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
            ...state.auditLog,
          ].slice(0, 500), // Garde les 500 dernières entrées
        })),

      // ── Alertes ────────────────────────────────────────────────────────────
      addAlert: (alert) => {
        // Évite les doublons — même employé + même type
        const existing = get().alerts.find(
          a => a.employeeId === alert.employeeId &&
               a.type === alert.type &&
               !a.acknowledged
        )
        if (existing) return

        set(state => ({
          alerts: [
            {
              ...alert,
              id: `alert-${Date.now()}`,
              triggeredAt: new Date().toISOString(),
              acknowledged: false,
            },
            ...state.alerts,
          ],
        }))
      },

      acknowledgeAlert: (alertId) =>
        set(state => ({
          alerts: state.alerts.map(a =>
            a.id === alertId ? { ...a, acknowledged: true } : a
          ),
        })),

      dismissAllAlerts: (employeeId) =>
        set(state => ({
          alerts: state.alerts.map(a =>
            a.employeeId === employeeId ? { ...a, acknowledged: true } : a
          ),
        })),

      getActiveAlerts: () =>
        get().alerts.filter(a => !a.acknowledged),

      getCriticalAlerts: () =>
        get().alerts.filter(a => !a.acknowledged && a.severity === 'critical'),
    }),
    { name: 'payroll-rules-store-v1' }
  )
)
