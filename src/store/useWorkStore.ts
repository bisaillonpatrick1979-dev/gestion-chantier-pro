'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  WorkMode, DayStatus, DayRecord,
  WorkSession, STATUS_CYCLE
} from '@/types'
import { formatDateKey } from '@/lib/formatters'

interface WorkStore {
  mode: WorkMode
  hourlyRate: number
  forfaitAmount: number
  surfaceRate: number
  surfaceArea: number
  isRunning: boolean
  isOnBreak: boolean
  startTime: string | null
  elapsed: number
  breakElapsed: number
  revenue: number
  currentMonth: string
  dayRecords: Record<string, DayRecord>
  sessions: WorkSession[]
  setMode: (mode: WorkMode) => void
  setHourlyRate: (rate: number) => void
  setForfaitAmount: (amount: number) => void
  setSurfaceRate: (rate: number) => void
  setSurfaceArea: (area: number) => void
  punchIn: () => void
  punchOut: () => void
  startBreak: () => void
  endBreak: () => void
  tick: () => void
  cycleDayStatus: (dateKey: string) => void
  navigateMonth: (direction: 'prev' | 'next') => void
  resetAllData: () => void
}

export const useWorkStore = create<WorkStore>()(
  persist(
    (set, get) => ({
      mode: 'heure',
      hourlyRate: 45,
      forfaitAmount: 0,
      surfaceRate: 0,
      surfaceArea: 0,
      isRunning: false,
      isOnBreak: false,
      startTime: null,
      elapsed: 0,
      breakElapsed: 0,
      revenue: 0,
      currentMonth: new Date().toISOString().slice(0, 7),
      dayRecords: {},
      sessions: [],

      setMode: (mode) => set({ mode }),
      setHourlyRate: (rate) => set({ hourlyRate: rate }),
      setForfaitAmount: (amount) => set({ forfaitAmount: amount }),
      setSurfaceRate: (rate) => set({ surfaceRate: rate }),
      setSurfaceArea: (area) => set({ surfaceArea: area }),

      punchIn: () => set({
        isRunning: true,
        isOnBreak: false,
        startTime: new Date().toISOString(),
        elapsed: 0,
        breakElapsed: 0,
        revenue: 0,
      }),

      punchOut: () => {
        const {
          elapsed, mode, hourlyRate,
          forfaitAmount, surfaceRate, surfaceArea,
          sessions, dayRecords, startTime
        } = get()

        let finalRevenue = 0
        if (mode === 'heure') finalRevenue = (elapsed / 3600) * hourlyRate
        if (mode === 'forfait') finalRevenue = forfaitAmount
        if (mode === 'surface') finalRevenue = surfaceArea * surfaceRate

        const hours = elapsed / 3600
        let status: DayStatus = 'empty'
        if (elapsed < 14400) status = 'tiny'
        else if (elapsed < 21600) status = 'small'
        else if (elapsed < 28800) status = 'normal'
        else if (elapsed < 36000) status = 'good'
        else if (elapsed < 43200) status = 'big'
        else status = 'huge'

        const todayKey = formatDateKey(new Date())
        const session: WorkSession = {
          id: Date.now().toString(),
          startTime: startTime || new Date().toISOString(),
          endTime: new Date().toISOString(),
          mode,
          revenue: finalRevenue,
          elapsed,
        }

        set({
          isRunning: false,
          isOnBreak: false,
          startTime: null,
          revenue: finalRevenue,
          sessions: [...sessions, session],
          dayRecords: {
            ...dayRecords,
            [todayKey]: {
              date: todayKey,
              status,
              revenue: finalRevenue,
              hours,
            },
          },
        })
      },

      startBreak: () => set({ isOnBreak: true }),
      endBreak: () => set({ isOnBreak: false }),

      tick: () => {
        const {
          isRunning, isOnBreak, elapsed, breakElapsed,
          mode, hourlyRate, forfaitAmount,
          surfaceRate, surfaceArea
        } = get()
        if (!isRunning) return
        if (isOnBreak) {
          set({ breakElapsed: breakElapsed + 1 })
          return
        }
        const newElapsed = elapsed + 1
        let revenue = 0
        if (mode === 'heure') revenue = (newElapsed / 3600) * hourlyRate
        if (mode === 'forfait') revenue = forfaitAmount
        if (mode === 'surface') revenue = surfaceArea * surfaceRate
        set({ elapsed: newElapsed, revenue })
      },

      cycleDayStatus: (dateKey: string) => {
        const { dayRecords } = get()
        const current = dayRecords[dateKey]?.status ?? 'empty'
        const idx = STATUS_CYCLE.indexOf(current)
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
        set({
          dayRecords: {
            ...dayRecords,
            [dateKey]: {
              ...dayRecords[dateKey],
              date: dateKey,
              status: next,
              revenue: dayRecords[dateKey]?.revenue ?? 0,
              hours: dayRecords[dateKey]?.hours ?? 0,
            },
          },
        })
      },

      navigateMonth: (direction) => {
        const { currentMonth } = get()
        const [year, month] = currentMonth.split('-').map(Number)
        const date = new Date(year, month - 1)
        if (direction === 'prev') date.setMonth(date.getMonth() - 1)
        else date.setMonth(date.getMonth() + 1)
        set({ currentMonth: date.toISOString().slice(0, 7) })
      },

      resetAllData: () => set({
        dayRecords: {},
        sessions: [],
        elapsed: 0,
        breakElapsed: 0,
        revenue: 0,
        isRunning: false,
        isOnBreak: false,
        startTime: null,
      }),
    }),
    { name: 'work-store-v2' }
  )
)

if (typeof window !== 'undefined') {
  setInterval(() => useWorkStore.getState().tick(), 1000)
}
