import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  completed: boolean
  lang: 'fr' | 'en'
  country: 'CA' | 'US'
  province: string
  complete: (data: { lang: 'fr' | 'en'; country: 'CA' | 'US'; province: string }) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      lang: 'fr',
      country: 'CA',
      province: 'AB',
      complete: (data) => set({ completed: true, ...data }),
      reset: () => set({ completed: false }),
    }),
    { name: 'onboarding-store-v1' }
  )
)

