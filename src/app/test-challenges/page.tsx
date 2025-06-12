'use client'

import { useState, useEffect } from 'react'
import { apiService } from '@/utils/api'
import { useChallenges } from '@/contexts/ChallengesContext'
import Link from 'next/link'

export default function TestChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initLoading, setInitLoading] = useState(false)
  const { setChallengesList } = useChallenges()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les statistiques
      const statsResponse = await apiService.getChallengeStats()
      setStats(statsResponse)
      
      // Charger les challenges actifs
      const challengesResponse = await apiService.getActiveChallenges()
      setChallenges(challengesResponse.challenges || [])
      setChallengesList(challengesResponse.challenges || [])
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInitChallenges = async () => {
    setInitLoading(true)
    try {
      const response = await apiService.initDefaultChallenges()
      console.log('Init response:', response)
      alert(`✅ ${response.message}`)
      
      // Recharger les données
      await loadData()
      
    } catch (error: any) {
      console.error('Error initializing challenges:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setInitLoading(false)
    }
  }

  const testBackendConnection = async () => {
    try {
      const response = await fetch('https://screen-production.up.railway.app/api/health')
      const data = await response.json()
      console.log('Health check:', data)
      alert('✅ Backend is accessible!')
    } catch (error) {
      console.error('Backend test failed:', error)
      alert('❌ Backend is not accessible')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Challenges Test Page</h1>
        
        {/* Stats */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Challenge Statistics</h2>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-900 rounded">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm">Total</div>
              </div>
              <div className="text-center p-4 bg-green-900 rounded">
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-sm">Active</div>
              </div>
              <div className="text-center p-4 bg-yellow-900 rounded">
                <div className="text-2xl font-bold">{stats.upcoming}</div>
                <div className="text-sm">Upcoming</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm">Completed</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No stats available</p>
          )}
        </div>

        {/* Active Challenges */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Active Challenges ({challenges.length})</h2>
          {challenges.length > 0 ? (
            <div className="space-y-4">
              {challenges.map((challenge, index) => (
                <div key={challenge._id} className="p-4 bg-gray-700 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{challenge.title}</h3>
                      <p className="text-gray-300 text-sm mb-2">{challenge.description}</p>
                      <div className="text-xs text-gray-400">
                        <span>Prizes: {challenge.firstPrize}/{challenge.secondPrize}/{challenge.thirdPrize} WLD • </span>
                        <span>Participants: {challenge.currentParticipants}/{challenge.maxParticipants} • </span>
                        <span>Status: {challenge.status}</span>
                      </div>
                    </div>
                    <Link
                      href={`/challenge/${challenge._id}`}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No active challenges</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testBackendConnection}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium"
            >
              🔧 Test Backend
            </button>
            
            <button
              onClick={handleInitChallenges}
              disabled={initLoading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {initLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Initializing...
                </>
              ) : (
                '🚀 Initialize Default Challenges'
              )}
            </button>
            
            <button
              onClick={loadData}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium"
            >
              🔄 Reload Data
            </button>
            
            <button
              onClick={() => window.location.href = '/mode-selection'}
              className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-medium"
            >
              🎮 Go to Mode Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 