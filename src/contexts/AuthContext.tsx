'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '@/utils/api'

interface User {
  id: string
  username: string
  displayName?: string
  walletAddress: string
  avatar?: string
  verified: boolean
  authMethod: string
  bestTime: number
  totalChallengesPlayed: number
  minikitProfile?: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          // Verify token is still valid
          try {
            const profile = await apiService.getProfile()
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            console.log('✅ User authenticated from storage:', profile.user)
          } catch (error) {
            console.log('❌ Token expired, clearing auth data')
            // Token expired, clear data
            apiService.logout()
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = (userData: User) => {
    console.log('🔑 Logging in user:', userData)
    setUser(userData)
    
    // Store user data in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('walletAddress', userData.walletAddress)
    localStorage.setItem('username', userData.username)
    localStorage.setItem('isAuthenticated', 'true')
    
    // The token is already set by apiService during the auth process
  }

  const logout = () => {
    console.log('🚪 Logging out user')
    setUser(null)
    
    // Clear all auth data
    apiService.logout()
    localStorage.removeItem('user')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('username')
    localStorage.removeItem('isAuthenticated')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      console.log('🔄 User updated:', updatedUser)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 