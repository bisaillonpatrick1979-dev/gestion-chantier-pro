'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  province: string
  postalCode: string
  notes: string
  createdAt: string
}

interface ClientStore {
  clients: Client[]
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Client
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (data) => {
        const newClient: Client = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        set(state => ({ clients: [...state.clients, newClient] }))
        return newClient
      },

      updateClient: (id, updates) => set(state => ({
        clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      deleteClient: (id) => set(state => ({
        clients: state.clients.filter(c => c.id !== id)
      })),
    }),
    { name: 'client-store-v1' }
  )
)

