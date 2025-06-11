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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sf-pro antialiased">
        <ErudaDebugger />
        <MiniKitProvider>
          <AuthProvider>
            <ChallengesProvider>
              <HumanVerificationProvider
                autoShowModal={true}
                delayMs={2000}
              >
                {children}
              </HumanVerificationProvider>
            </ChallengesProvider>
          </AuthProvider>
        </MiniKitProvider>
      </body>
    </html>
  )
}