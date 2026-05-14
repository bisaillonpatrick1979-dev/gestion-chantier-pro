import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/layout/ThemeProvider'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'Gestion Chantier Pro',
  description: 'Application de gestion de chantier - Hailite Xteriors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <div className="fire-bg" />
          <div className="stars" />
          <Navbar />
          <main style={{
            paddingTop: '64px',
            paddingBottom: '80px',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 10,
            padding: '64px 16px 80px 16px',
          }}>
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
