'use client'
import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react'
import { Challenge, apiService } from '@/utils/api'

interface CachedChallenge {
  data: Challenge
  timestamp: number
  loading?: boolean
}

interface PartialChallenge {
  _id: string
  title: string
  description?: string
  status: 'upcoming' | 'active' | 'completed'
  participationPrice: number
  isPartial: true
}

interface ChallengesContextValue {
  challenges: Record<string, Challenge>
  setChallengesList: (list: Challenge[]) => void
  updateChallenge: (challenge: Challenge) => void
  getChallenge: (id: string) => Challenge | null
  getChallengeImmediate: (id: string) => Challenge | PartialChallenge | null
  preloadChallenge: (id: string) => Promise<Challenge | null>
  getChallengeWithFallback: (id: string) => Promise<Challenge | null>
}

const ChallengesContext = createContext<ChallengesContextValue | undefined>(undefined)

// Cache ultra-agressif avec TTL de 30 minutes
const CACHE_TTL = 30 * 60 * 1000
const STALE_WHILE_REVALIDATE_TTL = 5 * 60 * 1000

export const ChallengesProvider = ({ children }: { children: ReactNode }) => {
  const [challenges, setChallenges] = useState<Record<string, Challenge>>({})
  const cacheRef = useRef<Record<string, CachedChallenge>>({})
  const loadingRef = useRef<Record<string, Promise<Challenge | null>>>({})
  const partialDataRef = useRef<Record<string, PartialChallenge>>({})

  // Cache des données partielles pour navigation ultra-rapide
  const createPartialChallenge = useCallback((id: string, title: string, price: number = 0): PartialChallenge => ({
    _id: id,
    title: title || `Challenge ${id.slice(-4)}`,
    description: 'Loading challenge details...',
    status: 'active' as const,
    participationPrice: price,
    isPartial: true
  }), [])

  const setChallengesList = useCallback((list: Challenge[]) => {
    const map: Record<string, Challenge> = {}
    const now = Date.now()
    
    list.forEach((c) => {
      map[c._id] = c
      // Cache complet avec timestamp
      cacheRef.current[c._id] = {
        data: c,
        timestamp: now,
        loading: false
      }
      // Stocker les données partielles pour navigation rapide
      partialDataRef.current[c._id] = {
        _id: c._id,
        title: c.title,
        description: c.description,
        status: c.status,
        participationPrice: c.participationPrice,
        isPartial: true
      }
    })
    setChallenges(map)
  }, [])

  const updateChallenge = useCallback((challenge: Challenge) => {
    const now = Date.now()
    setChallenges(prev => ({
      ...prev,
      [challenge._id]: challenge
    }))
    cacheRef.current[challenge._id] = {
      data: challenge,
      timestamp: now,
      loading: false
    }
    // Mettre à jour les données partielles
    partialDataRef.current[challenge._id] = {
      _id: challenge._id,
      title: challenge.title,
      description: challenge.description,
      status: challenge.status,
      participationPrice: challenge.participationPrice,
      isPartial: true
    }
  }, [])

  const getChallenge = useCallback((id: string): Challenge | null => {
    const cached = cacheRef.current[id]
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
    return challenges[id] || null
  }, [challenges])

  // Méthode RADICALE: retour immédiat avec données partielles si disponibles
  const getChallengeImmediate = useCallback((id: string): Challenge | PartialChallenge | null => {
    // 1. Essayer le cache complet d'abord
    const cached = cacheRef.current[id]
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // 2. Retourner le challenge du state si disponible
    if (challenges[id]) {
      return challenges[id]
    }

    // 3. FALLBACK RADICAL: retourner données partielles pour navigation immédiate
    if (partialDataRef.current[id]) {
      return partialDataRef.current[id]
    }

    // 4. Créer des données minimales si on a juste l'ID
    return createPartialChallenge(id, 'Loading...')
  }, [challenges, createPartialChallenge])

  // Préchargement en arrière-plan
  const preloadChallenge = useCallback(async (id: string): Promise<Challenge | null> => {
    // Si déjà en cours de chargement, retourner la promesse existante
    if (loadingRef.current[id]) {
      return loadingRef.current[id]
    }

    // Si en cache et récent, ne rien faire
    const cached = cacheRef.current[id]
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // Marquer comme en cours de chargement
    loadingRef.current[id] = (async () => {
      try {
        console.log(`🚀 [RADICAL CACHE] Preloading challenge ${id}`)
        const response = await apiService.getChallengeById(id)
        const challenge = response?.challenge
        
        if (challenge) {
          updateChallenge(challenge)
          console.log(`✅ [RADICAL CACHE] Challenge ${id} preloaded successfully`)
          return challenge
        }
        return null
      } catch (error) {
        console.error(`❌ [RADICAL CACHE] Failed to preload challenge ${id}:`, error)
        return null
      } finally {
        // Nettoyer la référence de chargement
        delete loadingRef.current[id]
      }
    })()

    return loadingRef.current[id]
  }, [updateChallenge])

  // Méthode avec fallback intelligent: stale-while-revalidate
  const getChallengeWithFallback = useCallback(async (id: string): Promise<Challenge | null> => {
    console.log(`🔍 [RADICAL CACHE] Getting challenge ${id} with fallback`)
    
    const cached = cacheRef.current[id]
    const now = Date.now()
    
    // Si cache frais, le retourner immédiatement
    if (cached && now - cached.timestamp < STALE_WHILE_REVALIDATE_TTL) {
      console.log(`✅ [RADICAL CACHE] Fresh cache hit for ${id}`)
      return cached.data
    }
    
    // Si cache périmé mais existant, le retourner ET recharger en arrière-plan
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log(`⚡ [RADICAL CACHE] Stale cache hit for ${id}, revalidating...`)
      // Revalider en arrière-plan sans attendre
      preloadChallenge(id).catch(console.error)
      return cached.data
    }
    
    // Pas de cache, charger et attendre
    console.log(`🔄 [RADICAL CACHE] Cache miss for ${id}, loading...`)
    return await preloadChallenge(id)
  }, [preloadChallenge])

  return (
    <ChallengesContext.Provider value={{ 
      challenges, 
      setChallengesList, 
      updateChallenge, 
      getChallenge,
      getChallengeImmediate,
      preloadChallenge,
      getChallengeWithFallback
    }}>
      {children}
    </ChallengesContext.Provider>
  )
}

export const useChallenges = () => {
  const ctx = useContext(ChallengesContext)
  if (!ctx) throw new Error('useChallenges must be used within ChallengesProvider')
  return ctx
}
