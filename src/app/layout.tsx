import type { Metadata } from 'next'
import './globals.css'
import ErudaDebugger from '@/components/ErudaDebugger'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChallengesProvider } from '@/contexts/ChallengesContext'
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'
import { HumanVerificationProvider } from '@/components/HumanVerificationProvider'

export const metadata: Metadata = {
  title: 'Button Endurance Game - Le Dernier Survivant',
  description: 'Le dernier à garder son doigt sur le bouton gagne. Testez votre endurance et relevez les défis !',
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'preconnect-googleapis': '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    'preconnect-gstatic': '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sf-pro antialiased">
        <ErudaDebugger />
        <MiniKitProvider>
          <AuthProvider>
            <ChallengesProvider>
              <HumanVerificationProvider
                autoShowModal={true}
                delayMs={2000}
              >
                {/* Next.js overlay re-enabled: script removed */}
                {children}
              </HumanVerificationProvider>
            </ChallengesProvider>
          </AuthProvider>
        </MiniKitProvider>
      </body>
    </html>
  )
}
