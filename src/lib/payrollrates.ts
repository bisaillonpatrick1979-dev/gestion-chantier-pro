// src/lib/payrollRates.ts
// ⚠️ MISE À JOUR ANNUELLE REQUISE — 1er janvier de chaque année
// Dernière mise à jour : 1er janvier 2026
// Prochaine vérification : 1er janvier 2027

export const PAYROLL_YEAR = 2026
export const PAYROLL_LAST_UPDATED = '2026-01-01'
export const PAYROLL_NEXT_UPDATE = '2027-01-01'

// ─────────────────────────────────────────────────────────────────────────────
// 🇨🇦 CANADA — FÉDÉRAL 2026
// ─────────────────────────────────────────────────────────────────────────────

export const CANADA_FEDERAL = {
  // RPC / CPP
  cpp: {
    employeeRate: 0.0595,       // 5.95%
    employerRate: 0.0595,       // 5.95% (employeur = même taux)
    maxInsurableEarnings: 74600, // YMPE 2026
    basicExemption: 3500,
    maxEmployeeContribution: 4034.10,
    maxEmployerContribution: 4034.10,
    // CPP2 (second palier depuis 2024)
    cpp2Rate: 0.04,             // 4%
    cpp2MaxEarnings: 81200,     // YAMPE 2026
    cpp2MaxContribution: 264.00,
  },

  // AE / EI
  ei: {
    employeeRate: 0.0163,       // 1.63% (1.63$ par 100$ gagné)
    employerMultiplier: 1.4,    // Employeur = 1.4× le taux employé = 2.28%
    maxInsurableEarnings: 65700,
    maxEmployeePremium: 1071.41,
    maxEmployerPremium: 1499.97,
  },

  // Impôt fédéral 2026 — paliers
  incomeTax: {
    brackets: [
      { min: 0,       max: 57375,  rate: 0.14  }, // 14%
      { min: 57375,   max: 114750, rate: 0.205 }, // 20.5%
      { min: 114750,  max: 158519, rate: 0.26  }, // 26%
      { min: 158519,  max: 220000, rate: 0.29  }, // 29%
      { min: 220000,  max: Infinity, rate: 0.33 }, // 33%
    ],
    basicPersonalAmount: 16129, // Montant personnel de base 2026
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇨🇦 CANADA — PROVINCES ET TERRITOIRES 2026
// ─────────────────────────────────────────────────────────────────────────────

export interface ProvinceTaxInfo {
  code: string
  name: string
  nameFR: string
  brackets: { min: number; max: number; rate: number }[]
  basicPersonalAmount: number
  hasProvincialCPP: boolean // Québec = QPP au lieu de CPP
  hasProvincialEI: boolean  // Québec = RQAP au lieu de EI fédéral
  notes?: string
}

export const CANADA_PROVINCES: Record<string, ProvinceTaxInfo> = {
  AB: {
    code: 'AB',
    name: 'Alberta',
    nameFR: 'Alberta',
    brackets: [
      { min: 0,       max: 148269, rate: 0.08  }, // 8%
      { min: 148269,  max: 177922, rate: 0.09  }, // 9%
      { min: 177922,  max: 237230, rate: 0.10  }, // 10%
      { min: 237230,  max: 355845, rate: 0.12  }, // 12%
      { min: 355845,  max: Infinity, rate: 0.15 }, // 15%
    ],
    basicPersonalAmount: 21003,
    hasProvincialCPP: false,
    hasProvincialEI: false,
    notes: 'GST 5% seulement — pas de taxe provinciale sur les ventes',
  },

  BC: {
    code: 'BC',
    name: 'British Columbia',
    nameFR: 'Colombie-Britannique',
    brackets: [
      { min: 0,       max: 45654,  rate: 0.0506 },
      { min: 45654,   max: 91310,  rate: 0.077  },
      { min: 91310,   max: 104835, rate: 0.105  },
      { min: 104835,  max: 127299, rate: 0.1229 },
      { min: 127299,  max: 172602, rate: 0.147  },
      { min: 172602,  max: 240716, rate: 0.168  },
      { min: 240716,  max: Infinity, rate: 0.205 },
    ],
    basicPersonalAmount: 11981,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  ON: {
    code: 'ON',
    name: 'Ontario',
    nameFR: 'Ontario',
    brackets: [
      { min: 0,       max: 51446,  rate: 0.0505 },
      { min: 51446,   max: 102894, rate: 0.0915 },
      { min: 102894,  max: 150000, rate: 0.1116 },
      { min: 150000,  max: 220000, rate: 0.1216 },
      { min: 220000,  max: Infinity, rate: 0.1316 },
    ],
    basicPersonalAmount: 11865,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  QC: {
    code: 'QC',
    name: 'Quebec',
    nameFR: 'Québec',
    brackets: [
      { min: 0,       max: 51780,  rate: 0.14  },
      { min: 51780,   max: 103545, rate: 0.19  },
      { min: 103545,  max: 126000, rate: 0.24  },
      { min: 126000,  max: Infinity, rate: 0.2575 },
    ],
    basicPersonalAmount: 17183,
    hasProvincialCPP: true,  // QPP au lieu de CPP
    hasProvincialEI: true,   // RQAP au lieu de EI fédéral
    notes: 'QPP au lieu de CPP. RQAP au lieu de EI fédéral. Cotisations différentes.',
  },

  SK: {
    code: 'SK',
    name: 'Saskatchewan',
    nameFR: 'Saskatchewan',
    brackets: [
      { min: 0,       max: 49720,  rate: 0.105 },
      { min: 49720,   max: 142058, rate: 0.125 },
      { min: 142058,  max: Infinity, rate: 0.145 },
    ],
    basicPersonalAmount: 17661,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  MB: {
    code: 'MB',
    name: 'Manitoba',
    nameFR: 'Manitoba',
    brackets: [
      { min: 0,       max: 47000,  rate: 0.108 },
      { min: 47000,   max: 100000, rate: 0.1275 },
      { min: 100000,  max: Infinity, rate: 0.174 },
    ],
    basicPersonalAmount: 15780,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  NB: {
    code: 'NB',
    name: 'New Brunswick',
    nameFR: 'Nouveau-Brunswick',
    brackets: [
      { min: 0,       max: 47715,  rate: 0.094 },
      { min: 47715,   max: 95431,  rate: 0.14  },
      { min: 95431,   max: 176756, rate: 0.16  },
      { min: 176756,  max: Infinity, rate: 0.195 },
    ],
    basicPersonalAmount: 12458,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  NS: {
    code: 'NS',
    name: 'Nova Scotia',
    nameFR: 'Nouvelle-Écosse',
    brackets: [
      { min: 0,       max: 29590,  rate: 0.0879 },
      { min: 29590,   max: 59180,  rate: 0.1495 },
      { min: 59180,   max: 93000,  rate: 0.1667 },
      { min: 93000,   max: 150000, rate: 0.175  },
      { min: 150000,  max: Infinity, rate: 0.21  },
    ],
    basicPersonalAmount: 8481,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  PE: {
    code: 'PE',
    name: 'Prince Edward Island',
    nameFR: 'Île-du-Prince-Édouard',
    brackets: [
      { min: 0,       max: 32656,  rate: 0.096 },
      { min: 32656,   max: 64313,  rate: 0.1337 },
      { min: 64313,   max: 105000, rate: 0.167 },
      { min: 105000,  max: 140000, rate: 0.18  },
      { min: 140000,  max: Infinity, rate: 0.187 },
    ],
    basicPersonalAmount: 12000,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  NL: {
    code: 'NL',
    name: 'Newfoundland and Labrador',
    nameFR: 'Terre-Neuve-et-Labrador',
    brackets: [
      { min: 0,       max: 43198,  rate: 0.087 },
      { min: 43198,   max: 86395,  rate: 0.145 },
      { min: 86395,   max: 154244, rate: 0.158 },
      { min: 154244,  max: 215943, rate: 0.178 },
      { min: 215943,  max: 275870, rate: 0.198 },
      { min: 275870,  max: 551739, rate: 0.208 },
      { min: 551739,  max: Infinity, rate: 0.218 },
    ],
    basicPersonalAmount: 10818,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  NT: {
    code: 'NT',
    name: 'Northwest Territories',
    nameFR: 'Territoires du Nord-Ouest',
    brackets: [
      { min: 0,       max: 50597,  rate: 0.059 },
      { min: 50597,   max: 101198, rate: 0.086 },
      { min: 101198,  max: 164525, rate: 0.122 },
      { min: 164525,  max: Infinity, rate: 0.1405 },
    ],
    basicPersonalAmount: 16593,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  NU: {
    code: 'NU',
    name: 'Nunavut',
    nameFR: 'Nunavut',
    brackets: [
      { min: 0,       max: 53268,  rate: 0.04  },
      { min: 53268,   max: 106537, rate: 0.07  },
      { min: 106537,  max: 173205, rate: 0.09  },
      { min: 173205,  max: Infinity, rate: 0.115 },
    ],
    basicPersonalAmount: 17925,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },

  YT: {
    code: 'YT',
    name: 'Yukon',
    nameFR: 'Yukon',
    brackets: [
      { min: 0,       max: 57375,  rate: 0.064 },
      { min: 57375,   max: 114750, rate: 0.09  },
      { min: 114750,  max: 500000, rate: 0.109 },
      { min: 500000,  max: Infinity, rate: 0.128 },
    ],
    basicPersonalAmount: 16129,
    hasProvincialCPP: false,
    hasProvincialEI: false,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇺🇸 ÉTATS-UNIS — FÉDÉRAL 2026
// ─────────────────────────────────────────────────────────────────────────────

export const USA_FEDERAL = {
  socialSecurity: {
    rate: 0.062,          // 6.2% employé
    employerRate: 0.062,  // 6.2% employeur
    wageBase: 176100,     // Maximum 2026
  },
  medicare: {
    rate: 0.0145,         // 1.45% employé
    employerRate: 0.0145, // 1.45% employeur
    additionalRate: 0.009, // 0.9% additionnel si >200k$
  },
  // Impôt fédéral 2026 (célibataire)
  incomeTax: {
    brackets: [
      { min: 0,       max: 11925,  rate: 0.10  },
      { min: 11925,   max: 48475,  rate: 0.12  },
      { min: 48475,   max: 103350, rate: 0.22  },
      { min: 103350,  max: 197300, rate: 0.24  },
      { min: 197300,  max: 250525, rate: 0.32  },
      { min: 250525,  max: 626350, rate: 0.35  },
      { min: 626350,  max: Infinity, rate: 0.37 },
    ],
    standardDeduction: 15000, // Déduction standard 2026
  },
  // FUTA — Federal Unemployment (employeur seulement)
  futa: {
    rate: 0.006,    // 0.6% après crédit état
    wageBase: 7000,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇺🇸 ÉTATS-UNIS — PAR ÉTAT 2026
// ─────────────────────────────────────────────────────────────────────────────

export interface StateTaxInfo {
  code: string
  name: string
  hasIncomeTax: boolean
  flatRate?: number
  brackets?: { min: number; max: number; rate: number }[]
  standardDeduction?: number
  notes?: string
}

export const USA_STATES: Record<string, StateTaxInfo> = {
  // ── Sans impôt sur le revenu ──────────────────────────────────────
  AK: { code: 'AK', name: 'Alaska',       hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },
  FL: { code: 'FL', name: 'Florida',      hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },
  NV: { code: 'NV', name: 'Nevada',       hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },
  NH: { code: 'NH', name: 'New Hampshire',hasIncomeTax: false, notes: 'Aucun impôt sur le revenu (dividendes seulement)' },
  SD: { code: 'SD', name: 'South Dakota', hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },
  TN: { code: 'TN', name: 'Tennessee',    hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },
  TX: { code: 'TX', name: 'Texas',        hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },
  WA: { code: 'WA', name: 'Washington',   hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },
  WY: { code: 'WY', name: 'Wyoming',      hasIncomeTax: false, notes: 'Aucun impôt sur le revenu' },

  // ── Taux fixe (flat tax) ──────────────────────────────────────────
  AZ: { code: 'AZ', name: 'Arizona',      hasIncomeTax: true, flatRate: 0.025 },
  CO: { code: 'CO', name: 'Colorado',     hasIncomeTax: true, flatRate: 0.044 },
  ID: { code: 'ID', name: 'Idaho',        hasIncomeTax: true, flatRate: 0.058 },
  IL: { code: 'IL', name: 'Illinois',     hasIncomeTax: true, flatRate: 0.0495 },
  IN: { code: 'IN', name: 'Indiana',      hasIncomeTax: true, flatRate: 0.0305 },
  KY: { code: 'KY', name: 'Kentucky',     hasIncomeTax: true, flatRate: 0.04 },
  MA: { code: 'MA', name: 'Massachusetts',hasIncomeTax: true, flatRate: 0.05 },
  MI: { code: 'MI', name: 'Michigan',     hasIncomeTax: true, flatRate: 0.0425 },
  MS: { code: 'MS', name: 'Mississippi',  hasIncomeTax: true, flatRate: 0.047 },
  NC: { code: 'NC', name: 'North Carolina',hasIncomeTax: true, flatRate: 0.045 },
  PA: { code: 'PA', name: 'Pennsylvania', hasIncomeTax: true, flatRate: 0.0307 },
  UT: { code: 'UT', name: 'Utah',         hasIncomeTax: true, flatRate: 0.0485 },

  // ── Paliers progressifs ──────────────────────────────────────────
  CA: {
    code: 'CA', name: 'California', hasIncomeTax: true,
    brackets: [
      { min: 0,       max: 10756,  rate: 0.01   },
      { min: 10756,   max: 25499,  rate: 0.02   },
      { min: 25499,   max: 40246,  rate: 0.04   },
      { min: 40246,   max: 54993,  rate: 0.06   },
      { min: 54993,   max: 69542,  rate: 0.08   },
      { min: 69542,   max: 357013, rate: 0.093  },
      { min: 357013,  max: 428013, rate: 0.103  },
      { min: 428013,  max: 714026, rate: 0.113  },
      { min: 714026,  max: Infinity,rate: 0.123 },
    ],
    notes: 'Plus SDI (State Disability Insurance) 1.1%',
  },
  NY: {
    code: 'NY', name: 'New York', hasIncomeTax: true,
    brackets: [
      { min: 0,       max: 17150,  rate: 0.04   },
      { min: 17150,   max: 23600,  rate: 0.045  },
      { min: 23600,   max: 27900,  rate: 0.0525 },
      { min: 27900,   max: 161550, rate: 0.0585 },
      { min: 161550,  max: 323200, rate: 0.0625 },
      { min: 323200,  max: 2155350,rate: 0.0685 },
      { min: 2155350, max: Infinity,rate: 0.0882},
    ],
  },
  OR: {
    code: 'OR', name: 'Oregon', hasIncomeTax: true,
    brackets: [
      { min: 0,      max: 18400,  rate: 0.0475 },
      { min: 18400,  max: 46200,  rate: 0.0675 },
      { min: 46200,  max: 250000, rate: 0.0875 },
      { min: 250000, max: Infinity,rate: 0.099 },
    ],
  },
  MN: {
    code: 'MN', name: 'Minnesota', hasIncomeTax: true,
    brackets: [
      { min: 0,       max: 31690,  rate: 0.0535 },
      { min: 31690,   max: 104090, rate: 0.068  },
      { min: 104090,  max: 193240, rate: 0.0785 },
      { min: 193240,  max: Infinity,rate: 0.0985},
    ],
  },
  NJ: {
    code: 'NJ', name: 'New Jersey', hasIncomeTax: true,
    brackets: [
      { min: 0,       max: 20000,  rate: 0.014  },
      { min: 20000,   max: 35000,  rate: 0.0175 },
      { min: 35000,   max: 40000,  rate: 0.035  },
      { min: 40000,   max: 75000,  rate: 0.05525},
      { min: 75000,   max: 500000, rate: 0.0637 },
      { min: 500000,  max: 1000000,rate: 0.0897 },
      { min: 1000000, max: Infinity,rate: 0.1075},
    ],
  },
  // Autres états simplifiés
  AL: { code: 'AL', name: 'Alabama',      hasIncomeTax: true, flatRate: 0.05  },
  AR: { code: 'AR', name: 'Arkansas',     hasIncomeTax: true, flatRate: 0.044 },
  CT: { code: 'CT', name: 'Connecticut',  hasIncomeTax: true, flatRate: 0.0699},
  DE: { code: 'DE', name: 'Delaware',     hasIncomeTax: true, flatRate: 0.066 },
  GA: { code: 'GA', name: 'Georgia',      hasIncomeTax: true, flatRate: 0.0549},
  HI: { code: 'HI', name: 'Hawaii',       hasIncomeTax: true, flatRate: 0.11  },
  IA: { code: 'IA', name: 'Iowa',         hasIncomeTax: true, flatRate: 0.0575},
  KS: { code: 'KS', name: 'Kansas',       hasIncomeTax: true, flatRate: 0.057 },
  LA: { code: 'LA', name: 'Louisiana',    hasIncomeTax: true, flatRate: 0.03  },
  ME: { code: 'ME', name: 'Maine',        hasIncomeTax: true, flatRate: 0.0715},
  MD: { code: 'MD', name: 'Maryland',     hasIncomeTax: true, flatRate: 0.0575},
  MO: { code: 'MO', name: 'Missouri',     hasIncomeTax: true, flatRate: 0.0495},
  MT: { code: 'MT', name: 'Montana',      hasIncomeTax: true, flatRate: 0.059 },
  NE: { code: 'NE', name: 'Nebraska',     hasIncomeTax: true, flatRate: 0.0664},
  NM: { code: 'NM', name: 'New Mexico',   hasIncomeTax: true, flatRate: 0.059 },
  ND: { code: 'ND', name: 'North Dakota', hasIncomeTax: true, flatRate: 0.025 },
  OH: { code: 'OH', name: 'Ohio',         hasIncomeTax: true, flatRate: 0.035 },
  OK: { code: 'OK', name: 'Oklahoma',     hasIncomeTax: true, flatRate: 0.0475},
  RI: { code: 'RI', name: 'Rhode Island', hasIncomeTax: true, flatRate: 0.0599},
  SC: { code: 'SC', name: 'South Carolina',hasIncomeTax: true,flatRate: 0.064 },
  VT: { code: 'VT', name: 'Vermont',      hasIncomeTax: true, flatRate: 0.0875},
  VA: { code: 'VA', name: 'Virginia',     hasIncomeTax: true, flatRate: 0.0575},
  WV: { code: 'WV', name: 'West Virginia',hasIncomeTax: true, flatRate: 0.065 },
  WI: { code: 'WI', name: 'Wisconsin',    hasIncomeTax: true, flatRate: 0.0765},
  DC: { code: 'DC', name: 'Washington DC',hasIncomeTax: true, flatRate: 0.0895},
}

