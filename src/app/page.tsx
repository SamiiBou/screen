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
            {isAuthenticated && user?.walletAddress === '0x21bee69e692ceb4c02b66c7a45620684904ba395' && (
              <div className="flex items-center gap-4">
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
            
            <div className="flex flex-col items-center space-y-4 mt-8">
              {isAuthenticated && (
                <div className="flex flex-col items-center space-y-1">
                  <HodlBalance className="text-base px-6 py-3" />
                  <p className="text-[8px] text-gray-300 text-center opacity-60">
                    0.5 HODL tokens every 2h
                  </p>
                </div>
              )}
            </div>
          </motion.div>



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
              className="space-y-6"
            >
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group apple-card challenge-card hover:shadow-apple-xl transition-all duration-500 cursor-pointer"
                  style={{ userSelect: 'none' }}
                  onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                  onTouchStart={() => preloadChallengeOnHover(challenge._id)}
                  onClick={(e) => handleChallengeClick(challenge._id, e)}
                >
                  {/* Header minimaliste */}
                  <div className="px-8 pt-6 pb-4 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full status-pulse"></div>
                          <span className="apple-text-primary text-sm font-medium apple-text-depth">Challenge #{index + 1}</span>
                          <div className="px-2 py-0.5 bg-emerald-50 rounded-md">
                            <span className="text-emerald-600 text-[10px] font-medium tracking-wide">LIVE</span>
                          </div>
                        </div>
                        <p className="apple-text-secondary text-xs">Top 3 longest holders win</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      
                      {/* Entry Fee - Design ultra-minimaliste Apple */}
                      <div className="space-y-4">
                        <span className="apple-text-secondary text-[10px] uppercase tracking-[0.5px] font-medium">Entry Requirement</span>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-3 px-3 bg-gray-50/40 rounded-md border border-gray-100/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="apple-text-primary text-xs font-medium">Entry Cost</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="apple-text-primary text-lg font-semibold tabular-nums apple-text-depth">{challenge.participationPrice}</span>
                              <Image src="/WLD.png" alt="WLD" width={14} height={14} className="opacity-70" />
                            </div>
                          </div>
                          
                          {/* Participation indicator */}
                          <div className="flex items-center justify-between py-2 px-3">
                            <span className="apple-text-secondary text-[10px] font-medium">Participants</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-100 rounded-full h-1">
                                <div 
                                  className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                                  style={{ width: `${(challenge.currentParticipants / challenge.maxParticipants) * 100}%` }}
                                ></div>
                              </div>
                              <span className="apple-text-secondary text-xs font-medium tabular-nums">
                                {challenge.currentParticipants}/{challenge.maxParticipants}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Prize Pool - Design ultra-minimaliste Apple */}
                      <div className="space-y-4">
                        <span className="apple-text-secondary text-[10px] uppercase tracking-[0.5px] font-medium">Prize Distribution</span>
                        
                        {/* Liste verticale des prizes */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-2 px-3 bg-gray-50/50 rounded-md hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span className="apple-text-primary text-xs font-medium">1st Place</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="apple-text-primary text-sm font-semibold tabular-nums">{challenge.firstPrize}</span>
                              <Image src="/WLD.png" alt="WLD" width={12} height={12} className="opacity-70" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between py-2 px-3 bg-gray-50/30 rounded-md hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <span className="apple-text-secondary text-xs font-medium">2nd Place</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="apple-text-primary text-sm font-medium tabular-nums">{challenge.secondPrize}</span>
                              <Image src="/WLD.png" alt="WLD" width={12} height={12} className="opacity-70" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between py-2 px-3 bg-gray-50/20 rounded-md hover:bg-gray-50/40 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              <span className="apple-text-secondary text-xs font-medium">3rd Place</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="apple-text-primary text-sm font-medium tabular-nums">{challenge.thirdPrize}</span>
                              <Image src="/WLD.png" alt="WLD" width={12} height={12} className="opacity-70" />
                            </div>
                          </div>
                          
                          {/* Total prize pool subtle indicator */}
                          <div className="pt-2 mt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="apple-text-secondary text-[10px] font-medium">Total Pool</span>
                              <div className="flex items-center space-x-1">
                                <span className="apple-text-secondary text-xs font-medium tabular-nums">
                                  {(Number(challenge.firstPrize) + Number(challenge.secondPrize) + Number(challenge.thirdPrize)) || 0}
                                </span>
                                <span className="apple-text-secondary text-[10px]">WLD</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer avec boutons */}
                  <div className="px-8 pb-6 space-y-4">
                    {/* Demo Button */}
                    <div className="text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowQuickGame(true)
                        }}
                        className="apple-text-secondary hover:apple-text-primary transition-colors text-xs font-medium"
                      >
                        Try demo first
                      </button>
                    </div>

                    {/* Join Button - Style Apple */}
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
                      className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 apple-focus ${
                        navigatingToChallengeId === challenge._id
                          ? 'bg-gray-100 apple-text-secondary cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-900 active:scale-98 shadow-apple-small hover:shadow-apple-medium'
                      }`}
                      style={{ outline: 'none' }}
                    >
                      {navigatingToChallengeId === challenge._id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Joining...</span>
                        </div>
                      ) : (
                        <span>Join Challenge</span>
                      )}
                    </button>
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
