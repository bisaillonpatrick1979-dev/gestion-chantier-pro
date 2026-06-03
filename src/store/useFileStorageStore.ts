'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FileStorageProvider = 'manual' | 'google_drive' | 'apple_icloud' | 'samsung_cloud' | 'supabase_storage' | 'one_drive' | 'dropbox' | 'custom'
export type FileKind = 'photo' | 'receipt' | 'invoice_pdf' | 'contract_pdf' | 'quote_pdf' | 'signature' | 'other'

export type StoredFileReference = {
  id: string
  kind: FileKind
  fileName: string
  provider: FileStorageProvider
  externalUrl?: string
  externalPath?: string
  mimeType?: string
  sizeBytes?: number
  linkedClientId?: string
  linkedProjectId?: string
  linkedDocumentId?: string
  linkedAssignmentId?: string
  notes?: string
  createdAt: string
}

type FileStorageSettings = {
  provider: FileStorageProvider
  customProviderName?: string
  rootFolderName: string
  savePhotos: boolean
  saveReceipts: boolean
  saveGeneratedPdfs: boolean
  compressPhotos: boolean
  maxPhotoWidth: number
  databasePolicy: 'metadata_only'
}

type FileStorageStore = {
  settings: FileStorageSettings
  files: StoredFileReference[]
  updateSettings: (patch: Partial<FileStorageSettings>) => void
  addFileReference: (data: Omit<StoredFileReference, 'id' | 'createdAt'>) => void
  removeFileReference: (id: string) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const now = () => new Date().toISOString()

export const defaultFileStorageSettings: FileStorageSettings = {
  provider: 'manual',
  rootFolderName: 'Gestion Chantier Pro',
  savePhotos: true,
  saveReceipts: true,
  saveGeneratedPdfs: true,
  compressPhotos: true,
  maxPhotoWidth: 1600,
  databasePolicy: 'metadata_only',
}

export const useFileStorageStore = create<FileStorageStore>()(
  persist(
    (set, get) => ({
      settings: defaultFileStorageSettings,
      files: [],
      updateSettings: patch => set({ settings: { ...get().settings, ...patch, databasePolicy: 'metadata_only' } }),
      addFileReference: data => set({ files: [{ id: uid(), createdAt: now(), ...data }, ...get().files] }),
      removeFileReference: id => set({ files: get().files.filter(f => f.id !== id) }),
    }),
    { name: 'file-storage-store-v1' }
  )
)

export function fileStorageRuleText(provider: FileStorageProvider) {
  const providerName: Record<FileStorageProvider, string> = {
    manual: 'Cloud manuel / partage appareil',
    google_drive: 'Google Drive',
    apple_icloud: 'Apple iCloud',
    samsung_cloud: 'Samsung Cloud',
    supabase_storage: 'Supabase Storage',
    one_drive: 'OneDrive',
    dropbox: 'Dropbox',
    custom: 'Cloud personnalisé',
  }
  return `Fichiers lourds vers ${providerName[provider]}. Supabase Database garde seulement les métadonnées et liens.`
}
