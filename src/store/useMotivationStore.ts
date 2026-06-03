'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MotivationScope = 'company' | 'team' | 'individual'
export type MotivationMetric = 'revenue' | 'hours' | 'jobs_completed' | 'checklist_done' | 'safety_days' | 'custom'
export type RewardType = 'lunch' | 'draw' | 'bonus' | 'gift' | 'trip' | 'custom'
export type GoalStatus = 'active' | 'paused' | 'achieved' | 'cancelled'

export type MotivationTeam = {
  id: string
  name: string
  memberIds: string[]
  color?: string
  active: boolean
  createdAt: string
}

export type MotivationGoal = {
  id: string
  title: string
  scope: MotivationScope
  metric: MotivationMetric
  target: number
  current: number
  startDate: string
  endDate?: string
  teamId?: string
  employeeId?: string
  rewardType: RewardType
  rewardTitle: string
  rewardDescription?: string
  status: GoalStatus
  createdAt: string
  updatedAt: string
}

type MotivationStore = {
  teams: MotivationTeam[]
  goals: MotivationGoal[]
  addTeam: (data: Omit<MotivationTeam, 'id' | 'active' | 'createdAt'>) => void
  updateTeam: (id: string, patch: Partial<MotivationTeam>) => void
  addGoal: (data: Omit<MotivationGoal, 'id' | 'current' | 'status' | 'createdAt' | 'updatedAt'>) => void
  updateGoal: (id: string, patch: Partial<MotivationGoal>) => void
  addProgress: (id: string, amount: number) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const now = () => new Date().toISOString()
const today = () => new Date().toISOString().slice(0, 10)

export const useMotivationStore = create<MotivationStore>()(
  persist(
    (set, get) => ({
      teams: [],
      goals: [],
      addTeam: data => set({ teams: [{ id: uid(), active: true, createdAt: now(), ...data }, ...get().teams] }),
      updateTeam: (id, patch) => set({ teams: get().teams.map(t => t.id === id ? { ...t, ...patch } : t) }),
      addGoal: data => set({ goals: [{ id: uid(), current: 0, status: 'active', createdAt: now(), updatedAt: now(), ...data }, ...get().goals] }),
      updateGoal: (id, patch) => set({ goals: get().goals.map(g => g.id === id ? { ...g, ...patch, updatedAt: now() } : g) }),
      addProgress: (id, amount) => set({ goals: get().goals.map(g => {
        if (g.id !== id) return g
        const current = Math.max(0, g.current + amount)
        return { ...g, current, status: current >= g.target ? 'achieved' : g.status, updatedAt: now() }
      }) }),
    }),
    { name: 'motivation-store-v1' }
  )
)

export const defaultMotivationGoal = (): Omit<MotivationGoal, 'id' | 'current' | 'status' | 'createdAt' | 'updatedAt'> => ({
  title: 'Objectif compagnie du mois',
  scope: 'company',
  metric: 'revenue',
  target: 50000,
  startDate: today(),
  rewardType: 'lunch',
  rewardTitle: 'Dîner payé pour l’équipe',
  rewardDescription: 'Récompense si l’objectif est atteint.',
})
