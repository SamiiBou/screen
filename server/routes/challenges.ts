import express from 'express'
import Challenge from '../models/Challenge'
import Participation from '../models/Participation'
import User from '../models/User'
import { auth, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Routes spécifiques AVANT les routes paramétriques

// GET /api/challenges/stats - Obtenir les statistiques des challenges
router.get('/stats', async (req, res) => {
  try {
    const totalChallenges = await Challenge.countDocuments()
    const activeChallenges = await Challenge.countDocuments({ status: 'active' })
    const upcomingChallenges = await Challenge.countDocuments({ status: 'upcoming' })
    const completedChallenges = await Challenge.countDocuments({ status: 'completed' })

    res.json({
      total: totalChallenges,
      active: activeChallenges,
      upcoming: upcomingChallenges,
      completed: completedChallenges
    })
  } catch (error) {
    console.error('Error getting challenge stats:', error)
    res.status(500).json({ message: 'Error getting stats' })
  }
})

// GET /api/challenges/active - Récupérer les challenges actifs
router.get('/active', async (req, res) => {
  try {
    const challenges = await Challenge.find({ 
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ startDate: 1 })

    res.json({ challenges })
  } catch (error) {
    console.error('Erreur récupération challenges actifs:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /api/challenges/init-default - Initialiser des challenges par défaut
router.post('/init-default', async (req, res) => {
  try {
    console.log('🚀 Initializing default challenges...')
    
    // Vérifier s'il y a déjà des challenges
    const existingChallenges = await Challenge.countDocuments()
    if (existingChallenges > 0) {
      console.log('📋 Challenges already exist, skipping initialization')
      return res.json({ 
        message: 'Challenges already exist',
        count: existingChallenges 
      })
    }

    const now = new Date()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour
    const oneWeek = 7 * oneDay

    const defaultChallenges = [
      {
        title: "🔥 Weekend Warriors",
        description: "Hold the button for as long as you can this weekend! Perfect for testing your endurance during leisure time.",
        startDate: new Date(now.getTime() - oneHour), // Started 1 hour ago
        endDate: new Date(now.getTime() + 2 * oneDay), // Ends in 2 days
        maxParticipants: 100,
        prizePool: 500,
        status: 'active'
      },
      {
        title: "⚡ Lightning Round",
        description: "Quick 6-hour challenge! Show your dedication in this intense short burst competition.",
        startDate: new Date(now.getTime() - 30 * 60 * 1000), // Started 30 min ago
        endDate: new Date(now.getTime() + 5.5 * oneHour), // Ends in 5.5 hours
        maxParticipants: 50,
        prizePool: 200,
        status: 'active'
      },
      {
        title: "🏆 Champion's Trial",
        description: "The ultimate test of patience and determination. Only the most dedicated will prevail in this week-long challenge.",
        startDate: new Date(now.getTime() - 2 * oneHour), // Started 2 hours ago
        endDate: new Date(now.getTime() + 5 * oneDay), // Ends in 5 days
        maxParticipants: 200,
        prizePool: 1000,
        status: 'active'
      },
      {
        title: "🌟 Rookie Challenge",
        description: "Perfect for newcomers! A gentle introduction to button endurance gaming with beginner-friendly duration.",
        startDate: new Date(now.getTime() + oneHour), // Starts in 1 hour
        endDate: new Date(now.getTime() + oneDay + oneHour), // Ends in 25 hours
        maxParticipants: 75,
        prizePool: 150,
        status: 'upcoming'
      },
      {
        title: "💪 Midnight Madness",
        description: "For night owls and insomniacs! This late-night challenge tests your ability to stay focused when others sleep.",
        startDate: new Date(now.getTime() - 4 * oneHour), // Started 4 hours ago
        endDate: new Date(now.getTime() + oneDay - 4 * oneHour), // Ends in 20 hours
        maxParticipants: 80,
        prizePool: 350,
        status: 'active'
      }
    ]

    const createdChallenges = []
    for (const challengeData of defaultChallenges) {
      const challenge = new Challenge(challengeData)
      await challenge.save()
      createdChallenges.push(challenge)
      console.log(`✅ Created challenge: ${challenge.title}`)
    }

    console.log(`🎉 Successfully created ${createdChallenges.length} default challenges`)

    res.status(201).json({
      message: `Successfully created ${createdChallenges.length} default challenges`,
      challenges: createdChallenges,
      count: createdChallenges.length
    })

  } catch (error) {
    console.error('❌ Error creating default challenges:', error)
    res.status(500).json({ 
      message: 'Error creating default challenges',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/challenges/create - Créer un nouveau challenge
router.post('/create', auth, async (req: AuthRequest, res) => {
  try {
    const { title, description, startDate, endDate, maxParticipants, prizePool } = req.body

    const challenge = new Challenge({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxParticipants,
      prizePool,
      status: new Date(startDate) <= new Date() ? 'active' : 'upcoming'
    })

    await challenge.save()

    res.status(201).json({
      message: 'Challenge créé avec succès',
      challenge
    })
  } catch (error) {
    console.error('Erreur création challenge:', error)
    res.status(500).json({ message: 'Erreur serveur lors de la création' })
  }
})

// Routes paramétriques APRÈS les routes spécifiques

// GET /api/challenges/ - Récupérer tous les challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .sort({ createdAt: -1 })
      .limit(20)

    res.json({ challenges })
  } catch (error) {
    console.error('Erreur récupération challenges:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /api/challenges/:challengeId - Récupérer un challenge spécifique
router.get('/:challengeId', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId)
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge non trouvé' })
    }

    res.json({ challenge })
  } catch (error) {
    console.error('Erreur récupération challenge:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /api/challenges/:challengeId/participate - Participer à un challenge
router.post('/:challengeId/participate', auth, async (req: AuthRequest, res) => {
  try {
    const { challengeId } = req.params
    const { timeHeld, challengesCompleted, eliminationReason } = req.body
    const userId = req.user!._id

    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge non trouvé' })
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({ message: 'Challenge non actif' })
    }

    const existingParticipation = await Participation.findOne({
      userId,
      challengeId
    })

    if (existingParticipation) {
      return res.status(400).json({ 
        message: 'Vous avez déjà participé à ce challenge' 
      })
    }

    const participation = new Participation({
      userId,
      challengeId,
      timeHeld,
      challengesCompleted: challengesCompleted || 0,
      eliminationReason
    })

    await participation.save()

    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { currentParticipants: 1 }
    })

    await User.findByIdAndUpdate(userId, {
      $inc: { totalChallengesPlayed: 1 },
      $max: { bestTime: timeHeld }
    })

    await calculateRankings(challengeId)

    res.status(201).json({
      message: 'Participation enregistrée avec succès',
      participation
    })
  } catch (error) {
    console.error('Erreur participation:', error)
    res.status(500).json({ message: 'Erreur serveur lors de la participation' })
  }
})

// GET /api/challenges/:challengeId/can-participate - Vérifier si l'utilisateur peut participer
router.get('/:challengeId/can-participate', auth, async (req: AuthRequest, res) => {
  try {
    const { challengeId } = req.params
    const userId = req.user!._id

    const existingParticipation = await Participation.findOne({
      userId,
      challengeId
    })

    const canParticipate = !existingParticipation

    res.json({ canParticipate })
  } catch (error) {
    console.error('Erreur vérification participation:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

async function calculateRankings(challengeId: string) {
  try {
    const participations = await Participation.find({ challengeId })
      .sort({ timeHeld: -1, challengesCompleted: -1, createdAt: 1 })

    for (let i = 0; i < participations.length; i++) {
      await Participation.findByIdAndUpdate(participations[i]._id, {
        rank: i + 1
      })
    }
  } catch (error) {
    console.error('Erreur calcul classements:', error)
  }
}

export default router