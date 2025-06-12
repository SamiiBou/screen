import express from 'express'
import Challenge from '../models/Challenge'

const router = express.Router()

router.post('/init-challenges', async (req, res) => {
  try {
    // Supprimer tous les challenges existants
    await Challenge.deleteMany({})

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Créer des challenges de test
    const challenges = [
      {
        title: "🚀 Beginner Challenge",
        description: "Perfect to get started! Hold the button as long as possible.",
        startDate: new Date(now.getTime() - 60 * 60 * 1000), // Commencé il y a 1h
        endDate: tomorrow,
        maxParticipants: 100,
        prizePool: 50,
        status: 'active'
      },
      {
        title: "💎 Elite Challenge",
        description: "For true champions! Intensified anti-cheat defenses.",
        startDate: now,
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 jours
        maxParticipants: 50,
        prizePool: 500,
        status: 'active'
      },
      {
        title: "🏆 Grand Weekly Challenge",
        description: "The ultimate challenge with the biggest jackpot!",
        startDate: now,
        endDate: nextWeek,
        maxParticipants: 1000,
        prizePool: 2000,
        status: 'active'
      },
      {
        title: "⚡ Flash Challenge",
        description: "Quick 6-hour challenge only!",
        startDate: now,
        endDate: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 heures
        maxParticipants: 200,
        prizePool: 100,
        status: 'active'
      },
      {
        title: "🌟 Weekend Challenge",
        description: "Special weekend challenge with bonus!",
        startDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Dans 2h
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 jours
        maxParticipants: 300,
        prizePool: 750,
        status: 'upcoming'
      }
    ]

    const createdChallenges = await Challenge.insertMany(challenges)

    res.json({
      message: `${createdChallenges.length} challenges created successfully`,
      challenges: createdChallenges
    })
  } catch (error: any) {
    console.error('Challenge creation error:', error)
    
    // Plus de détails sur l'erreur
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors,
        details: error.message
      })
    }
    
    res.status(500).json({ 
      message: 'Server error during creation',
      error: error.message || 'Unknown error'
    })
  }
})

router.get('/challenges-status', async (req, res) => {
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
    console.error('Challenge status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router