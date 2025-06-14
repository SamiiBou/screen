import express from 'express'
import Challenge from '../models/Challenge'
import { auth, AuthRequest } from '../middleware/auth'

const router = express.Router()

const PRIZE_BY_ENTRY: Record<number, number> = {
  1: 1.7,
  5: 8.5,
  10: 17
}

// POST /api/duels/create - Create a new 1v1 duel
router.post('/create', auth, async (req: AuthRequest, res) => {
  try {
    const { entryFee } = req.body
    const fee = Number(entryFee)

    if (![1, 5, 10].includes(fee)) {
      return res.status(400).json({ message: 'Invalid entry fee' })
    }

    const duel = new Challenge({
      title: '1v1 Duel',
      description: 'Head to head duel',
      maxParticipants: 2,
      firstPrize: PRIZE_BY_ENTRY[fee],
      secondPrize: 0,
      thirdPrize: 0,
      participationPrice: fee,
      isDuel: true,
      status: 'active'
    })

    await duel.save()
    res.status(201).json({ duel })
  } catch (err) {
    console.error('Error creating duel:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/duels/active - List active duels
router.get('/active', async (_req, res) => {
  try {
    const duels = await Challenge.find({ status: 'active', isDuel: true }).sort({ createdAt: -1 })
    res.json({ duels })
  } catch (err) {
    console.error('Error fetching duels:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
