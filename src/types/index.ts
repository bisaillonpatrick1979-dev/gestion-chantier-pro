export type WorkMode = 'heure' | 'forfait' | 'surface'

export type DayStatus =
  | 'vacation'
  | 'tiny'
  | 'small'
  | 'normal'
  | 'good'
  | 'big'
  | 'huge'
  | 'empty'

export const DAY_STATUS_CONFIG = {
  vacation: { emoji: '⛱️', label: 'Congé',              description: 'Pas de revenus',               color: '#06b6d4', tint: 'rgba(6,182,212,0.15)'   },
  tiny:     { emoji: '🌙', label: 'Petite journée',      description: 'Moins de 4h',                  color: '#64748b', tint: 'rgba(100,116,139,0.15)' },
  small:    { emoji: '📋', label: 'Journée moyenne',     description: 'Entre 4h et 6h',               color: '#3b82f6', tint: 'rgba(59,130,246,0.15)'  },
  normal:   { emoji: '✅', label: 'Journée normale',     description: 'Entre 6h et 8h',               color: '#22c55e', tint: 'rgba(34,197,94,0.15)'   },
  good:     { emoji: '⭐', label: 'Bonne journée',       description: 'Entre 8h et 10h',              color: '#eab308', tint: 'rgba(234,179,8,0.15)'   },
  big:      { emoji: '🔥', label: 'Grosse journée',      description: 'Entre 10h et 12h',             color: '#f97316', tint: 'rgba(249,115,22,0.15)'  },
  huge:     { emoji: '💎', label: 'Très grosse journée', description: 'Plus de 12h',                  color: '#a855f7', tint: 'rgba(168,85,247,0.15)'  },
  empty:    { emoji: '',   label: '',                     description: '',                             color: 'transparent', tint: 'transparent'         },
}

export const STATUS_CYCLE: DayStatus[] = [
  'empty','vacation','tiny','small','normal','good','big','huge'
]

export interface DayRecord {
  date: string
  status: DayStatus
  revenue: number
  hours: number
}

export interface WorkSession {
  id: string
  startTime: string
  endTime: string | null
  mode: WorkMode
  revenue: number
  elapsed: number
}
