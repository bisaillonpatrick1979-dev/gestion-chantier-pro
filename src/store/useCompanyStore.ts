// src/store/useCompanyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyInfo {
  // Infos de base
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;

  // Logo — deux noms supportés pour compatibilité
  logo: string;
  logoUrl: string;

  // Numéros légaux
  gstNumber: string;
  wcbNumber: string;
  licenseNumber: string;

  // Taxes
  gstRate: number;
  defaultGstRate: number;

  // Paiement
  bankInfo: string;
  paymentTerms: string;
  eTransferEmail: string;
  defaultDepositPercent: number;

  // Notes documents
  defaultNotes: string;
  invoiceNotes: string;
  defaultTerms: string;

  // Numéros séquentiels
  invoiceNextNumber: number;
  quoteNextNumber: number;
  contractNextNumber: number;
}

export interface CompanyStore {
  company: CompanyInfo;
  updateCompany: (data: Partial<CompanyInfo>) => void;
  setCompany: (data: Partial<CompanyInfo>) => void;
  resetCompany: () => void;
}

const defaultCompany: CompanyInfo = {
  name: 'Hailite Xteriors',
  address: '',
  city: '',
  province: 'AB',
  postalCode: '',
  phone: '',
  email: '',
  website: '',

  logo: '',
  logoUrl: '',

  gstNumber: '',
  wcbNumber: '',
  licenseNumber: '',

  gstRate: 5,
  defaultGstRate: 5,

  bankInfo: '',
  paymentTerms: 'Net 30',
  eTransferEmail: '',
  defaultDepositPercent: 30,

  defaultNotes: '',
  invoiceNotes: '',
  defaultTerms: 'Paiement dû dans les 30 jours suivant la réception de la facture.',

  invoiceNextNumber: 1001,
  quoteNextNumber: 1001,
  contractNextNumber: 1001,
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: defaultCompany,

      updateCompany: (data: Partial<CompanyInfo>) =>
        set((state) => ({
          company: { ...state.company, ...data },
        })),

      // Alias pour compatibilité avec documents/[id]/page.tsx existant
      setCompany: (data: Partial<CompanyInfo>) =>
        set((state) => ({
          company: { ...state.company, ...data },
        })),

      resetCompany: () =>
        set({ company: defaultCompany }),
    }),
    {
      name: 'company-store-v1',
    }
  )
);

