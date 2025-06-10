'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { apiService, LeaderboardEntry } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { useChallenges } from '@/contexts/ChallengesContext'
import AuthGate from '@/components/AuthGate'
import { AceternityButton } from '@/components/ui/AceternityButton'
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js'

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

interface ParticipationStatus {
  canParticipate: boolean
  needsPayment: boolean
  hasPendingPayment: boolean
  hasPaid: boolean
  participationPrice: number
}

// Composant pour afficher le classement du challenge
function ChallengeLeaderboard({ challengeId }: { challengeId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (challengeId) {
      loadLeaderboard()
    }
  }, [challengeId])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getChallengeLeaderboard(challengeId, 1, 10) // Top 10
      console.log('📊 Données du classement reçues:', data)
      setLeaderboard(data.leaderboard || [])
      
      // Log des entrées individuelles pour debug
      if (data.leaderboard && data.leaderboard.length > 0) {
        data.leaderboard.forEach((entry: LeaderboardEntry, index: number) => {
          console.log(`👤 Entrée ${index + 1}:`, {
            username: entry.username,
            timeHeld: entry.timeHeld,
            challengesCompleted: entry.challengesCompleted,
            rank: entry.rank
          })
        })
      }
    } catch (error: any) {
      console.error('Error loading leaderboard:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (ms: number) => {
    // Log des valeurs pour debug
    console.log('⏱️ Formatage du temps:', ms)
    
    // Si la valeur semble être trop petite (probablement en centisecondes), la convertir
    let timeInMs = ms
    if (ms < 1000 && ms > 0) {
      // Probablement en centisecondes, convertir en millisecondes
      timeInMs = ms * 10
      console.log('🔄 Conversion centisecondes → millisecondes:', ms, '→', timeInMs)
    }
    
    const seconds = Math.floor(timeInMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else if (seconds > 0) {
      return `${seconds}s`
    } else if (timeInMs > 0) {
      return `${Math.floor(timeInMs)}ms`
    } else {
      return '0s'
    }
  }

  const getRankDisplay = (rank: number) => {
    return rank
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-black'
      case 2: return 'text-gray-600'
      case 3: return 'text-gray-600'
      default: return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-50 rounded-xl p-6 mt-8"
      >
        <h3 className="text-2xl font-light text-black mb-8">Classement</h3>
        <div className="flex items-center justify-center py-8">
          <motion.div
            className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-50 rounded-xl p-6 mt-8"
      >
        <h3 className="text-lg font-semibold text-black mb-4">🏆 Classement Actuel</h3>
        <p className="text-gray-500 text-center py-4">Impossible de charger le classement</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white border border-gray-100 rounded-2xl p-8 mt-12"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">🏆 Classement Actuel</h3>
        {leaderboard.length > 0 && (
          <span className="text-sm text-gray-500">Top {Math.min(leaderboard.length, 10)}</span>
        )}
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Aucune participation pour le moment</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div className={`text-sm font-medium ${getRankColor(entry.rank)} min-w-[32px] text-center`}>
                  {getRankDisplay(entry.rank)}
                </div>
                <div>
                  <div className="font-medium text-black text-sm">
                    {entry.username}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-black text-sm">
                  {formatTime(entry.timeHeld)}
                </div>
              </div>
            </motion.div>
          ))}
          
          {leaderboard.length > 10 && (
            <div className="text-center py-2 mt-4">
              <AceternityButton
                onClick={() => window.open(`/leaderboard/challenge/${challengeId}`, '_blank')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Voir le classement complet →
              </AceternityButton>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { challenges, updateChallenge, getChallenge, getChallengeImmediate, getChallengeWithFallback, preloadChallenge } = useChallenges()
  
  // MÉTHODE RADICALE: chargement immédiat avec données partielles
  const challengeId = params.id as string
  const immediateChallenge = getChallengeImmediate(challengeId)
  
  const [challenge, setChallenge] = useState<Challenge | null>(
    immediateChallenge && !('isPartial' in immediateChallenge) ? immediateChallenge : null
  )
  const [partialChallenge, setPartialChallenge] = useState<any>(
    immediateChallenge && 'isPartial' in immediateChallenge ? immediateChallenge : null
  )
  const [loading, setLoading] = useState(false)
  const [participationStatus, setParticipationStatus] = useState<ParticipationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const joiningRef = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'info' })
  const [showingPartial, setShowingPartial] = useState(!!partialChallenge)
  const loadingRef = useRef(false)

  // AFFICHAGE RADICAL: Toujours montrer quelque chose, jamais d'écran de chargement vide
  const displayChallenge = challenge || partialChallenge

  useEffect(() => {
    if (challengeId && !loadingRef.current) {
      loadingRef.current = true
      console.log('🚀 [RADICAL] Starting ultra-fast challenge load for:', challengeId)
      
      // STRATÉGIE RADICALE: Chargement parallèle et immédiat
      Promise.all([
        loadChallengeDataRadical(),
        loadParticipationStatus()
      ]).finally(() => {
        loadingRef.current = false
      })
    }
  }, [challengeId])
  
  // HYPER RADICAL: Injection CSS globale pour éliminer TOUT comportement de sélection
  useEffect(() => {
    console.log('💥 [HYPER RADICAL] Injecting global CSS to eliminate ALL selection behaviors!')
    const style = document.createElement('style')
    style.id = 'hyper-radical-no-select'
    style.textContent = `
      * {
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        outline: none !important;
      }
      body {
        touch-action: manipulation !important;
      }
      div, button, span {
        -webkit-tap-highlight-color: transparent !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      const existingStyle = document.getElementById('hyper-radical-no-select')
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: 'info' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  // MÉTHODE RADICALE: Chargement ultra-optimisé avec fallback intelligent
  const loadChallengeDataRadical = async () => {
    try {
      console.log('⚡ [RADICAL] Ultra-fast challenge loading for:', challengeId)
      
      // Si on a déjà le challenge complet, ne rien charger
      if (challenge) {
        console.log('✅ [RADICAL] Challenge already loaded, skipping API call')
        setShowingPartial(false)
        return
      }
      
      // Utiliser le cache intelligent avec stale-while-revalidate
      const cachedChallenge = await getChallengeWithFallback(challengeId)
      
      if (cachedChallenge) {
        console.log('✅ [RADICAL] Challenge loaded successfully:', cachedChallenge.title)
        setChallenge(cachedChallenge)
        setPartialChallenge(null)
        setShowingPartial(false)
        updateChallenge(cachedChallenge)
      } else {
        // Fallback: essayer un appel API direct
        console.log('⚠️ [RADICAL] Cache miss, trying direct API call')
        setLoading(true)
        const challengeResponse = await apiService.getChallengeById(challengeId)
        
        if (challengeResponse?.challenge) {
          setChallenge(challengeResponse.challenge)
          setPartialChallenge(null)
          setShowingPartial(false)
          updateChallenge(challengeResponse.challenge)
          console.log('✅ [RADICAL] Direct API call successful')
        } else {
          setError('Challenge not found')
        }
      }
    } catch (error: any) {
      console.error('❌ [RADICAL] Error in radical loading:', error)
      // Ne pas écraser l'affichage partiel en cas d'erreur
      if (!partialChallenge && !challenge) {
        setError(`Failed to load challenge: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadParticipationStatus = async () => {
    try {
      console.log('🔍 [CHALLENGE DEBUG] Checking participation status...')
      const participationResponse = await apiService.canParticipateInChallenge(challengeId)
      console.log('📊 [CHALLENGE DEBUG] Participation response:', participationResponse)
      setParticipationStatus(participationResponse)
    } catch (err) {
      console.error('❌ [CHALLENGE DEBUG] Error checking participation:', err)
      setParticipationStatus({
        canParticipate: true,
        needsPayment: false,
        hasPendingPayment: false,
        hasPaid: true,
        participationPrice: 0
      })
    }
  }

  const handlePayForChallenge = async () => {
    const currentChallenge = challenge || displayChallenge
    if (!currentChallenge || !user || paymentLoading || showingPartial) return
    
    console.log('💰 [CHALLENGE PAYMENT] Starting payment for challenge:', challengeId)
    setPaymentLoading(true)
    setNotification({ show: true, message: "Initiating payment...", type: "info" })

    try {
      if (!MiniKit.isInstalled()) {
        console.error('💰 [CHALLENGE PAYMENT] ❌ MiniKit not installed')
        setNotification({ show: true, message: "World App / MiniKit not detected", type: "error" })
        setPaymentLoading(false)
        return
      }

      console.log('💰 [CHALLENGE PAYMENT] 📡 Initiating payment with backend...')
      
      const initResponse = await apiService.initiateChallengePayment(challengeId)
      console.log('💰 [CHALLENGE PAYMENT] 📨 Initiate response:', initResponse)

      const { reference, participationPrice, paymentAddress } = initResponse
      console.log('💰 [CHALLENGE PAYMENT] ✅ Payment initiated successfully:', { reference, participationPrice })

      // Prepare payload for World Pay - CORRECTION: utiliser tokenToDecimals
      const payload: PayCommandInput = {
        reference: reference,
        to: paymentAddress,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(participationPrice, Tokens.WLD).toString(),
          }
        ],
        description: `Join challenge: ${currentChallenge.title}`,
        network: 'worldchain' // Ajout explicite du réseau
      }

      console.log('💰 [CHALLENGE PAYMENT] 💰 Payment payload prepared:', payload)

      setNotification({ show: true, message: "Confirming payment...", type: "info" })
      
      console.log('💰 [CHALLENGE PAYMENT] 📱 Sending payment via MiniKit...')
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload)

      console.log('💰 [CHALLENGE PAYMENT] 📱 MiniKit response received:', finalPayload)

      if (finalPayload.status === 'success') {
        console.log('💰 [CHALLENGE PAYMENT] ✅ Payment successful! Transaction ID:', finalPayload.transaction_id)
        
        // CORRECTION: Envoyer transaction_id tel quel (pas de transformation)
        const confirmResponse = await apiService.confirmChallengePayment(reference, finalPayload.transaction_id)
        console.log('💰 [CHALLENGE PAYMENT] 📨 Confirm response:', confirmResponse)

        if (confirmResponse.success) {
          setNotification({ 
            show: true, 
            message: `Payment successful! You can now join the challenge.`, 
            type: "success" 
          })
          // Reload participation status
          await loadParticipationStatus()
          console.log('💰 [CHALLENGE PAYMENT] ✅ Payment completed successfully!')
        } else {
          throw new Error('Payment confirmation failed')
        }
      } else {
        console.log('💰 [CHALLENGE PAYMENT] ❌ Payment failed or cancelled:', finalPayload)
        
        let errorMessage = "Payment cancelled or failed"
        if (finalPayload.error_code === 'user_rejected') {
          errorMessage = "Payment cancelled by user"
        } else if (finalPayload.error_code === 'transaction_failed') {
          errorMessage = "Transaction failed. Please check your wallet balance and try again."
        }
        
        setNotification({ 
          show: true, 
          message: errorMessage, 
          type: "error" 
        })
      }
    } catch (error: any) {
      console.error('💰 [CHALLENGE PAYMENT] ❌ CRITICAL ERROR:', error)
      setNotification({ 
        show: true, 
        message: error.message || "Payment failed", 
        type: "error" 
      })
    } finally {
      setPaymentLoading(false)
      console.log('💰 [CHALLENGE PAYMENT] 🏁 Payment flow ended')
    }
  }

  // MÉTHODE HYPER RADICALE FIXE: Action immédiate sans erreur
  const handleParticipate = useCallback(() => {
    console.log('💥 [HYPER RADICAL FIX] IMMEDIATE ACTION!')
    
    // Vérification rapide
    if (joiningRef.current) {
      console.log('🚫 [HYPER RADICAL FIX] Already processing')
      return
    }
    
    const currentChallenge = challenge || displayChallenge
    if (!currentChallenge || !user || showingPartial) {
      console.log('❌ [HYPER RADICAL FIX] Validation failed')
      return
    }
    
    // Verrouillage immédiat
    joiningRef.current = true
    console.log('🔒 [HYPER RADICAL FIX] LOCKED!')
    
    // Transformation du bouton
    if (buttonRef.current) {
      const btn = buttonRef.current
      btn.disabled = true
      btn.style.backgroundColor = '#d1d5db'
      btn.style.color = '#9ca3af'
      btn.style.cursor = 'not-allowed'
      btn.style.pointerEvents = 'none'
      btn.textContent = 'Joining...'
      console.log('⚡ [HYPER RADICAL FIX] Button transformed!')
    }
    
    setIsJoining(true)
    
    // Vérification paiement rapide
    if (currentChallenge.participationPrice > 0) {
      if (!participationStatus?.hasPaid) {
        console.log('💰 [HYPER RADICAL FIX] Payment required')
        setNotification({ show: true, message: "Payment required!", type: "error" })
        
        // Reset rapide
        joiningRef.current = false
        if (buttonRef.current) {
          const btn = buttonRef.current
          btn.disabled = false
          btn.style.backgroundColor = '#000000'
          btn.style.color = '#ffffff'
          btn.style.cursor = 'pointer'
          btn.style.pointerEvents = 'auto'
          btn.textContent = 'Join Challenge'
        }
        setIsJoining(false)
        return
      }
    }
    
    // Navigation instantanée
    console.log('🚀 [HYPER RADICAL FIX] NAVIGATING NOW!')
    setIsNavigating(true)
    
    if (buttonRef.current) {
      const btn = buttonRef.current
      btn.textContent = 'Starting Game...'
    }
    
    // Navigation directe
    router.push(`/game?challengeId=${challengeId}`)
    console.log('✅ [HYPER RADICAL FIX] Navigation triggered!')
    
  }, [challenge, displayChallenge, user, showingPartial, challengeId, participationStatus, router])

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

  if (loading && !displayChallenge) {
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

  if (error && !displayChallenge) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
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
    <div 
      className="min-h-screen bg-white"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      
      {/* Header */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <AceternityButton 
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-black transition-colors text-sm font-medium"
            >
              ← Back
            </AceternityButton>
            
            <motion.h1 
              className="text-lg font-medium text-black"
              whileHover={{ scale: 1.02 }}
            >
              Challenge
            </motion.h1>
            
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <div 
        className="pt-24 pb-12 px-6"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        <div 
          className="max-w-4xl mx-auto"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-light text-black mb-8 tracking-tight">
              {displayChallenge?.title}
              {showingPartial && (
                <motion.span 
                  className="text-sm text-gray-400 block mt-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading details...
                </motion.span>
              )}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-8 mb-16 max-w-lg mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-light text-black mb-1">
                {showingPartial ? '???' : displayChallenge?.firstPrize || '0'} WLD
              </div>
              <div className="text-gray-400 text-xs font-medium">1ST PRIZE</div>
              <div className="text-sm text-gray-600 mt-1">
                {showingPartial ? 'Loading...' : `2nd: ${displayChallenge?.secondPrize || 0} • 3rd: ${displayChallenge?.thirdPrize || 0}`}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-black mb-1">
                {showingPartial ? '???' : displayChallenge?.currentParticipants || '0'}
                <span className="text-gray-300">/{showingPartial ? '???' : displayChallenge?.maxParticipants || '0'}</span>
              </div>
              <div className="text-gray-400 text-sm font-medium">PLAYERS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-black mb-1">{displayChallenge?.participationPrice || 0} WLD</div>
              <div className="text-gray-400 text-sm font-medium">ENTRY FEE</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {/* Notification */}
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-4 rounded-xl text-sm ${
                  notification.type === 'success' ? 'bg-green-50 text-green-700' :
                  notification.type === 'error' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}
              >
                {notification.message}
              </motion.div>
            )}

            {displayChallenge?.status === 'active' && participationStatus && (
              <div 
                className="space-y-6"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {/* Debug: Show what should be displayed */}
                {console.log('🖥️ [UI DEBUG] Rendering UI with conditions:', {
                  challengeStatus: displayChallenge?.status,
                  participationPrice: displayChallenge?.participationPrice,
                  needsPayment: participationStatus.needsPayment,
                  hasPendingPayment: participationStatus.hasPendingPayment,
                  canParticipate: participationStatus.canParticipate,
                  hasPaid: participationStatus.hasPaid,
                  showingPartial
                })}
                
                {/* Need to pay for challenge */}
                {participationStatus.needsPayment && displayChallenge?.participationPrice > 0 && (
                  <div className="space-y-4">
                    {console.log('🖥️ [UI DEBUG] Showing PAYMENT BUTTON')}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <p className="text-yellow-800 text-sm">
                        💰 This challenge requires a {displayChallenge?.participationPrice} WLD entry fee
                      </p>
                    </div>
                    <AceternityButton
                      onClick={handlePayForChallenge}
                      disabled={paymentLoading}
                      className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                        paymentLoading 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105'
                      }`}
                    >
                      {paymentLoading ? 'Processing Payment...' : `Pay ${displayChallenge?.participationPrice} WLD to Join`}
                    </AceternityButton>
                  </div>
                )}

                {/* Payment pending */}
                {participationStatus.hasPendingPayment && (
                  <div className="bg-blue-50 rounded-2xl p-6">
                    {console.log('🖥️ [UI DEBUG] Showing PENDING PAYMENT')}
                    <p className="text-blue-700 text-sm">
                      ⏳ Payment in progress... Please wait for confirmation.
                    </p>
                  </div>
                )}

                {/* Can participate (paid or free) */}
                {participationStatus.canParticipate && (
                  <div 
                    className="space-y-4"
                    style={{
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    {console.log('🖥️ [UI DEBUG] Showing JOIN CHALLENGE BUTTON')}
                    {displayChallenge?.participationPrice > 0 && participationStatus.hasPaid && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <p className="text-green-800 text-sm">
                          ✅ Payment confirmed! You can now join the challenge.
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      ref={buttonRef}
                      className="px-8 py-3 rounded-full text-sm font-medium bg-black text-white hover:bg-gray-900 cursor-pointer select-none text-center relative z-50"
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        isolation: 'isolate'
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleParticipate()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleParticipate()
                      }}
                      disabled={isJoining || isNavigating || showingPartial}
                    >
                      {isJoining ? 'Joining...' : isNavigating ? 'Starting...' : showingPartial ? 'Loading...' : 'Join Challenge'}
                    </button>
                  </div>
                )}

                {/* Already participating */}
                {!participationStatus.canParticipate && !participationStatus.needsPayment && !participationStatus.hasPendingPayment && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    {console.log('🖥️ [UI DEBUG] Showing ALREADY PARTICIPATING')}
                    <p className="text-gray-500 text-sm">
                      You're already participating in this challenge
                    </p>
                  </div>
                )}
              </div>
            )}

            {displayChallenge?.status === 'upcoming' && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-500 text-sm">
                  {showingPartial ? 'Loading start date...' : `Challenge starts ${formatDate(displayChallenge.startDate)}`}
                </p>
                {displayChallenge?.participationPrice > 0 && (
                  <p className="text-gray-400 text-xs mt-2">
                    Entry fee: {displayChallenge.participationPrice} WLD
                  </p>
                )}
              </div>
            )}

            {displayChallenge?.status === 'completed' && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-500 text-sm">
                  This challenge has ended
                </p>
              </div>
            )}
          </motion.div>

          <ChallengeLeaderboard challengeId={challengeId} />

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
