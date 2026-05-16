// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeProvider from '@/components/layout/ThemeProvider'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import ThemeInjector from '@/components/ThemeInjector'

export const metadata: Metadata = {
  title: 'Gestion Chantier Pro',
  description: 'Application de gestion de chantier - Hailite Xteriors',
  applicationName: 'Gestion Chantier Pro',
  appleWebApp: {
    capable: true,
    title: 'Chantier Pro',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Chantier Pro" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {/* Injecte le globalCSS du thème actif */}
          <ThemeInjector />
          <Navbar />
          {children}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
