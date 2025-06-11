'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { useChallenges } from '@/contexts/ChallengesContext'
import { AceternityButton } from '@/components/ui/AceternityButton'
import AuthGate from '@/components/AuthGate'
import AddChallengeForm from '@/components/AddChallengeForm'
import QuickGame from '@/components/QuickGame'
import HodlBalance from '@/components/HodlBalance'
import Image from 'next/image'

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
  const [showQuickGame, setShowQuickGame] = useState(false)
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
        challenges.slice(0, 3).forEach((challenge: Challenge, index: number) => {
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
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              <Image 
                src="/HODL_LOGO.png" 
                alt="HODL Logo" 
                width={400} 
                height={120} 
                className="h-20 w-auto"
              />
            </motion.div>
            
            {/* Add Challenge dans le header */}
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <HodlBalance />
                <AddChallengeForm onSuccess={async () => {
                  setLoading(true)
                  try {
                    const response = await apiService.getActiveChallenges()
                    const challenges = response.challenges || []
                    setActiveChallenges(challenges)
                    setChallengesList(challenges)
                    challenges.slice(0, 3).forEach((challenge: Challenge, index: number) => {
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
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-light text-black mb-8 leading-none tracking-tight">
              THE ULTIMATE
              <br />
              <span className="bg-gradient-to-r from-black via-gray-700 to-black bg-clip-text text-transparent">ENDURANCE CHALLENGE</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light mb-8 leading-relaxed">
              Join the ultimate endurance challenge.<br/>
              <span className="text-gray-400">Top 3 longest holders share the prize pool.</span>
            </p>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setShowQuickGame(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium underline decoration-dotted underline-offset-4"
              >
                Try a quick demo first
              </button>
            </div>
          </motion.div>


          {/* Active Challenges Header */}
          {activeChallenges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center space-x-3 text-xl text-gray-700">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">{activeChallenges.length} Active Challenges</span>
              </div>
            </motion.div>
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
                    challenges.slice(0, 3).forEach((challenge: Challenge, index: number) => {
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
              className="space-y-8"
            >
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-100 rounded-3xl p-8 hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-lg transition-all duration-300 select-none backdrop-blur-sm"
                  style={{ userSelect: 'none' }}
                  onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                  onTouchStart={() => preloadChallengeOnHover(challenge._id)}
                >
                  <div className="flex flex-col space-y-6 group cursor-pointer" 
                       onClick={(e) => handleChallengeClick(challenge._id, e)}
                       onMouseEnter={() => preloadChallengeOnHover(challenge._id)}>
                    
                    {/* Header avec titre du challenge */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Challenge #{index + 1}</h3>
                      <p className="text-sm text-gray-500">Top 3 longest holders share the prize pool</p>
                    </div>
                    
                    {/* Contenu principal en grille */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    
                    {/* Status & Player Count */}
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-500 text-sm font-semibold tracking-wide">
                        {challenge.currentParticipants}/{challenge.maxParticipants}
                      </span>
                      <div className="px-3 py-1 bg-emerald-50 rounded-full">
                        <span className="text-emerald-600 text-xs font-medium">LIVE</span>
                      </div>
                    </div>

                    {/* Entry Fee */}
                    <div className="flex flex-col items-center space-y-3">
                      <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Entry Fee</span>
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <Image 
                          src="/WLD.png" 
                          alt="Worldcoin" 
                          width={16} 
                          height={16} 
                          className="drop-shadow-sm"
                        />
                        <span className="text-base font-bold text-gray-700 font-mono tabular-nums">{challenge.participationPrice}</span>
                        <span className="text-xs text-gray-500 font-medium">WLD</span>
                      </div>
                    </div>

                    {/* Prizes */}
                    <div className="flex flex-col items-center space-y-4">
                      <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Prize Pool</span>
                      <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <div className="flex items-center justify-between w-full px-2">
                            <Image src="/WLD.png" alt="Worldcoin" width={16} height={16} className="drop-shadow-sm" />
                            <span className="text-sm font-bold text-gray-800 font-mono tabular-nums">{challenge.firstPrize} WLD</span>
                            <span></span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <div className="w-5 h-5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <div className="flex items-center justify-between w-full px-2">
                            <Image src="/WLD.png" alt="Worldcoin" width={14} height={14} className="drop-shadow-sm" />
                            <span className="text-sm font-semibold text-gray-700 font-mono tabular-nums">{challenge.secondPrize} WLD</span>
                            <span></span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2 p-2 bg-gradient-to-b from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                          <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <div className="flex items-center justify-between w-full px-2">
                            <Image src="/WLD.png" alt="Worldcoin" width={12} height={12} className="drop-shadow-sm" />
                            <span className="text-xs font-semibold text-gray-600 font-mono tabular-nums">{challenge.thirdPrize} WLD</span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Join Button */}
                    <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleChallengeClick(challenge._id, e, e.currentTarget)
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleChallengeClick(challenge._id, e, e.currentTarget)
                        }}
                        onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                        disabled={navigatingToChallengeId === challenge._id}
                        className={`px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 border-none shadow-lg ${
                          navigatingToChallengeId === challenge._id
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black hover:scale-110 hover:shadow-2xl active:scale-95 transform'
                        }`}
                        style={{ outline: 'none' }}
                      >
                        {navigatingToChallengeId === challenge._id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Joining...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>JOIN GAME</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Game Modal */}
      <AnimatePresence>
        {showQuickGame && (
          <QuickGame onClose={() => setShowQuickGame(false)} />
        )}
      </AnimatePresence>
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
