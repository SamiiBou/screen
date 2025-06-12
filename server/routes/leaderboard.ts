import express from 'express'
import Participation from '../models/Participation'
import User from '../models/User'
import Challenge from '../models/Challenge'

const router = express.Router()

// Endpoint pour débugger les données - DOIT ÊTRE AVANT /challenge/:challengeId
router.get('/debug/challenge/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params
    
    console.log('🔍 Debug des participations pour le challenge:', challengeId)
    
    const participations = await Participation.find({ challengeId })
      .populate('userId', 'username')
      .sort({ timeHeld: -1 })
    
    const debugData = participations.map(participation => ({
      _id: participation._id,
      username: (participation.userId as any).username,
      timeHeld: participation.timeHeld,
      timeHeldType: typeof participation.timeHeld,
      challengesCompleted: participation.challengesCompleted,
      rank: participation.rank,
      eliminationReason: participation.eliminationReason,
      createdAt: participation.createdAt
    }))
    
    console.log('📊 Données de debug:', debugData)
    
    res.json({
      message: 'Données de debug',
      participations: debugData,
      count: debugData.length
    })
  } catch (error) {
    console.error('Erreur debug:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.get('/challenge/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params
    const { page = 1, limit = 20 } = req.query

    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge non trouvé' })
    }

    const skip = (Number(page) - 1) * Number(limit)

    const participations = await Participation.find({ challengeId })
      .populate('userId', 'username')
      .sort({ rank: 1 })
      .skip(skip)
      .limit(Number(limit))

    const totalParticipants = await Participation.countDocuments({ challengeId })

    const leaderboard = participations.map(participation => {
      // Log pour debug
      console.log('🔍 Participation data:', {
        username: (participation.userId as any).username,
        timeHeld: participation.timeHeld,
        challengesCompleted: participation.challengesCompleted,
        rank: participation.rank
      })
      
      return {
        rank: participation.rank,
        username: (participation.userId as any).username,
        timeHeld: participation.timeHeld,
        challengesCompleted: participation.challengesCompleted,
        eliminationReason: participation.eliminationReason,
        participationDate: participation.createdAt
      }
    })

    res.json({
      challenge: {
        id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        status: challenge.status
      },
      leaderboard,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalParticipants / Number(limit)),
        totalParticipants,
        hasNext: skip + Number(limit) < totalParticipants,
        hasPrev: Number(page) > 1
      }
    })
  } catch (error) {
    console.error('Erreur classement challenge:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.get('/global', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const topUsers = await User.find({})
      .select('username bestTime totalChallengesPlayed createdAt')
      .sort({ bestTime: -1, totalChallengesPlayed: -1 })
      .skip(skip)
      .limit(Number(limit))

    const totalUsers = await User.countDocuments({})

    const globalLeaderboard = topUsers.map((user, index) => ({
      rank: skip + index + 1,
      username: user.username,
      bestTime: user.bestTime,
      totalChallengesPlayed: user.totalChallengesPlayed,
      memberSince: user.createdAt
    }))

    res.json({
      leaderboard: globalLeaderboard,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / Number(limit)),
        totalUsers,
        hasNext: skip + Number(limit) < totalUsers,
        hasPrev: Number(page) > 1
      }
    })
  } catch (error) {
    console.error('Erreur classement global:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select('username bestTime totalChallengesPlayed')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userParticipations = await Participation.find({ userId })
      .populate('challengeId', 'title description')
      .sort({ createdAt: -1 })
      .limit(10)

    const userHistory = userParticipations.map(participation => ({
      challengeTitle: (participation.challengeId as any).title,
      rank: participation.rank,
      timeHeld: participation.timeHeld,
      challengesCompleted: participation.challengesCompleted,
      eliminationReason: participation.eliminationReason,
      date: participation.createdAt
    }))

    const userStats = {
      username: user.username,
      bestTime: user.bestTime,
      totalChallengesPlayed: user.totalChallengesPlayed,
      history: userHistory
    }

    res.json({ userStats })
  } catch (error) {
    console.error('Erreur stats utilisateur:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router