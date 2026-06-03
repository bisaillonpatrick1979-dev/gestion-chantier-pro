'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AssignmentStatus = 'assigned' | 'in_progress' | 'partial' | 'blocked' | 'completed' | 'revisit'
export type ChecklistStatus = 'todo' | 'done' | 'blocked' | 'not_applicable'

export type AssignmentChecklistItem = {
  id: string
  title: string
  status: ChecklistStatus
  note?: string
  missingMaterial?: string
  completedAt?: string
}

export type Assignment = {
  id: string
  workerId: string
  workerName: string
  clientName: string
  projectName: string
  address: string
  serviceType: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduledDate: string
  instructions?: string
  checklist: AssignmentChecklistItem[]
  status: AssignmentStatus
  completionNote?: string
  createdAt: string
  updatedAt: string
}

type AssignmentStore = {
  assignments: Assignment[]
  addAssignment: (data: Omit<Assignment, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void
  updateAssignment: (id: string, patch: Partial<Assignment>) => void
  setChecklistStatus: (assignmentId: string, itemId: string, status: ChecklistStatus, note?: string, missingMaterial?: string) => void
  finishAssignment: (id: string) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const now = () => new Date().toISOString()

function computeStatus(checklist: AssignmentChecklistItem[]): AssignmentStatus {
  if (checklist.length === 0) return 'completed'
  const done = checklist.filter(i => i.status === 'done' || i.status === 'not_applicable').length
  const blocked = checklist.some(i => i.status === 'blocked')
  if (done === checklist.length) return 'completed'
  if (blocked) return 'blocked'
  if (done > 0) return 'partial'
  return 'assigned'
}

export const useAssignmentStore = create<AssignmentStore>()(
  persist(
    (set, get) => ({
      assignments: [],
      addAssignment: data => set({ assignments: [{ id: uid(), status: 'assigned', createdAt: now(), updatedAt: now(), ...data }, ...get().assignments] }),
      updateAssignment: (id, patch) => set({ assignments: get().assignments.map(a => a.id === id ? { ...a, ...patch, updatedAt: now() } : a) }),
      setChecklistStatus: (assignmentId, itemId, status, note, missingMaterial) => set({ assignments: get().assignments.map(a => {
        if (a.id !== assignmentId) return a
        const checklist = a.checklist.map(item => item.id === itemId ? { ...item, status, note, missingMaterial, completedAt: status === 'done' ? now() : item.completedAt } : item)
        return { ...a, checklist, status: computeStatus(checklist), updatedAt: now() }
      }) }),
      finishAssignment: id => set({ assignments: get().assignments.map(a => a.id === id ? { ...a, status: computeStatus(a.checklist), completionNote: a.checklist.every(i => i.status === 'done' || i.status === 'not_applicable') ? 'Final complet' : 'Partiel / à revisiter', updatedAt: now() } : a) }),
    }),
    { name: 'assignment-store-v1' }
  )
)

export const newChecklistItem = (title: string): AssignmentChecklistItem => ({ id: uid(), title, status: 'todo' })
