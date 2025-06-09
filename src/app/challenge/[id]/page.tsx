'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { apiService } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import AuthGate from '@/components/AuthGate'
import { AceternityButton } from '@/components/ui/AceternityButton'

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

function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [canParticipate, setCanParticipate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  const challengeId = params.id as string

  useEffect(() => {
    if (challengeId) {
      loadChallengeData()
    }
  }, [challengeId])

  const loadChallengeData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Loading challenge with ID:', challengeId)
      
      // Charger les détails du challenge via l'API service
      const challengeResponse = await apiService.getChallengeById(challengeId)
      
      console.log('📋 Challenge response:', challengeResponse)
      
      if (challengeResponse && challengeResponse.challenge) {
        setChallenge(challengeResponse.challenge)
        
        // Vérifier si l'utilisateur peut participer
        try {
          const participationResponse = await apiService.canParticipateInChallenge(challengeId)
          setCanParticipate(participationResponse.canParticipate)
        } catch (err) {
          console.error('Error checking participation:', err)
          setCanParticipate(true) // Par défaut, permettre la participation
        }
      } else {
        setError('Challenge not found')
      }
    } catch (error: any) {
      console.error('❌ Error loading challenge:', error)
      setError(`Failed to load challenge: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipate = async () => {
    if (!challenge || !user || isNavigating) return
    
    console.log('🏡 Starting challenge:', challengeId)
    setIsNavigating(true)
    
    // Petite pause pour éviter les double-clics
    setTimeout(() => {
      router.push(`/game?challengeId=${challengeId}`)
    }, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now

    if (diff <= 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
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

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-black text-2xl font-semibold mb-6">{error || 'Challenge Not Found'}</div>
          <AceternityButton 
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Back Home
          </AceternityButton>
        </div>
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
            <AceternityButton 
              onClick={() => router.push('/')}
              className="bg-gray-100 text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              ← Back
            </AceternityButton>
            
            <motion.h1 
              className="text-xl font-bold text-black"
              whileHover={{ scale: 1.02 }}
            >
              Challenge
            </motion.h1>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              challenge.status === 'active' ? 'bg-green-100 text-green-800' :
              challenge.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {challenge.status.toUpperCase()}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-black text-black mb-4">
              {challenge.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {challenge.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <div className="text-center p-4 border border-gray-200 rounded-xl">
              <div className="text-2xl font-bold text-black">{challenge.prizePool}€</div>
              <div className="text-gray-600 text-sm">Prize</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-xl">
              <div className="text-2xl font-bold text-black">{challenge.currentParticipants}/{challenge.maxParticipants}</div>
              <div className="text-gray-600 text-sm">Players</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-xl">
              <div className="text-2xl font-bold text-black">{formatDate(challenge.startDate).split(',')[0]}</div>
              <div className="text-gray-600 text-sm">Started</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-xl">
              <div className="text-2xl font-bold text-black">{getTimeRemaining(challenge.endDate)}</div>
              <div className="text-gray-600 text-sm">Remaining</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            {challenge.status === 'active' && canParticipate && (
              <div className="space-y-6">
                <AceternityButton
                  onClick={handleParticipate}
                  disabled={isNavigating}
                  className={`px-12 py-4 rounded-full text-xl font-semibold transition-colors ${
                    isNavigating 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {isNavigating ? 'Starting...' : 'Join Challenge'}
                </AceternityButton>
              </div>
            )}

            {challenge.status === 'active' && !canParticipate && (
              <div className="bg-gray-100 rounded-xl p-6">
                <p className="text-gray-600">
                  You're already participating in this challenge
                </p>
              </div>
            )}

            {challenge.status === 'upcoming' && (
              <div className="bg-gray-100 rounded-xl p-6">
                <p className="text-gray-600">
                  Challenge starts {formatDate(challenge.startDate)}
                </p>
              </div>
            )}

            {challenge.status === 'completed' && (
              <div className="bg-gray-100 rounded-xl p-6">
                <p className="text-gray-600">
                  This challenge has ended
                </p>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGate>
      <ChallengePage />
    </AuthGate>
  )
} 