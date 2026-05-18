// src/store/useCompanyStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CompanyInfo {
  name: string
  ownerName: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
  email: string
  website: string
  gstNumber: string
  wcbNumber: string
  bnNumber: string
  logoUrl: string
  // Paiement
  bankName: string
  bankTransit: string
  bankInstitution: string
  bankAccount: string
  etransferEmail: string
  // Notes / conditions par défaut
  defaultNotes: string
  defaultPaymentTerms: string
  defaultDuedays: number
}

interface CompanyStore {
  company: CompanyInfo
  setCompany: (info: Partial<CompanyInfo>) => void
  resetCompany: () => void
}

const defaultCompany: CompanyInfo = {
  name: 'Hailite Xteriors',
  ownerName: 'Patrick Bisaillon',
  address: '',
  city: '',
  province: 'AB',
  postalCode: '',
  country: 'CA',
  phone: '',
  email: '',
  website: '',
  gstNumber: '',
  wcbNumber: '',
  bnNumber: '',
  logoUrl: '',
  bankName: '',
  bankTransit: '',
  bankInstitution: '',
  bankAccount: '',
  etransferEmail: '',
  defaultNotes: '',
  defaultPaymentTerms: 'Net 30',
  defaultDuedays: 30,
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: defaultCompany,
      setCompany: (info) =>
        set((state) => ({ company: { ...state.company, ...info } })),
      resetCompany: () => set({ company: defaultCompany }),
    }),
    { name: 'company-store-v1' }
  )
)
