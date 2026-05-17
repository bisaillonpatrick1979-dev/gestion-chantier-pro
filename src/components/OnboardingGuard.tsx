'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOnboardingStore } from '@/store/useOnboardingStore'

export default function OnboardingGuard() {
  const { completed } = useOnboardingStore()
  const router        = useRouter()
  const pathname      = usePathname()

  useEffect(() => {
    // Redirige vers l'onboarding si pas complété et pas déjà sur la page
    if (!completed && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [completed, pathname, router])

  return null
}
