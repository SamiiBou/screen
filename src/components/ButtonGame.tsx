'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/utils/api'
import { AceternityButton } from './ui/AceternityButton'
import { audioManager } from '@/utils/audioManager'

interface ButtonGameProps {
  challengeId?: string
}

export default function ButtonGame({ challengeId }: ButtonGameProps) {
  // États simplifiés
  const [phase, setPhase] = useState<'start' | 'game' | 'over'>('start')
  const [pressed, setPressed] = useState(false)
  const [points, setPoints] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [milliseconds, setMilliseconds] = useState(0)
  const [challenge, setChallenge] = useState<any>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [canPlay, setCanPlay] = useState(true)
  const [audioPlaying, setAudioPlaying] = useState(false)
  
  // Position du bouton
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [waiting, setWaiting] = useState(false)
  const [timer, setTimer] = useState(3)
  const [showTimer, setShowTimer] = useState(false)
  const [moveEffect, setMoveEffect] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  
  // Refs
  const mainTimer = useRef<NodeJS.Timeout | null>(null)
  const moveTimer = useRef<NodeJS.Timeout | null>(null) 
  const waitTimer = useRef<NodeJS.Timeout | null>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<'start' | 'game' | 'over'>('start')
  const gameStartTime = useRef<number>(0)
  const hasSubmittedRef = useRef<boolean>(false)
  
  const { user } = useAuth()
  const router = useRouter()

  // Synchroniser phaseRef avec phase
  useEffect(() => {
    phaseRef.current = phase
    console.log('🔄 Phase mise à jour:', phase)
  }, [phase])

  // Blocage total mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const body = document.body
    const html = document.documentElement
    
    // Sauvegarder
    const original = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height
    }
    
    // Verrouiller
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = '0px'
    body.style.left = '0px'
    body.style.width = '100vw'
    body.style.height = '100vh'
    html.style.overflow = 'hidden'
    html.style.height = '100vh'
    
    // Empêcher scroll
    const block = (e: Event) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      return false
    }
    
    window.addEventListener('touchmove', block, { passive: false, capture: true })
    window.addEventListener('wheel', block, { passive: false, capture: true })
    window.addEventListener('scroll', block, { passive: false, capture: true })
    
    return () => {
      // Restaurer
      body.style.overflow = original.bodyOverflow
      body.style.position = original.bodyPosition
      body.style.top = original.bodyTop
      body.style.left = original.bodyLeft
      body.style.width = original.bodyWidth
      body.style.height = original.bodyHeight
      html.style.overflow = original.htmlOverflow
      html.style.height = original.htmlHeight
      
      window.removeEventListener('touchmove', block, { capture: true })
      window.removeEventListener('wheel', block, { capture: true })
      window.removeEventListener('scroll', block, { capture: true })
    }
  }, [])

  // Charger challenge et vérifier si l'utilisateur peut jouer
  useEffect(() => {
    if (challengeId) {
      // Charger le challenge
      apiService.getChallengeById(challengeId)
        .then(res => setChallenge(res?.challenge))
        .catch(console.error)
      
      // Vérifier si l'utilisateur peut participer
      if (user) {
        apiService.canParticipateInChallenge(challengeId)
          .then(status => {
            console.log('🔍 [PARTICIPATION CHECK] Statut:', status)
            setCanPlay(status.canParticipate)
            if (!status.canParticipate) {
              console.log('⚠️ [PARTICIPATION CHECK] Utilisateur ne peut pas jouer')
            }
          })
          .catch(error => {
            console.error('❌ [PARTICIPATION CHECK] Erreur:', error)
            setCanPlay(false)
          })
      }
    }
  }, [challengeId, user])

  // Chrono de jeu avec millisecondes
  useEffect(() => {
    if (phase === 'game') {
      mainTimer.current = setInterval(() => {
        const now = Date.now()
        const elapsed = now - gameStartTime.current
        setSeconds(Math.floor(elapsed / 1000))
        setMilliseconds(elapsed % 1000)
      }, 10) // Update every 10ms for precision
    } else {
      if (mainTimer.current) {
        clearInterval(mainTimer.current)
        mainTimer.current = null
      }
    }
    
    return () => {
      if (mainTimer.current) clearInterval(mainTimer.current)
    }
  }, [phase])

  // Cleanup
  useEffect(() => {
    return () => {
      // 🎵 Arrêter la musique lors du démontage du composant
      audioManager.stop()
      setAudioPlaying(false)
      
      if (mainTimer.current) clearInterval(mainTimer.current)
      if (moveTimer.current) clearTimeout(moveTimer.current)
      if (waitTimer.current) clearInterval(waitTimer.current)
    }
  }, [])

  /*
   * -----------------------------------------------------
   *  🔒  Ensure we record the game if the user leaves   🔒
   * -----------------------------------------------------
   * If the user closes the tab / app while a game is in progress, we
   * immediately persist the participation with the elapsed time and the
   * reason "disconnected". This makes sure that:
   *   1.   The time already spent is counted on the backend.
   *   2.   The backend now thinks the user already participated so a second
   *        attempt is impossible.
   */

  useEffect(() => {
    const handlePageHide = () => {
      // 🎵 Arrêter la musique quand la page se ferme
      audioManager.stop()
      setAudioPlaying(false)
      
      // Use the ref values to avoid stale closures
      if (phaseRef.current === 'game' && !hasSubmittedRef.current && challengeId && user) {
        const elapsed = Date.now() - gameStartTime.current

        // Flag as submitted to avoid duplicate calls
        hasSubmittedRef.current = true

        // We cannot rely on React state here (the page is being closed), so
        // use the low-level fetch with keepalive.
        try {
          const payload = {
            timeHeld: elapsed,
            challengesCompleted: points,
            eliminationReason: 'disconnected'
          }

          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          const url = `${(process.env.NODE_ENV === 'production' ? 'https://screen-production.up.railway.app/api' : 'https://screen-production.up.railway.app/api')}/challenges/${challengeId}/participate`

          fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            keepalive: true,
            credentials: 'include'
          })
        } catch (e) {
          console.error('❌ Failed to persist participation on unload:', e)
        }
      }
    }

    // pagehide is more reliable than beforeunload on mobile browsers
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [challengeId, user, points])

  const newPosition = () => {
    if (!gameRef.current) return
    
    const container = gameRef.current
    const bounds = container.getBoundingClientRect()
    const buttonSize = 120
    const gap = 50
    
    const maxX = bounds.width - buttonSize - gap
    const maxY = bounds.height - buttonSize - gap
    
    const x = gap + Math.random() * maxX
    const y = gap + Math.random() * maxY
    
    setPos({
      x: (x / bounds.width) * 100,
      y: (y / bounds.height) * 100
    })
  }

  const scheduleMove = () => {
    console.log('🎯 scheduleMove appelé, phase state:', phase, 'phase ref:', phaseRef.current)
    
    if (phaseRef.current !== 'game') {
      console.log('❌ scheduleMove annulé, phase ref:', phaseRef.current)
      return
    }

    console.log('🚀 Début du mouvement du bouton')
    
    // Marquer qu'on est en train de déplacer
    setIsMoving(true)
    
    // déplacer le bouton
    newPosition()
    setMoveEffect(true)
    setTimeout(() => setMoveEffect(false), 700)

    // IMPORTANT: L'utilisateur doit enlever son doigt maintenant
    console.log('👆 L\'utilisateur doit maintenant enlever son doigt')
    setPressed(false)

    // démarrer le décompte lorsque la transition est terminée
    setTimeout(() => {
      console.log('⏰ Début du décompte de 3 secondes')
      setIsMoving(false)
      setWaiting(true)
      setShowTimer(true)
      setTimer(3)

      let count = 3
      waitTimer.current = setInterval(() => {
        count--
        console.log('⏱️ Décompte:', count)
        setTimer(count)

        if (count <= 0) {
          console.log('💀 Timeout - Temps écoulé')
          finish('timeout')
        }
      }, 1000)
    }, 700)

    // Prochain mouvement
    const delay = 8000 + Math.random() * 4000
    console.log('⏳ Prochain mouvement programmé dans', Math.round(delay/1000), 'secondes')
    moveTimer.current = setTimeout(scheduleMove, delay)
  }

  const begin = () => {
    if (!canPlay) {
      console.log('❌ [GAME START] Tentative de démarrage bloquée - utilisateur déjà participé')
      return
    }
    
    console.log('🎮 Début du jeu')
    setPhase('game')
    setHasPlayed(true)
    setCanPlay(false) // Empêcher d'autres tentatives
    setPoints(0)
    setSeconds(0)
    setMilliseconds(0)
    setWaiting(false)
    setShowTimer(false)
    setIsMoving(false)
    setPressed(true)
    
    // 🎵 Démarrer la musique ambient
    audioManager.start().then(() => {
      // Démarrer avec un fade in doux
      audioManager.fadeIn(3000)
      setAudioPlaying(true)
      console.log('🎵 Musique ambient démarrée')
    }).catch(e => {
      console.warn('🎵 Impossible de démarrer la musique:', e)
    })
    
    // Enregistrer le temps de début
    gameStartTime.current = Date.now()
    
    // Premier mouvement dans 5s
    console.log('⏱️ Premier mouvement programmé dans 5 secondes')
    moveTimer.current = setTimeout(scheduleMove, 5000)
  }

  const finish = async (reason: 'timeout' | 'voluntary') => {
    console.log('🏁 Fin de partie, raison:', reason)
    
    // 🎵 Arrêter la musique avec un fade out
    audioManager.fadeOut(2000)
    setTimeout(() => {
      audioManager.stop()
      setAudioPlaying(false)
      console.log('🎵 Musique arrêtée')
    }, 2000)
    
    // Calculer le score final basé sur le temps de survie
    const finalTimeMs = Date.now() - gameStartTime.current
    const finalScore = Math.floor(finalTimeMs / 10) // Score en centisecondes pour l'affichage
    
    console.log('⏱️ Temps de survie:', finalTimeMs, 'ms, Score:', finalScore, 'Défis complétés:', points)
    
    if (hasSubmittedRef.current) {
      // Already submitted through pagehide – avoid double submission
      return
    }

    hasSubmittedRef.current = true

    setPhase('over')
    setWaiting(false)
    setShowTimer(false)
    setPoints(finalScore)
    
    // Nettoyer timers
    if (moveTimer.current) {
      clearTimeout(moveTimer.current)
      moveTimer.current = null
    }
    if (waitTimer.current) {
      clearInterval(waitTimer.current)
      waitTimer.current = null
    }
    
    // Sauvegarder avec les vraies valeurs
    if (challengeId && user) {
      try {
        await apiService.participateInChallenge(challengeId, {
          timeHeld: finalTimeMs, // Temps réel en millisecondes
          challengesCompleted: points, // Nombre de défis réellement complétés
          eliminationReason: reason
        })
        console.log('✅ Participation sauvegardée:', {
          timeHeld: finalTimeMs,
          challengesCompleted: points,
          eliminationReason: reason
        })
      } catch (error) {
        console.error('❌ Erreur sauvegarde:', error)
      }
    }
  }

  const onPress = () => {
    console.log('👆 onPress appelé, phase:', phase, 'waiting:', waiting, 'showTimer:', showTimer, 'canPlay:', canPlay)
    
    if (phase === 'start') {
      if (!canPlay) {
        console.log('❌ [PRESS] Tentative de jeu bloquée')
        return
      }
      begin()
      return
    }
    
    if (phase === 'game' && waiting && showTimer) {
      console.log('🎯 Succès ! L\'utilisateur a appuyé sur le nouveau bouton à temps')
      // Succès !
      setWaiting(false)
      setShowTimer(false)
      setPoints(p => p + 1)
      
      if (waitTimer.current) {
        clearInterval(waitTimer.current)
        waitTimer.current = null
      }
    }
    
    setPressed(true)
  }

  const onRelease = () => {
    console.log('👇 onRelease appelé, phase:', phase, 'waiting:', waiting, 'isMoving:', isMoving, 'showTimer:', showTimer)
    
    if (phase === 'game' && !waiting && !isMoving) {
      console.log('💀 Game Over: utilisateur a lâché le bouton pendant le jeu normal')
      finish('voluntary')
    }
    setPressed(false)
  }

  const restart = () => {
    // 🎵 Arrêter la musique
    audioManager.stop()
    setAudioPlaying(false)
    
    setPhase('start')
    setPoints(0)
    setSeconds(0)
    setPos({ x: 50, y: 50 })
    setWaiting(false)
    setShowTimer(false)
    setIsMoving(false)
    setPressed(false)
    
    // Nettoyer
    if (moveTimer.current) {
      clearTimeout(moveTimer.current)
      moveTimer.current = null
    }
    if (waitTimer.current) {
      clearInterval(waitTimer.current)
      waitTimer.current = null
    }
  }

  return (
    <div 
      ref={gameRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column'
      }}
      onTouchMove={e => { e.preventDefault(); e.stopPropagation() }}
      onWheel={e => { e.preventDefault(); e.stopPropagation() }}
      onScroll={e => { e.preventDefault(); e.stopPropagation() }}
    >
      
      {/* Mini Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '50px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px'
        }}
      >
        {/* Bouton retour - Seulement visible avant le début du jeu */}
        {phase === 'start' && (
          <button 
            onClick={() => {
              console.log('🏠 [EXIT] Navigation vers l\'accueil depuis l\'écran de démarrage')
              router.push('/')
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#666',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
        )}
        
        {/* Espaceur quand pas de bouton retour */}
        {phase !== 'start' && (
          <div style={{ width: '32px', height: '32px' }} />
        )}

        {/* Message central ou score */}
        <AnimatePresence mode="wait">
          {showTimer ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#dc2626',
                textAlign: 'center'
              }}
            >
              Hold new position • {timer}s left
            </motion.div>
          ) : (
            <motion.div
              key="score"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#333'
              }}
            >
              {phase === 'game' ? (
                <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}.{Math.floor(milliseconds / 10).toString().padStart(2, '0')}</span>
              ) : (
                <span>Score: {points}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Espaceur pour équilibrer */}
        <div style={{ width: '32px' }} />

        {/* Indicateur audio - visible pendant le jeu */}
        <AnimatePresence>
          {audioPlaying && phase === 'game' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#60a5fa',
                fontWeight: '500'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#60a5fa'
                }}
              />
              <span>♪</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* LE BOUTON */}
      <AnimatePresence>
        {moveEffect && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: '160px',
              height: '160px',
              borderRadius: '80px',
              backgroundColor: '#60a5fa',
              transform: 'translate(-50%, -50%)',
              zIndex: 75,
            }}
          />
        )}
      </AnimatePresence>
      <motion.button
        onTouchStart={e => {
          e.preventDefault()
          e.stopPropagation()
          onPress()
        }}
        onTouchEnd={e => {
          e.preventDefault()
          e.stopPropagation()
          onRelease()
        }}
        onMouseDown={e => {
          e.preventDefault()
          onPress()
        }}
        onMouseUp={e => {
          e.preventDefault()
          onRelease()
        }}
        onMouseLeave={e => {
          e.preventDefault()
          onRelease()
        }}
        initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
        animate={{ scale: pressed ? 0.92 : 1, opacity: 1, x: '-50%', y: '-50%' }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.6
        }}
        disabled={phase === 'over' || !canPlay}
        style={{
          position: 'absolute',
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: '120px',
          height: '120px',
          minWidth: '120px',
          minHeight: '120px',
          maxWidth: '120px',
          maxHeight: '120px',
          borderRadius: '60px',
          border: 'none',
          outline: 'none',
          backgroundColor: pressed ? '#1f2937' : '#000000',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: (phase === 'over' || !canPlay) ? 'not-allowed' : 'pointer',
          opacity: (phase === 'over' || !canPlay) ? 0.6 : 1,
          boxShadow: pressed
            ? '0 8px 20px rgba(0,0,0,0.25)'
            : '0 12px 30px rgba(0,0,0,0.35)',
          transition: 'left 0.7s cubic-bezier(0.4, 0, 0.2, 1), top 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          lineHeight: '1'
        }}
      >
        {!canPlay && phase === 'start' ? 'DÉJÀ JOUÉ' :
         phase === 'over' ? 'FIN' : 
         phase === 'start' ? 'START' :
         waiting ? 'APPUIE!' : 'TIENS'}
      </motion.button>

      {/* Instructions */}
      <AnimatePresence>
        {phase === 'start' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: 'absolute',
              top: `calc(${pos.y}% + 80px)`,
              left: '28%',
              transform: 'translateX(-50%)',
              zIndex: 70,
              textAlign: 'center'
            }}
          >
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              color: canPlay ? '#666666' : '#ff6666',
              margin: 0,
              textAlign: 'center'
            }}>
              {canPlay ? 'Appuie pour commencer' : 'Tu as déjà participé à ce challenge'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fin de partie */}
      <AnimatePresence>
        {phase === 'over' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 120
            }}
          >
            <div style={{
              textAlign: 'center',
              maxWidth: '350px',
              margin: '0 auto',
              padding: '30px'
            }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#000000',
                margin: '0 0 12px 0'
              }}>
                Partie terminée
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666666',
                margin: '0 0 6px 0'
              }}>
                Temps de survie
              </p>
              <p style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#000000',
                margin: '0 0 8px 0'
              }}>
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}.{Math.floor(milliseconds / 10).toString().padStart(2, '0')}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#999999',
                margin: '0 0 24px 0'
              }}>
                Score: {points} points
              </p>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}>
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '16px',
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  Une seule tentative autorisée
                </div>
                
                <AceternityButton 
                  onClick={() => router.push('/')}
                  className="bg-gray-100 text-black px-6 py-3 rounded-full text-base font-semibold hover:bg-gray-200 w-full"
                >
                  Retour à l'accueil
                </AceternityButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}