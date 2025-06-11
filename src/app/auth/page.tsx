'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { AceternityButton } from '@/components/ui/AceternityButton'
import { useAuth } from '@/contexts/AuthContext'
import WalletAuth from '@/components/WalletAuth'

export default function AuthPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)

  const handleAuthSuccess = (userData: any) => {
    console.log('🎉 Authentication successful, updating context and showing loading screen')
    setIsConnecting(false)
    setShowLoadingScreen(true)
    
    // Update the auth context with user data
    login(userData)
    
    // Show loading screen for 2.5 seconds then redirect to home
    setTimeout(() => {
      router.push('/')
    }, 2500)
  }

  const handleAuthError = (error: any) => {
    console.error('❌ Authentication error:', error)
    setIsConnecting(false)
  }

  const handleConnectStart = () => {
    setIsConnecting(true)
  }

  // Pure White Loading Screen
  const LoadingScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <Image 
            src="/HODL_LOGO.png" 
            alt="HODL Logo" 
            width={200} 
            height={60} 
            className="h-16 w-auto mx-auto"
          />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-black rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          <motion.p
            className="text-gray-600 text-base font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Setting up your experience...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            
            {/* HODL Logo Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-block mb-8"
              >
                <Image 
                  src="/HODL_LOGO.png" 
                  alt="HODL Logo" 
                  width={600} 
                  height={180} 
                  className="h-40 w-auto mx-auto"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-3"
              >
                <h1 className="text-3xl font-light text-black tracking-tight">
                  Enter the Game
                </h1>
                <p className="text-gray-500 text-base font-light">
                  Connect your wallet to continue
                </p>
              </motion.div>
            </motion.div>

            {/* Pure White Auth Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-lg shadow-black/5"
            >
              
              {/* Connection Status */}
              <AnimatePresence mode="wait">
                {isConnecting ? (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <motion.div
                        className="w-2 h-2 bg-black rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-black rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.2,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-black rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.4,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    <p className="text-gray-600 text-sm font-light">
                      Connecting to your wallet...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <WalletAuth 
                      onAuthSuccess={handleAuthSuccess}
                      onAuthError={handleAuthError}
                      onConnectStart={handleConnectStart}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>


            {/* Footer */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-xs text-gray-400 font-light">
                Secured by World ID • Privacy by design
              </p>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Loading Screen Overlay */}
      <AnimatePresence>
        {showLoadingScreen && <LoadingScreen />}
      </AnimatePresence>
    </>
  )
}