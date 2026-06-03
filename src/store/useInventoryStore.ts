'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAccountingStore } from './useAccountingStore'

export type InventoryUnit = 'pcs' | 'box' | 'bundle' | 'roll' | 'pail' | 'tube' | 'sqft' | 'linear_ft'
export type InventoryCategory = 'siding' | 'soffit' | 'fascia' | 'roofing' | 'fasteners' | 'sealants' | 'tools' | 'safety' | 'other'
export type InventoryMovementType = 'in' | 'out' | 'adjust' | 'reserved' | 'returned'

export type InventoryItem = {
  id: string
  sku?: string
  name: string
  category: InventoryCategory
  unit: InventoryUnit
  location: string
  supplier?: string
  quantity: number
  reserved: number
  minQuantity: number
  reorderQuantity: number
  unitCost: number
  notes?: string
  updatedAt: string
}

export type InventoryMovement = {
  id: string
  itemId: string
  itemName: string
  type: InventoryMovementType
  quantity: number
  unitCost?: number
  totalCost?: number
  jobName?: string
  employeeName?: string
  note?: string
  createdAt: string
}

type InventoryStore = {
  items: InventoryItem[]
  movements: InventoryMovement[]
  addItem: (data: Omit<InventoryItem, 'id' | 'reserved' | 'updatedAt'>) => void
  updateItem: (id: string, patch: Partial<InventoryItem>) => void
  deleteItem: (id: string) => void
  moveStock: (data: { itemId: string; type: InventoryMovementType; quantity: number; jobName?: string; employeeName?: string; note?: string }) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const now = () => new Date().toISOString()
const today = () => new Date().toISOString().slice(0, 10)

function expenseCategoryForInventory(category: InventoryCategory): 'materials' | 'tools' | 'other' {
  if (category === 'tools') return 'tools'
  if (category === 'safety' || category === 'other') return 'other'
  return 'materials'
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [],
      movements: [],
      addItem: data => set({ items: [{ id: uid(), reserved: 0, updatedAt: now(), ...data }, ...get().items] }),
      updateItem: (id, patch) => set({ items: get().items.map(i => i.id === id ? { ...i, ...patch, updatedAt: now() } : i) }),
      deleteItem: id => set({ items: get().items.filter(i => i.id !== id), movements: get().movements.filter(m => m.itemId !== id) }),
      moveStock: data => {
        const item = get().items.find(i => i.id === data.itemId)
        if (!item || !data.quantity || data.quantity <= 0) return
        let quantity = item.quantity
        let reserved = item.reserved
        if (data.type === 'in' || data.type === 'returned') quantity += data.quantity
        if (data.type === 'out') quantity = Math.max(0, quantity - data.quantity)
        if (data.type === 'reserved') reserved += data.quantity
        if (data.type === 'adjust') quantity = data.quantity

        const unitCost = item.unitCost || 0
        const totalCost = Math.round(data.quantity * unitCost * 100) / 100
        const movementId = uid()
        const movement: InventoryMovement = {
          id: movementId,
          itemId: item.id,
          itemName: item.name,
          type: data.type,
          quantity: data.quantity,
          unitCost,
          totalCost,
          jobName: data.jobName,
          employeeName: data.employeeName,
          note: data.note,
          createdAt: now(),
        }

        set({
          items: get().items.map(i => i.id === item.id ? { ...i, quantity, reserved, updatedAt: now() } : i),
          movements: [movement, ...get().movements],
        })

        if (data.type === 'out' && totalCost > 0) {
          useAccountingStore.getState().addExpense({
            vendor: item.supplier || 'Inventaire entrepôt',
            category: expenseCategoryForInventory(item.category),
            projectName: data.jobName || 'Sortie inventaire sans projet',
            amount: totalCost,
            taxAmount: 0,
            date: today(),
            status: 'paid',
            note: `Sortie inventaire: ${data.quantity} ${item.unit} × ${item.name}. Mouvement ${movementId}.${data.note ? ` Note: ${data.note}` : ''}`,
          })
        }
      },
    }),
    { name: 'inventory-store-v1' }
  )
)
