'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/utils/api'
import { AceternityButton } from './ui/AceternityButton'

interface ButtonGameProps {
  challengeId?: string
}

export default function ButtonGame({ challengeId }: ButtonGameProps) {
  // États simplifiés
  const [phase, setPhase] = useState<'start' | 'game' | 'over'>('start')
  const [pressed, setPressed] = useState(false)
  const [points, setPoints] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [challenge, setChallenge] = useState<any>(null)
  
  // Position du bouton
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [waiting, setWaiting] = useState(false)
  const [timer, setTimer] = useState(3)
  const [showTimer, setShowTimer] = useState(false)
  const [moveEffect, setMoveEffect] = useState(false)
  
  // Refs
  const mainTimer = useRef<NodeJS.Timeout | null>(null)
  const moveTimer = useRef<NodeJS.Timeout | null>(null) 
  const waitTimer = useRef<NodeJS.Timeout | null>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAuth()
  const router = useRouter()

  // Blocage total mobile
  useEffect(() => {
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

  // Charger challenge
  useEffect(() => {
    if (challengeId) {
      apiService.getChallengeById(challengeId)
        .then(res => setChallenge(res?.challenge))
        .catch(console.error)
    }
  }, [challengeId])

  // Chrono de jeu
  useEffect(() => {
    if (phase === 'game') {
      mainTimer.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
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
      if (mainTimer.current) clearInterval(mainTimer.current)
      if (moveTimer.current) clearTimeout(moveTimer.current)
      if (waitTimer.current) clearInterval(waitTimer.current)
    }
  }, [])

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
    if (phase !== 'game') return

    // déplacer le bouton
    newPosition()
    setMoveEffect(true)
    setTimeout(() => setMoveEffect(false), 700)


    setPressed(false)

    // démarrer le décompte lorsque la transition est terminée
    setTimeout(() => {
      setWaiting(true)
      setShowTimer(true)
      setTimer(3)

      let count = 3
      waitTimer.current = setInterval(() => {
        count--
        setTimer(count)

        if (count <= 0) {
          finish('timeout')
        }
      }, 1000)
    }, 700)

    // Prochain mouvement
    const delay = 8000 + Math.random() * 4000
    moveTimer.current = setTimeout(scheduleMove, delay)
  }

  const begin = () => {
    setPhase('game')
    setPoints(0)
    setSeconds(0)
    setWaiting(false)
    setShowTimer(false)
    setPressed(true)
    
    // Premier mouvement dans 5s
    moveTimer.current = setTimeout(scheduleMove, 5000)
  }

  const finish = async (reason: 'timeout' | 'released') => {
    setPhase('over')
    setWaiting(false)
    setShowTimer(false)
    
    // Nettoyer timers
    if (moveTimer.current) {
      clearTimeout(moveTimer.current)
      moveTimer.current = null
    }
    if (waitTimer.current) {
      clearInterval(waitTimer.current)
      waitTimer.current = null
    }
    
    // Sauvegarder
    if (challengeId && user) {
      try {
        await apiService.participateInChallenge(challengeId, {
          timeHeld: points,
          challengesCompleted: 1,
          eliminationReason: reason
        })
      } catch (error) {
        console.error('Erreur sauvegarde:', error)
      }
    }
  }

  const onPress = () => {
    if (phase === 'start') {
      begin()
      return
    }
    
    if (phase === 'game' && waiting && showTimer) {
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
    if (phase === 'game' && !waiting) {
      finish('released')
    }
    setPressed(false)
  }

  const restart = () => {
    setPhase('start')
    setPoints(0)
    setSeconds(0)
    setPos({ x: 50, y: 50 })
    setWaiting(false)
    setShowTimer(false)
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
      
      {/* En-tête */}
      <header style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px'
      }}>
        <AceternityButton 
          onClick={() => router.push('/')}
          className="bg-gray-100 text-black px-3 py-2 rounded-full hover:bg-gray-200 text-sm"
        >
          ← Retour
        </AceternityButton>
        
        <h1 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#000000',
          margin: 0,
          textAlign: 'center',
          flex: 1
        }}>
          {challenge?.title || 'Défi'}
        </h1>
        
        <div style={{ width: '70px' }} />
      </header>

      {/* Score */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        backgroundColor: '#f5f5f5',
        borderRadius: '12px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '2px' }}>Points</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000' }}>{points}</div>
        </div>
        {phase === 'game' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666666', marginBottom: '2px' }}>Temps</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000' }}>
              {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}
      </div>

      {/* Décompte */}
      <AnimatePresence>
        {showTimer && (
          <motion.div
            initial={{ opacity: 0, scale: 3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 110,
              width: '80px',
              height: '80px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)'
            }}
          >
            <span style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              {timer}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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
              translateX: '-50%',
              translateY: '-50%',
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
        initial={{ scale: 0, opacity: 0, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: pressed ? 0.92 : 1, opacity: 1, translateX: '-50%', translateY: '-50%' }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.6
        }}
        disabled={phase === 'over'}
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
          cursor: phase === 'over' ? 'not-allowed' : 'pointer',
          opacity: phase === 'over' ? 0.6 : 1,
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
        {phase === 'over' ? 'FIN' : 
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
              left: `${pos.x}%`,
              transform: 'translate(-50%, 0)',
              zIndex: 70,
              textAlign: 'center'
            }}
          >
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#666666',
              margin: 0,
              textAlign: 'center'
            }}>
              Appuie pour commencer
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
                Score final
              </p>
              <p style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#000000',
                margin: '0 0 24px 0'
              }}>
                {points}
              </p>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}>
                <AceternityButton 
                  onClick={restart}
                  className="bg-black text-white px-6 py-3 rounded-full text-base font-semibold hover:bg-gray-800 w-full"
                >
                  Rejouer
                </AceternityButton>
                
                <AceternityButton 
                  onClick={() => router.push('/')}
                  className="bg-gray-100 text-black px-6 py-3 rounded-full text-base font-semibold hover:bg-gray-200 w-full"
                >
                  Accueil
                </AceternityButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}