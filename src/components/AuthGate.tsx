'use client'

import React, { ReactNode } from 'react'
import WalletAuth from './WalletAuth'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGateProps {
  children: ReactNode
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth()

  const handleAuthSuccess = (userData: any) => {
    console.log('🎉 Authentication successful in AuthGate:', userData)
    login(userData)
  }

  const handleAuthError = (error: any) => {
    console.error('❌ Authentication error in AuthGate:', error)
  }

  // Show loader during authentication verification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show sign in page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="w-full max-w-md px-6">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Button Game</h1>
            <p className="text-gray-300">Connect your World wallet to continue</p>
          </div>
          
          {/* Authentication Component */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <WalletAuth 
              onAuthSuccess={handleAuthSuccess}
              onAuthError={handleAuthError}
            />
          </div>
          
          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Powered by Worldcoin MiniKit
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If user is authenticated, show application content
  return <>{children}</>
}

export default AuthGate 