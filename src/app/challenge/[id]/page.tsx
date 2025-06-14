'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js'
import AceternityButton from '@/components/ui/AceternityButton'
import { useAuth } from '@/contexts/AuthContext'
import { useChallenges } from '@/contexts/ChallengesContext'
import { Challenge, apiService } from '@/utils/api'
import AuthGate from '@/components/AuthGate'
import { LeaderboardEntry } from '@/utils/api'

interface ParticipationStatus {
  canParticipate: boolean
  needsPayment: boolean
  hasPendingPayment: boolean
  hasPaid: boolean
  participationPrice: number
}

function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { challenges, updateChallenge, getChallenge, getChallengeImmediate, getChallengeWithFallback, preloadChallenge } = useChallenges()
  
  // MÉTHODE RADICALE: chargement immédiat avec données partielles
  const challengeId = params?.id as string
  const immediateChallenge = challengeId ? getChallengeImmediate(challengeId) : null

  // Early return if no challengeId
  if (!challengeId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-black text-2xl font-semibold mb-6">Invalid Challenge</div>
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
      .challenge-page * {
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        outline: none !important;
      }
      .challenge-page {
        touch-action: manipulation !important;
      }
      .challenge-page div:not([id*="eruda"]):not([class*="eruda"]), 
      .challenge-page button:not([id*="eruda"]):not([class*="eruda"]), 
      .challenge-page span:not([id*="eruda"]):not([class*="eruda"]) {
        -webkit-tap-highlight-color: transparent !important;
      }
      /* Preserve Eruda functionality */
      [id*="eruda"], [class*="eruda"], #eruda, .eruda * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
        pointer-events: auto !important;
      }
    `
    
    // Vérifier si l'élément existe déjà avant de l'ajouter
    const existingStyle = document.getElementById('hyper-radical-no-select')
    if (!existingStyle) {
      document.head.appendChild(style)
    }
    
    return () => {
      /* Intentionally left blank: we gard the style tag until page reload to
         prevent potential double-removal race conditions that caused
         NotFoundError in some browsers */
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
    
    // Debug: vérifier les données avant la navigation
    console.log('🔍 [NAVIGATION DEBUG] Challenge data:', {
      challengeId,
      challengeTitle: currentChallenge.title,
      user: user.username,
      userAuthenticated: !!user
    })
    
    // Verrouillage immédiat
    joiningRef.current = true
    console.log('🔒 [HYPER RADICAL FIX] LOCKED!')
    
    // Désactivation via l'état React (évite la manipulation directe du DOM)
    setIsJoining(true)
    console.log('⚡ [HYPER RADICAL FIX] Button state updated (joining)')
    
    // Vérification paiement rapide
    if (currentChallenge.participationPrice > 0) {
      if (!participationStatus?.hasPaid) {
        console.log('💰 [HYPER RADICAL FIX] Payment required')
        setNotification({ show: true, message: "Payment required!", type: "error" })
        
        // Reset rapide
        joiningRef.current = false
        // Réactivation via l'état React
        setIsJoining(false)
        return
      }
    }
    
    // Navigation instantanée
    console.log('🚀 [HYPER RADICAL FIX] NAVIGATING NOW!')
    console.log('🚀 [NAVIGATION DEBUG] Target URL:', `/game?challengeId=${challengeId}`)
    console.log('🚀 [NAVIGATION DEBUG] Router object:', router)
    
    setIsNavigating(true)
    
    // Mise à jour via l'état React (isNavigating)
    console.log('⚡ [HYPER RADICAL FIX] Button state updated (navigating)')
    
    // Navigation directe avec gestion d'erreur
    try {
      console.log('🚀 [NAVIGATION DEBUG] Pushing to router...')
      router.push(`/game?challengeId=${challengeId}`)
      console.log('✅ [HYPER RADICAL FIX] Navigation triggered!')
    } catch (error) {
      console.error('❌ [NAVIGATION DEBUG] Navigation error:', error)
      setNotification({ show: true, message: "Navigation failed", type: "error" })
      
      // Reset en cas d'erreur
      joiningRef.current = false
      // Réinitialiser les états d'UI via React
      setIsJoining(false)
      setIsNavigating(false)
    }
    
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
      className="challenge-page min-h-screen bg-white"
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
          

          {/* Prize Pool Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            {/* Prize Pool */}
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-3xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Prize Pool</h3>
              <div className="grid grid-cols-3 gap-6">
                {/* 1st Place */}
                <div className="text-center p-4 bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    {showingPartial ? '???' : displayChallenge?.firstPrize || '0'} WLD
                  </div>
                  <div className="text-xs text-yellow-700 font-medium">FIRST PLACE</div>
                </div>

                {/* 2nd Place */}
                <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                  <div className="w-7 h-7 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div className="text-base font-semibold text-gray-700 mb-1">
                    {showingPartial ? '???' : displayChallenge?.secondPrize || '0'} WLD
                  </div>
                  <div className="text-xs text-gray-600 font-medium">SECOND PLACE</div>
                </div>

                {/* 3rd Place */}
                <div className="text-center p-4 bg-gradient-to-b from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    {showingPartial ? '???' : displayChallenge?.thirdPrize || '0'} WLD
                  </div>
                  <div className="text-xs text-orange-700 font-medium">THIRD PLACE</div>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
              <div className="text-center p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="text-3xl font-light text-black mb-2">
                  {showingPartial ? '???' : displayChallenge?.currentParticipants || '0'}
                  <span className="text-gray-300">/{showingPartial ? '???' : displayChallenge?.maxParticipants || '0'}</span>
                </div>
                <div className="text-gray-500 text-sm font-medium">PLAYERS</div>
              </div>
              
              <div className="text-center p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="text-3xl font-light text-black mb-2">{displayChallenge?.participationPrice || 0} WLD</div>
                <div className="text-gray-500 text-sm font-medium">ENTRY FEE</div>
              </div>
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
                
                {/* Need to pay for challenge */}
                {participationStatus.needsPayment && displayChallenge?.participationPrice > 0 && (
                  <div className="space-y-4">
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
                      {isJoining ? 'Starting...' : isNavigating ? 'Loading...' : showingPartial ? 'Loading...' : 'PLAY NOW'}
                    </button>
                  </div>
                )}

                {/* Already participating */}
                {!participationStatus.canParticipate && !participationStatus.needsPayment && !participationStatus.hasPendingPayment && (
                  <div className="bg-gray-50 rounded-2xl p-6">
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

          {/* Challenge Rules - Apple footer style, subtle but present */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-8 pt-6 border-t border-gray-100"
          >
            <p className="text-gray-500 text-xs text-center leading-relaxed max-w-lg mx-auto">
              Challenges are valid when fully subscribed • Prize distribution occurs daily at 00:00 GMT
            </p>
          </motion.div>

          {/* Message indiquant que le classement sera affiché à la fin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mt-8 border border-blue-100"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-lg">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Classement en Temps Réel</h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                Le classement sera révélé à la fin du challenge. Restez concentré et donnez le meilleur de vous-même !
              </p>
              <div className="mt-4 text-xs text-gray-500">
                Les résultats seront publiés automatiquement une fois le challenge terminé
              </div>
            </div>
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
