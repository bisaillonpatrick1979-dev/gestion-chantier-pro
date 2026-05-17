// src/store/useCompanyStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompanyInfo {
  // Identité
  name: string;
  ownerName: string;
  tagline: string;
  logoUrl: string;

  // Coordonnées
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;

  // Légal Alberta
  gstNumber: string;
  wcbNumber: string;
  businessNumber: string;

  // Paiement
  etransferEmail: string;
  bankName: string;
  bankTransit: string;
  bankAccount: string;

  // Facturation
  defaultDepositPercent: number;
  defaultPaymentTermsDays: number;
  defaultNotes: string;

  // Numérotation documents
  invoicePrefix: string;
  quotePrefix: string;
  contractPrefix: string;
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
  nextContractNumber: number;
}

interface CompanyStore {
  company: CompanyInfo;
  updateCompany: (data: Partial<CompanyInfo>) => void;
  resetNumbering: () => void;
  getNextInvoiceNumber: () => string;
  getNextQuoteNumber: () => string;
  getNextContractNumber: () => string;
}

const defaultCompany: CompanyInfo = {
  name: "Hailite Xteriors",
  ownerName: "Patrick Bisaillon",
  tagline: "Exteriors done right.",
  logoUrl: "",

  address: "",
  city: "",
  province: "AB",
  postalCode: "",
  phone: "",
  email: "",
  website: "",

  gstNumber: "",
  wcbNumber: "",
  businessNumber: "",

  etransferEmail: "",
  bankName: "",
  bankTransit: "",
  bankAccount: "",

  defaultDepositPercent: 30,
  defaultPaymentTermsDays: 30,
  defaultNotes: "",

  invoicePrefix: "FAC",
  quotePrefix: "DEV",
  contractPrefix: "CTR",
  nextInvoiceNumber: 1001,
  nextQuoteNumber: 1001,
  nextContractNumber: 1001,
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      company: defaultCompany,

      updateCompany: (data) =>
        set((state) => ({
          company: { ...state.company, ...data },
        })),

      resetNumbering: () =>
        set((state) => ({
          company: {
            ...state.company,
            nextInvoiceNumber: 1,
            nextQuoteNumber: 1,
            nextContractNumber: 1,
          },
        })),

      getNextInvoiceNumber: () => {
        const { company } = get();
        const num = `${company.invoicePrefix}-${String(company.nextInvoiceNumber).padStart(3, "0")}`;
        set((state) => ({
          company: {
            ...state.company,
            nextInvoiceNumber: state.company.nextInvoiceNumber + 1,
          },
        }));
        return num;
      },

      getNextQuoteNumber: () => {
        const { company } = get();
        const num = `${company.quotePrefix}-${String(company.nextQuoteNumber).padStart(3, "0")}`;
        set((state) => ({
          company: {
            ...state.company,
            nextQuoteNumber: state.company.nextQuoteNumber + 1,
          },
        }));
        return num;
      },

      getNextContractNumber: () => {
        const { company } = get();
        const num = `${company.contractPrefix}-${String(company.nextContractNumber).padStart(3, "0")}`;
        set((state) => ({
          company: {
            ...state.company,
            nextContractNumber: state.company.nextContractNumber + 1,
          },
        }));
        return num;
      },
    }),
    { name: "company-store-v1" }
  )
);
