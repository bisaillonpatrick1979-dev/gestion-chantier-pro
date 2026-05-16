'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Unit = 'pi²' | 'pi lin.' | 'boîte' | 'rouleau' | 'feuille' | 'tube' | 'unité' | 'heure'
export type Category = 'toiture' | 'siding' | 'fixations' | 'etancheite' | 'structure' | 'maindoeuvre'

export interface Material {
  id: string
  category: Category
  name: string
  nameen: string
  emoji: string
  unit: Unit
  priceMin: number
  priceMax: number
  price: number
  description: string
  descriptionen: string
}

interface CatalogueStore {
  materials: Material[]
  addMaterial: (m: Omit<Material, 'id'>) => void
  updateMaterial: (id: string, updates: Partial<Material>) => void
  deleteMaterial: (id: string) => void
}

const defaultMaterials: Material[] = [
  { id: '1',  category: 'toiture',     name: 'Bardeau asphalte 3 tabs',    nameen: 'Asphalt shingle 3 tabs',      emoji: '🏠', unit: 'pi²',     priceMin: 5,   priceMax: 12,  price: 7,    description: 'Le plus populaire, durée de vie 20-30 ans',       descriptionen: 'Most popular, lifespan 20-30 years' },
  { id: '2',  category: 'toiture',     name: 'Bardeau architectural',       nameen: 'Architectural shingle',       emoji: '🏠', unit: 'pi²',     priceMin: 8,   priceMax: 15,  price: 11,   description: 'Bardeau épais, aspect 3D, durée de vie 30+ ans',  descriptionen: 'Thick shingle, 3D look, 30+ years' },
  { id: '3',  category: 'toiture',     name: 'Tôle acier prépeint',         nameen: 'Prepainted steel roofing',    emoji: '🔩', unit: 'pi²',     priceMin: 13,  priceMax: 25,  price: 18,   description: 'Durée de vie 50+ ans, très résistant',            descriptionen: 'Lifespan 50+ years, very resistant' },
  { id: '4',  category: 'toiture',     name: 'Membrane élastomère',         nameen: 'Elastomeric membrane',        emoji: '🌊', unit: 'pi²',     priceMin: 8,   priceMax: 14,  price: 10,   description: 'Idéal pour toit plat, très étanche',              descriptionen: 'Ideal for flat roof, very waterproof' },
  { id: '5',  category: 'toiture',     name: 'Sous-couche synthétique',     nameen: 'Synthetic underlayment',      emoji: '📄', unit: 'rouleau', priceMin: 80,  priceMax: 150, price: 110,  description: 'Protection sous le revêtement',                   descriptionen: 'Protection under cladding' },
  { id: '6',  category: 'toiture',     name: 'Ice & Water Shield',          nameen: 'Ice & Water Shield',          emoji: '❄️', unit: 'rouleau', priceMin: 120, priceMax: 200, price: 155,  description: 'Protection contre les dégâts de glace',           descriptionen: 'Ice damage protection' },
  { id: '7',  category: 'siding',      name: 'Siding vinyle',               nameen: 'Vinyl siding',                emoji: '🏡', unit: 'pi²',     priceMin: 2,   priceMax: 5,   price: 3.5,  description: 'Économique, facile entretien',                     descriptionen: 'Affordable, easy maintenance' },
  { id: '8',  category: 'siding',      name: 'Siding fibrociment (Hardie)', nameen: 'Fiber cement siding (Hardie)',emoji: '🏡', unit: 'pi²',     priceMin: 6,   priceMax: 12,  price: 9,    description: 'Résistant au feu et aux intempéries, 50+ ans',    descriptionen: 'Fire and weather resistant, 50+ years' },
  { id: '9',  category: 'fixations',   name: 'Clous galvanisés',            nameen: 'Galvanized nails',            emoji: '🔨', unit: 'boîte',   priceMin: 15,  priceMax: 25,  price: 20,   description: 'Résistants à la rouille, boîte de 1 kg',          descriptionen: 'Rust resistant, 1 kg box' },
  { id: '10', category: 'fixations',   name: 'Vis à toiture',               nameen: 'Roofing screws',              emoji: '🔩', unit: 'boîte',   priceMin: 20,  priceMax: 35,  price: 27,   description: 'Avec rondelle EPDM, boîte de 250',                descriptionen: 'With EPDM washer, box of 250' },
  { id: '11', category: 'fixations',   name: 'Calfeutrant acrylique',       nameen: 'Acrylic caulk',               emoji: '🔧', unit: 'tube',    priceMin: 8,   priceMax: 15,  price: 11,   description: 'Scellant flexible, peinturable',                   descriptionen: 'Flexible sealant, paintable' },
  { id: '12', category: 'etancheite',  name: 'Solin aluminium',             nameen: 'Aluminum flashing',           emoji: '💧', unit: 'pi lin.', priceMin: 2,   priceMax: 4,   price: 3,    description: 'Protection aux jonctions',                        descriptionen: 'Junction protection' },
  { id: '13', category: 'etancheite',  name: 'Ruban d\'étanchéité',         nameen: 'Waterproof tape',             emoji: '📏', unit: 'rouleau', priceMin: 25,  priceMax: 45,  price: 35,   description: 'Joints et raccords, auto-adhésif',                descriptionen: 'Self-adhesive, joints and connections' },
  { id: '14', category: 'etancheite',  name: 'Pare-vapeur 6 mil',           nameen: '6 mil vapor barrier',         emoji: '🛡️', unit: 'rouleau', priceMin: 60,  priceMax: 100, price: 80,   description: 'Contrôle de l\'humidité, rouleau 10x100 pi',      descriptionen: 'Moisture control, 10x100 ft roll' },
  { id: '15', category: 'structure',   name: 'OSB 7/16',                    nameen: 'OSB 7/16',                    emoji: '🪵', unit: 'feuille', priceMin: 25,  priceMax: 40,  price: 32,   description: 'Panneau de structure, 4x8 pi',                    descriptionen: 'Structural panel, 4x8 ft' },
  { id: '16', category: 'structure',   name: 'Contreplaqué 1/2"',           nameen: 'Plywood 1/2"',                emoji: '🪵', unit: 'feuille', priceMin: 30,  priceMax: 50,  price: 40,   description: 'Feuille de bois multiplis, 4x8 pi',               descriptionen: 'Multilayer wood sheet, 4x8 ft' },
  { id: '17', category: 'maindoeuvre', name: 'Installation bardeau',        nameen: 'Shingle installation',        emoji: '👷', unit: 'pi²',     priceMin: 2,   priceMax: 4,   price: 3,    description: 'Main d\'oeuvre installation bardeau asphalte',     descriptionen: 'Labor for asphalt shingle installation' },
  { id: '18', category: 'maindoeuvre', name: 'Installation tôle',           nameen: 'Metal roofing installation',  emoji: '👷', unit: 'pi²',     priceMin: 4,   priceMax: 8,   price: 6,    description: 'Main d\'oeuvre toiture métallique',               descriptionen: 'Labor for metal roofing' },
  { id: '19', category: 'maindoeuvre', name: 'Installation siding',         nameen: 'Siding installation',         emoji: '👷', unit: 'pi²',     priceMin: 3,   priceMax: 6,   price: 4.5,  description: 'Main d\'oeuvre revêtement extérieur',             descriptionen: 'Labor for exterior cladding' },
  { id: '20', category: 'maindoeuvre', name: 'Heure technicien',            nameen: 'Technician hour',             emoji: '⏱️', unit: 'heure',   priceMin: 45,  priceMax: 95,  price: 65,   description: 'Taux horaire technicien qualifié',                descriptionen: 'Qualified technician hourly rate' },
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

