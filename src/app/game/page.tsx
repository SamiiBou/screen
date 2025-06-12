'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ButtonGame from '@/components/ButtonGame'
import AuthGate from '@/components/AuthGate'
import { motion } from 'motion/react'

function GameContent() {
  const searchParams = useSearchParams()
  const challengeId = searchParams?.get('challengeId') || undefined

  return (
    <ButtonGame 
      challengeId={challengeId}
    />
  )
}

export default function GamePage() {
  return (
    <AuthGate>
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      }>
        <GameContent />
      </Suspense>
    </AuthGate>
  )
} 