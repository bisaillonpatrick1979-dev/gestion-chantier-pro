'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Unit = 'pi²' | 'pi lin.' | 'boîte' | 'rouleau' | 'feuille' | 'tube' | 'unité' | 'heure'
export type Category = 'toiture' | 'siding' | 'fixations' | 'etancheite' | 'structure' | 'maindoeuvre'

export interface Material {
  id: string
  category: Category
  name: string
  nameen?: string
  emoji?: string
  unit?: Unit
  prixClient?: number        // 🏷️ Prix de vente au client
  prixFournisseur?: number   // 🏭 Mon coût chez le fournisseur
  description?: string
  // Champs legacy – compatibilité avec les documents existants
  price?: number
  priceMin?: number
  priceMax?: number
  descriptionen?: string
}

interface CatalogueStore {
  materials: Material[]
  addMaterial: (m: Omit<Material, 'id'>) => void
  updateMaterial: (id: string, updates: Partial<Material>) => void
  deleteMaterial: (id: string) => void
}

// Noms seulement — prix et détails à remplir par l'utilisateur
const defaultMaterials: Material[] = [
  { id: '1',  category: 'toiture',     emoji: '🏠', name: 'Bardeau asphalte 3 tabs'    },
  { id: '2',  category: 'toiture',     emoji: '🏠', name: 'Bardeau architectural'       },
  { id: '3',  category: 'toiture',     emoji: '🔩', name: 'Tôle acier prépeint'         },
  { id: '4',  category: 'toiture',     emoji: '🌊', name: 'Membrane élastomère'         },
  { id: '5',  category: 'toiture',     emoji: '📄', name: 'Sous-couche synthétique'     },
  { id: '6',  category: 'toiture',     emoji: '❄️', name: 'Ice & Water Shield'          },
  { id: '7',  category: 'siding',      emoji: '🏡', name: 'Siding vinyle'               },
  { id: '8',  category: 'siding',      emoji: '🏡', name: 'Siding fibrociment (Hardie)' },
  { id: '9',  category: 'fixations',   emoji: '🔨', name: 'Clous galvanisés'            },
  { id: '10', category: 'fixations',   emoji: '🔩', name: 'Vis à toiture'               },
  { id: '11', category: 'fixations',   emoji: '🔧', name: 'Calfeutrant acrylique'       },
  { id: '12', category: 'etancheite',  emoji: '💧', name: 'Solin aluminium'             },
  { id: '13', category: 'etancheite',  emoji: '📏', name: "Ruban d'étanchéité"          },
  { id: '14', category: 'etancheite',  emoji: '🛡️', name: 'Pare-vapeur 6 mil'           },
  { id: '15', category: 'structure',   emoji: '🪵', name: 'OSB 7/16'                    },
  { id: '16', category: 'structure',   emoji: '🪵', name: 'Contreplaqué 1/2"'           },
  { id: '17', category: 'maindoeuvre', emoji: '👷', name: 'Installation bardeau'        },
  { id: '18', category: 'maindoeuvre', emoji: '👷', name: 'Installation tôle'           },
  { id: '19', category: 'maindoeuvre', emoji: '👷', name: 'Installation siding'         },
  { id: '20', category: 'maindoeuvre', emoji: '⏱️', name: 'Heure technicien'            },
]

export const useCatalogueStore = create<CatalogueStore>()(
  persist(
    (set) => ({
      materials: defaultMaterials,
      addMaterial: (m) => set(s => ({
        materials: [...s.materials, { ...m, id: Date.now().toString() }]
      })),
      updateMaterial: (id, updates) => set(s => ({
        materials: s.materials.map(m => m.id === id ? { ...m, ...updates } : m)
      })),
      deleteMaterial: (id) => set(s => ({
        materials: s.materials.filter(m => m.id !== id)
      })),
    }),
    { name: 'catalogue-store-v1' }
  )
)
