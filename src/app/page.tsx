'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { AceternityButton } from '@/components/ui/AceternityButton'
import AuthGate from '@/components/AuthGate'
import AddChallengeForm from '@/components/AddChallengeForm'

interface Challenge {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  maxParticipants: number
  currentParticipants: number
  prizePool: number
  status: 'upcoming' | 'active' | 'completed'
}

function HomePage() {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await apiService.getActiveChallenges()
        setActiveChallenges(response.challenges || [])
      } catch (error) {
        console.error('Error loading challenges:', error)
        setActiveChallenges([])
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  const handleChallengeClick = (challengeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    console.log('🎯 Navigating to challenge:', challengeId)
    router.push(`/challenge/${challengeId}`)
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-2xl font-bold text-black"
              whileHover={{ scale: 1.02 }}
            >
              Button
            </motion.h1>
            {isAuthenticated && (
              <AceternityButton 
                onClick={() => router.push('/leaderboard')}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                Leaderboard
              </AceternityButton>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl md:text-8xl font-black text-black mb-6 leading-none">
              HOLD THE
              <br />
              BUTTON
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Last person holding wins
            </p>
          </motion.div>

          {/* Ajout du formulaire d'ajout de challenge */}
          {isAuthenticated && (
            <AddChallengeForm onSuccess={async () => {
              setLoading(true)
              try {
                const response = await apiService.getActiveChallenges()
                setActiveChallenges(response.challenges || [])
              } catch (error) {
                setActiveChallenges([])
              } finally {
                setLoading(false)
              }
            }} />
          )}

          {/* Challenges */}
          {!isAuthenticated ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <AceternityButton 
                onClick={() => router.push('/auth')}
                className="bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Connect Wallet to Play
              </AceternityButton>
            </motion.div>
          ) : activeChallenges.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-gray-500 mb-6">No active challenges</p>
              <AceternityButton 
                onClick={async () => {
                  try {
                    await apiService.initDefaultChallenges()
                    const response = await apiService.getActiveChallenges()
                    setActiveChallenges(response.challenges || [])
                  } catch (error) {
                    console.error('Error creating challenges:', error)
                  }
                }}
                className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Create Challenge
              </AceternityButton>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={(e) => handleChallengeClick(challenge._id, e)}
                  className="border border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-black transition-colors select-none"
                  style={{ userSelect: 'none' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {challenge.currentParticipants}/{challenge.maxParticipants} players
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">
                        {challenge.prizePool}€
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGate>
      <HomePage />
    </AuthGate>
  )
}