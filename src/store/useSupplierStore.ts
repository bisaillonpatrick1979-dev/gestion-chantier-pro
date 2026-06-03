'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SupplierCategory = 'materials' | 'tools' | 'safety' | 'rental' | 'fuel' | 'office' | 'other'

export type Supplier = {
  id: string
  name: string
  category: SupplierCategory
  contactName?: string
  phone?: string
  email?: string
  address?: string
  accountNumber?: string
  notes?: string
  active: boolean
  createdAt: string
}

type SupplierStore = {
  suppliers: Supplier[]
  addSupplier: (data: Omit<Supplier, 'id' | 'active' | 'createdAt'>) => void
  updateSupplier: (id: string, patch: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const now = () => new Date().toISOString()

export const useSupplierStore = create<SupplierStore>()(
  persist(
    (set, get) => ({
      suppliers: [],
      addSupplier: data => set({ suppliers: [{ id: uid(), active: true, createdAt: now(), ...data }, ...get().suppliers] }),
      updateSupplier: (id, patch) => set({ suppliers: get().suppliers.map(s => s.id === id ? { ...s, ...patch } : s) }),
      deleteSupplier: id => set({ suppliers: get().suppliers.map(s => s.id === id ? { ...s, active: false } : s) }),
    }),
    { name: 'supplier-store-v1' }
  )
)
