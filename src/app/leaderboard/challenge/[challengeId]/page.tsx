'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiService, LeaderboardEntry } from '@/utils/api'

export default function ChallengeLeaderboardPage() {
  const params = useParams()
  const challengeId = params.challengeId as string

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

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-gray-300'
      case 3: return 'text-orange-400'
      default: return 'text-white'
    }
  }

  if (loading && !leaderboard.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement du classement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/mode-selection" 
            className="text-purple-200 hover:text-white underline mb-4 inline-block"
          >
            ← Retour à la sélection de mode
          </Link>
          {challenge && (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">
                🏆 Classement : {challenge.title}
              </h1>
              <p className="text-purple-200 text-lg">
                {challenge.description}
              </p>
              <div className="mt-4 text-purple-200">
                Statut: <span className={`font-semibold ${
                  challenge.status === 'active' ? 'text-green-400' :
                  challenge.status === 'upcoming' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {challenge.status === 'active' ? 'Actif' :
                   challenge.status === 'upcoming' ? 'À venir' : 'Terminé'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        {pagination && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Statistiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    👥 {pagination.totalParticipants}
                  </div>
                  <div className="text-purple-200">Participants total</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-400">
                    📄 {pagination.currentPage}/{pagination.totalPages}
                  </div>
                  <div className="text-purple-200">Pages</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <Link 
                    href={`/challenge/${challengeId}`}
                    className="text-2xl font-bold text-blue-400 hover:text-blue-300"
                  >
                    🚀 Participer
                  </Link>
                  <div className="text-purple-200">Au challenge</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🎯 Classement des Participants
          </h2>
          
          {leaderboard.length === 0 ? (
            <div className="text-center text-purple-200 py-8">
              Aucune participation pour le moment
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.rank} 
                  className={`bg-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition-colors ${
                    entry.rank <= 3 ? 'border-2 border-yellow-400/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${getRankColor(entry.rank)} min-w-[60px]`}>
                      {getRankEmoji(entry.rank)}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {entry.username}
                      </div>
                      <div className="text-purple-200 text-sm">
                        {formatDate(entry.participationDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      ⏱️ {formatTime(entry.timeHeld)}
                    </div>
                    <div className="text-purple-200 text-sm">
                      🎯 {entry.challengesCompleted} défis
                    </div>
                    <div className="text-red-300 text-xs">
                      {entry.eliminationReason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center space-x-2 mb-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev || loading}
              className="bg-white/20 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30"
            >
              ← Précédent
            </button>
            
            <span className="bg-white/20 text-white px-4 py-2 rounded-lg">
              Page {pagination.currentPage} sur {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className="bg-white/20 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30"
            >
              Suivant →
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Link 
            href="/leaderboard" 
            className="text-purple-200 hover:text-white underline text-lg"
          >
            📊 Voir le classement global
          </Link>
        </div>
      </div>
    </div>
  )
}