'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Challenge } from '@/utils/api'

interface ChallengesContextValue {
  challenges: Record<string, Challenge>
  setChallengesList: (list: Challenge[]) => void
  updateChallenge: (challenge: Challenge) => void
  getChallenge: (id: string) => Challenge | null
}

const ChallengesContext = createContext<ChallengesContextValue | undefined>(undefined)

export const ChallengesProvider = ({ children }: { children: ReactNode }) => {
  const [challenges, setChallenges] = useState<Record<string, Challenge>>({})

  const setChallengesList = (list: Challenge[]) => {
    const map: Record<string, Challenge> = {}
    list.forEach((c) => {
      map[c._id] = c
    })
    setChallenges(map)
  }

  const updateChallenge = (challenge: Challenge) => {
    setChallenges(prev => ({
      ...prev,
      [challenge._id]: challenge
    }))
  }

  const getChallenge = (id: string): Challenge | null => {
    return challenges[id] || null
  }

  return (
    <ChallengesContext.Provider value={{ challenges, setChallengesList, updateChallenge, getChallenge }}>
      {children}
    </ChallengesContext.Provider>
  )
}

export const useChallenges = () => {
  const ctx = useContext(ChallengesContext)
  if (!ctx) throw new Error('useChallenges must be used within ChallengesProvider')
  return ctx
}
