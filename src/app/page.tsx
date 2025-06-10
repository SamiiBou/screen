'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { useChallenges } from '@/contexts/ChallengesContext'
import { AceternityButton } from '@/components/ui/AceternityButton'
import AuthGate from '@/components/AuthGate'
import AddChallengeForm from '@/components/AddChallengeForm'

interface Challenge {
  _id: string
  title: string
  description: string
  maxParticipants: number
  currentParticipants: number
  firstPrize: number
  secondPrize: number
  thirdPrize: number
  participationPrice: number
  status: 'upcoming' | 'active' | 'completed'
}

function HomePage() {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [navigatingToChallengeId, setNavigatingToChallengeId] = useState<string | null>(null)
  const navigatingRef = useRef<Record<string, boolean>>({})
  const { user, isAuthenticated } = useAuth()
  const { setChallengesList, preloadChallenge } = useChallenges()
  const router = useRouter()

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await apiService.getActiveChallenges()
        const challenges = response.challenges || []
        setActiveChallenges(challenges)
        // Mettre à jour le cache des challenges
        setChallengesList(challenges)
        
        // PRÉCHARGEMENT RADICAL: Charger les 3 premiers challenges en arrière-plan
        console.log('🔥 [RADICAL PRELOAD] Starting aggressive preloading...')
        challenges.slice(0, 3).forEach((challenge, index) => {
          setTimeout(() => {
            preloadChallenge(challenge._id).catch(console.error)
          }, index * 100) // Étaler les requêtes
        })
      } catch (error) {
        console.error('Error loading challenges:', error)
        setActiveChallenges([])
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  // SYSTÈME DE PRÉCHARGEMENT RADICAL
  const preloadChallengeOnHover = useCallback(async (challengeId: string) => {
    console.log('🔥 [RADICAL PRELOAD] Preloading challenge on hover:', challengeId)
    try {
      await preloadChallenge(challengeId)
      console.log('✅ [RADICAL PRELOAD] Challenge preloaded successfully')
    } catch (error) {
      console.error('❌ [RADICAL PRELOAD] Failed to preload:', error)
    }
  }, [preloadChallenge])

  // MÉTHODE SUPER RADICALE pour la page d'accueil
  const handleChallengeClick = useCallback((challengeId: string, e?: React.MouseEvent, buttonElement?: HTMLButtonElement) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log('🔥 [SUPER RADICAL HOME] Button clicked for challenge:', challengeId)
    
    // SUPER RADICAL 1: Bloquer via ref immédiatement
    if (navigatingRef.current[challengeId]) {
      console.log('🚫 [SUPER RADICAL HOME] Already navigating via ref:', challengeId)
      return
    }
    navigatingRef.current[challengeId] = true
    
    // SUPER RADICAL 2: Manipulation DOM directe si bouton fourni
    if (buttonElement) {
      buttonElement.disabled = true
      buttonElement.style.backgroundColor = '#d1d5db'
      buttonElement.style.color = '#9ca3af'
      buttonElement.style.cursor = 'not-allowed'
      buttonElement.textContent = 'Joining...'
      console.log('🔥 [SUPER RADICAL HOME] Button DOM directly modified')
    }
    
    // SUPER RADICAL 3: État React en parallèle
    setNavigatingToChallengeId(challengeId)
    
    // SUPER RADICAL 4: Navigation avec requestAnimationFrame
    requestAnimationFrame(() => {
      console.log('🎯 [SUPER RADICAL HOME] Navigating to challenge:', challengeId)
      router.push(`/challenge/${challengeId}`)
    })
    
    // Reset dans 3 secondes au cas où la navigation échoue
    setTimeout(() => {
      navigatingRef.current[challengeId] = false
      setNavigatingToChallengeId(null)
    }, 3000)
  }, [router])

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
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-lg font-medium text-black"
              whileHover={{ scale: 1.02 }}
            >
              Button
            </motion.h1>
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
            <h2 className="text-5xl md:text-7xl font-light text-black mb-8 leading-none tracking-tight">
              HOLD THE
              <br />
              BUTTON
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto font-light mb-4">
              Last person holding wins
            </p>
            <AceternityButton 
              onClick={() => {}}
              className="text-gray-500 hover:text-black transition-colors text-sm font-medium"
            >
              How to Play
            </AceternityButton>
          </motion.div>

          {/* Ajout du formulaire d'ajout de challenge */}
          {isAuthenticated && (
            <AddChallengeForm onSuccess={async () => {
              setLoading(true)
              try {
                const response = await apiService.getActiveChallenges()
                const challenges = response.challenges || []
                setActiveChallenges(challenges)
                // Mettre à jour le cache des challenges
                setChallengesList(challenges)
                // Précharger les nouveaux challenges
                challenges.slice(0, 3).forEach((challenge, index) => {
                  setTimeout(() => {
                    preloadChallenge(challenge._id).catch(console.error)
                  }, index * 100)
                })
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
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-900 transition-all duration-200 border-none"
              >
                Connect Wallet
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
                    const challenges = response.challenges || []
                    setActiveChallenges(challenges)
                    // Mettre à jour le cache des challenges
                    setChallengesList(challenges)
                    // Précharger les nouveaux challenges
                    challenges.slice(0, 3).forEach((challenge, index) => {
                      setTimeout(() => {
                        preloadChallenge(challenge._id).catch(console.error)
                      }, index * 100)
                    })
                  } catch (error) {
                    console.error('Error creating challenges:', error)
                  }
                }}
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-900 transition-all duration-200 border-none"
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
                  className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-200 select-none"
                  style={{ userSelect: 'none' }}
                  onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                  onTouchStart={() => preloadChallengeOnHover(challenge._id)}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={(e) => handleChallengeClick(challenge._id, e)}
                      onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                    >
                      <h3 className="text-lg font-medium text-black mb-1">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-400 text-xs font-medium">
                        {challenge.currentParticipants}/{challenge.maxParticipants} PLAYERS
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <div className="text-sm font-medium text-black">1st: {challenge.firstPrize} WLD</div>
                        <div className="text-xs text-gray-600">2nd: {challenge.secondPrize} • 3rd: {challenge.thirdPrize}</div>
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-1 ml-auto"></div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleChallengeClick(challenge._id, e, e.currentTarget)
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // SUPER RADICAL: Action immédiate sur mousedown
                          handleChallengeClick(challenge._id, e, e.currentTarget)
                        }}
                        onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                        disabled={navigatingToChallengeId === challenge._id}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-none whitespace-nowrap ${
                          navigatingToChallengeId === challenge._id
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-900'
                        }`}
                        style={{
                          outline: 'none'
                        }}
                      >
                        {navigatingToChallengeId === challenge._id ? 'Joining...' : 'Join Challenge'}
                      </button>
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