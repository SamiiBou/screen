import type { Metadata } from 'next'
import './globals.css'
// import ErudaDebugger from '@/components/ErudaDebugger'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChallengesProvider } from '@/contexts/ChallengesContext'
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'
import { HumanVerificationProvider } from '@/components/HumanVerificationProvider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Button Endurance Game - The Last Survivor',
  description: 'The last one to keep their finger on the button wins. Test your endurance and take on the challenges!',
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
        {/* <ErudaDebugger /> */}
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
