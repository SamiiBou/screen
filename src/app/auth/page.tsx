'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision'
import { IconArrowLeft, IconUserPlus } from '@tabler/icons-react'
import { AceternityButton } from '@/components/ui/AceternityButton'
import WalletAuth from '@/components/WalletAuth'

export default function AuthPage() {
  const router = useRouter()

  const handleAuthSuccess = (userData: any) => {
    console.log('🎉 Authentication successful, redirecting to mode selection')
    router.push('/mode-selection')
  }

  const handleAuthError = (error: any) => {
    console.error('❌ Authentication error:', error)
    // Error is handled by WalletAuth component
  }

  return (
    <div className="min-h-screen relative scrollable-container">
      <BackgroundBeamsWithCollision className="min-h-screen">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="apple-blur rounded-3xl p-8 w-full max-w-md relative overflow-hidden"
          >
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <IconUserPlus className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Welcome to Button Game!
              </motion.h1>
              
              <motion.p 
                className="text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Connect your World wallet to start playing
              </motion.p>
            </motion.div>

            {/* Wallet Auth Component */}
            <motion.div 
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <WalletAuth 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
            </motion.div>

            {/* Back Button */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <AceternityButton
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm group bg-transparent border-none shadow-none mt-6"
              >
                <IconArrowLeft className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                Back to home
              </AceternityButton>
            </motion.div>

            {/* Info */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-xs text-gray-500">
                Powered by Worldcoin MiniKit
              </p>
            </motion.div>
          </motion.div>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  )
}