'use client'

import React, { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGateProps {
  children: ReactNode
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to our beautiful auth page if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  // Show elegant white loader during authentication verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  // If user is not authenticated, redirect happens in useEffect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  // If user is authenticated, show application content
  return <>{children}</>
}

export default AuthGate 