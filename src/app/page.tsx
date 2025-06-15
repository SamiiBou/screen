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
import { FaTelegramPlane } from 'react-icons/fa'
import AddDuelChallengeForm from '@/components/AddDuelChallengeForm'

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
  createdBy?: string
  creator?: string
  participants?: Array<{
    user?: string
    userId?: string
    userHash?: string
    walletAddress?: string
  }>
}

// Type representing the two possible game modes handled by the page
type GameMode = '1v1' | 'multiplayer'

function HomePage() {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [navigatingToChallengeId, setNavigatingToChallengeId] = useState<string | null>(null)
  const [showQuickGame, setShowQuickGame] = useState(false)
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showDuels, setShowDuels] = useState(false)
  const [showMyDuels, setShowMyDuels] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const challengesPerPage = 3
  const navigatingRef = useRef<Record<string, boolean>>({})
  const { user, isAuthenticated } = useAuth()
  const { setChallengesList, preloadChallenge } = useChallenges()
  const router = useRouter()

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        // Charger les challenges actifs et complétés en parallèle
        const [activeResponse, completedResponse] = await Promise.all([
          apiService.getActiveChallenges(),
          apiService.getCompletedChallenges()
        ])
        
        const activeChallengesData = activeResponse.challenges || []
        const completedChallengesData = completedResponse.challenges || []
        
        setActiveChallenges(activeChallengesData)
        setCompletedChallenges(completedChallengesData)
        setFilteredChallenges(activeChallengesData)
        
        // Mettre à jour le cache des challenges (uniquement les actifs pour la navigation)
        setChallengesList(activeChallengesData)
        
        // PRÉCHARGEMENT RADICAL: Charger les 3 premiers challenges actifs en arrière-plan
        console.log('🔥 [RADICAL PRELOAD] Starting aggressive preloading...')
        activeChallengesData.slice(0, 3).forEach((challenge: Challenge, index: number) => {
          setTimeout(() => {
            preloadChallenge(challenge._id).catch(console.error)
          }, index * 100) // Étaler les requêtes
        })
      } catch (error) {
        console.error('Error loading challenges:', error)
        setActiveChallenges([])
        setCompletedChallenges([])
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  // Filtrage par prix d'entrée et mode de jeu
  useEffect(() => {
    if (!gameMode) return // Ne pas filtrer si aucun mode sélectionné
    
    let sourceChallenges
    if (showMyDuels) {
      // Pour "My Duels", on combine actifs et complétés créés par l'utilisateur OU auxquels il participe
      sourceChallenges = [...activeChallenges, ...completedChallenges].filter(ch => {
        const userId = user?.id || user?.walletAddress
        if (!userId) return false
        
        // Duels créés par l'utilisateur
        const isCreatedByUser = (ch.createdBy && ch.createdBy === userId) || (ch.creator && ch.creator === userId)
        
        // Duels auxquels l'utilisateur participe
        const isParticipating = ch.participants && ch.participants.some(p => 
          (p.user && p.user === userId) || 
          (p.userId && p.userId === userId) || 
          (p.userHash && p.userHash === userId) ||
          (p.walletAddress && p.walletAddress === userId)
        )
        
        return isCreatedByUser || isParticipating
      })
    } else {
      sourceChallenges = showCompleted ? completedChallenges : activeChallenges
    }
    
    let filtered = sourceChallenges

    if (gameMode === '1v1') {
      filtered = filtered.filter(ch => ch.maxParticipants === 2)
    } else {
      filtered = filtered.filter(ch => ch.maxParticipants !== 2)
    }
    
    if (selectedPriceFilter !== null) {
      filtered = filtered.filter(challenge =>
        challenge.participationPrice === selectedPriceFilter
      )
    }
    
    setFilteredChallenges(filtered)
    setCurrentPage(1) // Reset à la page 1 quand on filtre
  }, [activeChallenges, completedChallenges, selectedPriceFilter, showCompleted, showMyDuels, gameMode, user])

  // Pagination
  const totalPages = Math.ceil(filteredChallenges.length / challengesPerPage)
  const paginatedChallenges = filteredChallenges.slice(
    (currentPage - 1) * challengesPerPage,
    currentPage * challengesPerPage
  )

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
    
    // SUPER RADICAL 2: plus de manipulation DOM directe – on s'appuie sur l'état React
    if (buttonElement) {
      console.log('🔥 [SUPER RADICAL HOME] Button pressed – UI handled by React state')
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
            
            {/* Bouton de retour - plus simple */}
            <div className="flex items-center gap-4">
              {gameMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGameMode(null)
                    setSelectedPriceFilter(null)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all duration-200"
                >
                  <span>←</span>
                  <span>Back to Mode Selection</span>
                </motion.button>
              )}
              
              {/* Telegram Join Button */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="social-btn telegram-btn"
                onClick={() => window.open('https://t.me/+P6wLDBy5fBExMDZk', '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  backgroundColor: 'rgba(0, 136, 204, 0.08)',
                  border: '1px solid rgba(0, 136, 204, 0.2)',
                  color: '#0088cc'
                }}
              >
                <FaTelegramPlane size={18} />
                <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>Join Us</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero simplifié */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex flex-col items-center space-y-4">
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

          {/* Mode Selection ou Challenges */}
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
          ) : !gameMode ? (
            /* Sélecteur de mode simplifié et élégant */
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-light text-black mb-3 leading-none tracking-tight">Choose Your Mode</h3>
                <p className="apple-text-secondary text-sm">Select how you want to compete</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1v1 Duel Mode Card - En premier */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setGameMode('1v1')}
                  className="group apple-card challenge-card duel-card hover:shadow-apple-xl transition-all duration-500 cursor-pointer"
                  style={{ userSelect: 'none' }}
                >
                  {/* Header compact */}
                  <div className="px-6 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                          <span className="apple-text-primary text-base font-medium apple-text-depth">⚔️ 1v1 Duel</span>
                          <div className="px-1.5 py-0.5 rounded bg-red-50">
                            <span className="text-[9px] font-medium tracking-wide text-red-600">DUEL</span>
                          </div>
                        </div>
                        <p className="apple-text-secondary text-xs">Face off head-to-head</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu ultra-compact */}
                  <div className="px-6 py-4">
                    <div className="text-center">
                      <p className="apple-text-primary text-sm mb-4">
                        Just 2 players battle<br/>
                        <span className="apple-text-secondary text-xs">Winner takes most</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer compact */}
                  <div className="px-6 pb-4">
                    <button
                      type="button"
                      className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 apple-focus bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 active:scale-98 shadow-lg hover:shadow-xl"
                      style={{ outline: 'none' }}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>⚔️</span>
                        <span>Enter Duel</span>
                      </span>
                    </button>
                  </div>
                </motion.div>
                
                {/* Multi-Player Mode Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setGameMode('multiplayer')}
                  className="group apple-card challenge-card hover:shadow-apple-xl transition-all duration-500 cursor-pointer"
                  style={{ userSelect: 'none' }}
                >
                  {/* Header compact */}
                  <div className="px-6 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          <span className="apple-text-primary text-base font-medium apple-text-depth">🏆 Multi-Player</span>
                          <div className="px-1.5 py-0.5 rounded bg-blue-50">
                            <span className="text-[9px] font-medium tracking-wide text-blue-600">TOURNAMENT</span>
                          </div>
                        </div>
                        <p className="apple-text-secondary text-xs">Compete against thousands</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu ultra-compact */}
                  <div className="px-6 py-4">
                    <div className="text-center">
                      <p className="apple-text-primary text-sm mb-4">
                        Join massive tournaments<br/>
                        <span className="apple-text-secondary text-xs">Top 3 share prize pool</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer compact */}
                  <div className="px-6 pb-4">
                    <button
                      type="button"
                      className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 apple-focus bg-black text-white hover:bg-gray-900 active:scale-98 shadow-apple-small hover:shadow-apple-medium"
                      style={{ outline: 'none' }}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>🏆</span>
                        <span>Enter Tournament</span>
                      </span>
                    </button>
                  </div>
                </motion.div>
              </div>
              
              {/* Quick Game Option */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-6"
              >
                <button 
                  onClick={() => setShowQuickGame(true)}
                  className="apple-text-secondary hover:apple-text-primary transition-colors text-sm font-medium"
                >
                  Try demo first
                </button>
              </motion.div>
            </motion.div>
          ) : gameMode ? (
            <div className="max-w-6xl mx-auto">
              {/* Header Section - Titre minimaliste */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className={`w-2 h-2 rounded-full ${
                    gameMode === '1v1' ? 'bg-black' : 'bg-black'
                  }`}></div>
                  <h1 className="text-4xl font-light text-black tracking-tight">
                    {gameMode === '1v1' ? 'Duels' : 'Tournaments'}
                  </h1>
                  <div className={`w-2 h-2 rounded-full ${
                    gameMode === '1v1' ? 'bg-black' : 'bg-black'
                  }`}></div>
                </div>
                <p className="text-gray-500 text-lg font-light max-w-md mx-auto">
                  {gameMode === '1v1' 
                    ? 'Face-to-face competition. Winner takes most.'
                    : 'Compete against thousands. Top 3 share rewards.'
                  }
                </p>
              </motion.div>


              {/* Onglets Active/Past/My Duels avec boutons de création subtils */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <div className="flex flex-col items-center space-y-4">
                  {/* Onglets principaux */}
                  <div className="flex items-center space-x-0 bg-white border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => {
                        setShowCompleted(false)
                        setShowMyDuels(false)
                      }}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        !showCompleted && !showMyDuels
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      Active ({activeChallenges.filter(ch => gameMode === '1v1' ? ch.maxParticipants === 2 : ch.maxParticipants !== 2).length})
                    </button>
                    <button
                      onClick={() => {
                        setShowCompleted(true)
                        setShowMyDuels(false)
                      }}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        showCompleted && !showMyDuels
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      Past ({completedChallenges.filter(ch => gameMode === '1v1' ? ch.maxParticipants === 2 : ch.maxParticipants !== 2).length})
                    </button>
                    <button
                      onClick={() => {
                        setShowCompleted(false)
                        setShowMyDuels(true)
                      }}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        showMyDuels
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      My {gameMode === '1v1' ? 'Duels' : 'Tournaments'}
                    </button>
                  </div>
                  
                  {/* Boutons de création subtils - uniquement en mode 1v1 et pas en mode completed/myduels */}
                  {gameMode === '1v1' && !showCompleted && !showMyDuels && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                    >
                      <AddDuelChallengeForm
                        onSuccess={async () => {
                          try {
                            const [activeResponse, completedResponse] = await Promise.all([
                              apiService.getActiveChallenges(),
                              apiService.getCompletedChallenges()
                            ])
                            const activeChallengesData = activeResponse.challenges || []
                            const completedChallengesData = completedResponse.challenges || []
                            setActiveChallenges(activeChallengesData)
                            setCompletedChallenges(completedChallengesData)
                            setFilteredChallenges(showMyDuels ? [...activeChallengesData, ...completedChallengesData].filter(ch => {
                              const userId = user?.id || user?.walletAddress
                              if (!userId) return false
                              const isCreatedByUser = (ch.createdBy && ch.createdBy === userId) || (ch.creator && ch.creator === userId)
                              const isParticipating = ch.participants && ch.participants.some(p => 
                                (p.user && p.user === userId) || (p.userId && p.userId === userId) || (p.userHash && p.userHash === userId) || (p.walletAddress && p.walletAddress === userId)
                              )
                              return isCreatedByUser || isParticipating
                            }) : (showCompleted ? completedChallengesData : activeChallengesData))
                            setChallengesList(activeChallengesData)
                          } catch (error) {
                            console.error('Error refreshing challenges:', error)
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Filtres par prix - Design ultra-minimaliste */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <div className="flex justify-center">
                  <div className="flex items-center space-x-0 bg-white border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => setSelectedPriceFilter(null)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedPriceFilter === null
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedPriceFilter(1)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedPriceFilter === 1
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      1 WLD
                    </button>
                    <button
                      onClick={() => setSelectedPriceFilter(5)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedPriceFilter === 5
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      5 WLD
                    </button>
                    <button
                      onClick={() => setSelectedPriceFilter(10)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedPriceFilter === 10
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      10 WLD
                    </button>
                  </div>
                </div>

                {/* Compteur de résultats simple */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500 font-light">
                    {filteredChallenges.length} {gameMode === '1v1' ? 'duel' : 'tournament'}{filteredChallenges.length !== 1 ? 's' : ''} {selectedPriceFilter !== null ? `· ${selectedPriceFilter} WLD` : ''}
                  </p>
                </div>
              </motion.div>

              {/* Liste des challenges OU message d'état vide */}
              {filteredChallenges.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl text-gray-400">
                        {gameMode === '1v1' ? '⚔️' : '🏆'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-light text-black mb-3">
                      {showMyDuels 
                        ? `No ${gameMode === '1v1' ? 'duels' : 'tournaments'} yet`
                        : selectedPriceFilter !== null 
                        ? `No ${gameMode === '1v1' ? 'duels' : 'tournaments'} found`
                        : `No ${gameMode === '1v1' ? 'duels' : 'tournaments'} available`
                      }
                    </h3>
                    
                    <p className="text-gray-500 mb-8 leading-relaxed">
                      {showMyDuels 
                        ? `You haven't created or joined any ${gameMode === '1v1' ? 'duels' : 'tournaments'} yet. Create one or join an existing one to see it here.`
                        : selectedPriceFilter !== null 
                        ? `Try a different price filter or check back later.`
                        : `${gameMode === '1v1' ? 'New duels' : 'New tournaments'} are created regularly. Check back soon or try the demo.`
                      }
                    </p>

                    <div className="space-y-4">
                      {showMyDuels && gameMode === '1v1' && (
                        <AddDuelChallengeForm
                          onSuccess={async () => {
                            try {
                              const [activeResponse, completedResponse] = await Promise.all([
                                apiService.getActiveChallenges(),
                                apiService.getCompletedChallenges()
                              ])
                              const activeChallengesData = activeResponse.challenges || []
                              const completedChallengesData = completedResponse.challenges || []
                              setActiveChallenges(activeChallengesData)
                              setCompletedChallenges(completedChallengesData)
                              setFilteredChallenges([...activeChallengesData, ...completedChallengesData].filter(ch => {
                                const userId = user?.id || user?.walletAddress
                                if (!userId) return false
                                const isCreatedByUser = (ch.createdBy && ch.createdBy === userId) || (ch.creator && ch.creator === userId)
                                const isParticipating = ch.participants && ch.participants.some(p => 
                                  (p.user && p.user === userId) || (p.userId && p.userId === userId) || (p.userHash && p.userHash === userId) || (p.walletAddress && p.walletAddress === userId)
                                )
                                return isCreatedByUser || isParticipating
                              }))
                              setChallengesList(activeChallengesData)
                            } catch (error) {
                              console.error('Error refreshing challenges:', error)
                            }
                          }}
                        />
                      )}
                      
                      <button 
                        onClick={() => setShowQuickGame(true)}
                        className="bg-black text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-300"
                      >
                        Try Demo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={gameMode === '1v1' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' : 'grid grid-cols-1 max-w-3xl mx-auto gap-6'}
                >
                  {paginatedChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-500 cursor-pointer overflow-hidden"
                  style={{ userSelect: 'none' }}
                  onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                  onTouchStart={() => preloadChallengeOnHover(challenge._id)}
                  onClick={(e) => handleChallengeClick(challenge._id, e)}
                >
                  {/* Header ultra-minimaliste */}
                  <div className="px-8 pt-8 pb-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`w-2 h-2 rounded-full ${
                            challenge.status === 'completed' 
                              ? 'bg-gray-400' 
                              : 'bg-black'
                          }`}></div>
                          <span className="text-lg font-light text-black tracking-tight">
                            {gameMode === '1v1' ? `Duel #${index + 1}` : `Tournament #${index + 1}`}
                          </span>
                          
                          {/* Indicateur My Duels */}
                          {showMyDuels && (user?.id || user?.walletAddress) && (
                            <div className="flex items-center space-x-1">
                              {((challenge.createdBy && challenge.createdBy === (user?.id || user?.walletAddress)) || (challenge.creator && challenge.creator === (user?.id || user?.walletAddress))) ? (
                                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-medium">
                                  Created
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                                  Joined
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          challenge.status === 'completed'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-black text-white'
                        }`}>
                          {challenge.status === 'completed' ? 'Finished' : 'Live'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className="text-2xl font-light text-black">{challenge.participationPrice}</span>
                          <Image src="/WLD.png" alt="WLD" width={20} height={20} className="opacity-60" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Entry Fee</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats section - Minimaliste et clair */}
                  <div className="px-8 pb-6">
                    {/* Participants */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Participants</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-black h-1.5 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${Math.min((challenge.currentParticipants / challenge.maxParticipants) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-black tabular-nums min-w-[40px]">
                          {challenge.currentParticipants}/{challenge.maxParticipants}
                        </span>
                      </div>
                    </div>

                    {/* Prize Distribution */}
                    <div className="space-y-3 pt-4">
                      <p className="text-sm text-gray-600 font-medium mb-3">Prize Pool</p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <span className="text-lg font-light text-black">{challenge.firstPrize}</span>
                            <Image src="/WLD.png" alt="WLD" width={14} height={14} className="opacity-60" />
                          </div>
                          <p className="text-xs text-gray-500">1st</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <span className="text-lg font-light text-black">{challenge.secondPrize}</span>
                            <Image src="/WLD.png" alt="WLD" width={14} height={14} className="opacity-60" />
                          </div>
                          <p className="text-xs text-gray-500">2nd</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <span className="text-lg font-light text-black">{challenge.thirdPrize}</span>
                            <Image src="/WLD.png" alt="WLD" width={14} height={14} className="opacity-60" />
                          </div>
                          <p className="text-xs text-gray-500">3rd</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer avec action button */}
                  <div className="px-8 pb-8">
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (challenge.status === 'completed') {
                          window.open(`/leaderboard/challenge/${challenge._id}`, '_blank')
                        } else {
                          handleChallengeClick(challenge._id, e, e.currentTarget)
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (challenge.status === 'completed') {
                          window.open(`/leaderboard/challenge/${challenge._id}`, '_blank')
                        } else {
                          handleChallengeClick(challenge._id, e, e.currentTarget)
                        }
                      }}
                      onMouseEnter={() => preloadChallengeOnHover(challenge._id)}
                      disabled={navigatingToChallengeId === challenge._id && challenge.status !== 'completed'}
                      className={`w-full py-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                        challenge.status === 'completed'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          : navigatingToChallengeId === challenge._id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98] shadow-sm hover:shadow-md'
                      }`}
                      style={{ outline: 'none' }}
                    >
                      {challenge.status === 'completed' ? (
                        <span>View Results</span>
                      ) : navigatingToChallengeId === challenge._id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Joining...</span>
                        </div>
                      ) : (
                        <span>{gameMode === '1v1' ? 'Join Duel' : 'Join Tournament'}</span>
                      )}
                    </button>
                    
                    {/* Demo link subtle */}
                    <div className="text-center mt-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowQuickGame(true)
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
                      >
                        Try demo first
                      </button>
                    </div>
                  </div>
                </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Pagination minimaliste */}
              {totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center items-center space-x-1 mt-16"
                >
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    →
                  </button>
                </motion.div>
              )}
            </div>
          ) : null}
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
