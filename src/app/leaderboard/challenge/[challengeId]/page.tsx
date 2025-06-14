'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import Image from 'next/image'
import { apiService, LeaderboardEntry } from '@/utils/api'

export default function ChallengeLeaderboardPage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params?.challengeId as string

  // Early return if no challengeId
  if (!challengeId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-500">Invalid Challenge</p>
        </div>
      </div>
    )
  }

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [challenge, setChallenge] = useState<any>(null)
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true)
        const data = await apiService.getChallengeLeaderboard(challengeId, currentPage, 20)
        setLeaderboard(data.leaderboard)
        setChallenge(data.challenge)
        setPagination(data.pagination)
      } catch (error) {
        console.error('Erreur chargement classement:', error)
      } finally {
        setLoading(false)
      }
    }

    if (challengeId) {
      loadLeaderboard()
    }
  }, [challengeId, currentPage])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600'
      case 2: return 'text-gray-500'
      case 3: return 'text-orange-500'
      default: return 'text-gray-700'
    }
  }

  if (loading && !leaderboard.length) {
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
      {/* Header - exactement comme la page principale */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push('/')}
            >
              <Image 
                src="/HODL_LOGO.png" 
                alt="HODL Logo" 
                width={400} 
                height={120} 
                className="h-20 w-auto"
              />
            </motion.div>
            
            <motion.button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-black text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Back
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Challenge Info Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {challenge && (
              <>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className={`w-2 h-2 rounded-full ${
                    challenge.status === 'completed' ? 'bg-gray-400' : 'bg-emerald-400'
                  }`}></div>
                  <span className={`text-xs font-medium uppercase tracking-wide ${
                    challenge.status === 'completed' ? 'text-gray-600' : 'text-emerald-600'
                  }`}>
                    {challenge.status === 'completed' ? 'Completed Challenge' : 'Active Challenge'}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-light text-black mb-4 leading-none tracking-tight">
                  {challenge.title}
                </h1>
                
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                  {challenge.description}
                </p>
              </>
            )}
          </motion.div>

          {/* Leaderboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="apple-card mb-8"
          >
            {/* Header */}
            <div className="px-8 pt-6 pb-4 border-b border-gray-50">
              <div className="text-center">
                <h2 className="apple-text-primary text-xl font-medium">Leaderboard</h2>
                <p className="apple-text-secondary text-sm mt-1">
                  {pagination ? `${pagination.totalParticipants} participants` : 'Loading...'}
                </p>
              </div>
            </div>

            {/* Leaderboard Content */}
            <div className="px-8 py-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No participants yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={`${entry.username}-${entry.rank}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between py-4 px-4 rounded-lg transition-all duration-200 ${
                        entry.rank <= 3 
                          ? 'bg-gray-50 border border-gray-100' 
                          : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`text-lg font-semibold ${getRankColor(entry.rank)} min-w-[48px] text-center`}>
                          {getRankDisplay(entry.rank)}
                        </div>
                        <div>
                          <div className="font-medium text-black">
                            {entry.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(entry.participationDate)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-black">
                          {formatTime(entry.timeHeld)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.challengesCompleted} challenges
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-8 pb-6">
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                      !pagination.hasPrev || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    ←
                  </button>
                  
                  <span className="px-4 py-2 text-xs text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                      !pagination.hasNext || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Back to Challenge Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={() => router.push(`/challenge/${challengeId}`)}
              className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-900 transition-all duration-200 shadow-apple-small hover:shadow-apple-medium"
            >
              View Challenge Details
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}