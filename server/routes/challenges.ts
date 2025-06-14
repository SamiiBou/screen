import express from 'express'
import Challenge from '../models/Challenge'
import Participation from '../models/Participation'
import User from '../models/User'
import { auth, AuthRequest } from '../middleware/auth'
import crypto from 'crypto'
import axios from 'axios'

const router = express.Router()

// Interface pour typer la réponse de l'API World
interface WorldApiTransactionResponse {
  reference: string
  transaction_status: string
  [key: string]: any
}

// Adresse de paiement pour les challenges (même que pour les crédits)
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || '0x21bee69e692ceb4c02b66c7a45620684904ba395'

// Helper function pour vérifier les paiements avec World Coin API
async function verifyPayment(
  txId: string,
  reference: string,
  retries = 12,
  delay = 5000,
): Promise<{ ok: boolean; data?: WorldApiTransactionResponse; pending?: boolean }> {
  console.log(`🔍 [VERIFY PAYMENT] Starting verification for transaction ${txId} with reference ${reference}`)
  
  // Aligner avec la documentation officielle,,
  // https://developer.worldcoin.org/api/v2/minikit/transaction/<txId>?app_id=<APP_ID>
  const url =
    `https://developer.worldcoin.org/api/v2/minikit/transaction/${txId}` +
    `?app_id=${process.env.WORLD_APP_ID}`

  console.log(`🌐 [VERIFY PAYMENT] URL constructed: ${url}`)

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 [VERIFY PAYMENT] Attempt ${i + 1}/${retries} for transaction ${txId}`)
      
      const { data }: { data: WorldApiTransactionResponse } = await axios.get(url, {
        headers: { 
          Authorization: `Bearer ${process.env.WORLD_DEV_PORTAL_API_KEY}` 
        },
        timeout: 15_000,
      })

      console.log(`📡 [VERIFY PAYMENT] API Response received on attempt ${i + 1}:`)
      console.log(`   - Status: success`)
      console.log(`   - Data:`, JSON.stringify(data, null, 2))

      // trouvé ⇒ on sort
      if (data.reference === reference && data.transaction_status !== 'failed') {
        console.log(`✅ [VERIFY PAYMENT] SUCCESS: Payment verified successfully!`)
        console.log(`   - Reference match: ${data.reference === reference} (expected: ${reference}, got: ${data.reference})`)
        console.log(`   - Status valid: ${data.transaction_status !== 'failed'} (got status: ${data.transaction_status})`)
        return { ok: true, data }
      }

      // statut "failed" connu
      if (data.transaction_status === 'failed') {
        console.log(`❌ [VERIFY PAYMENT] FAILED: Transaction marked as failed by World API`)
        return { ok: false, data }
      }

      console.log(`⚠️ [VERIFY PAYMENT] Attempt ${i + 1} - Transaction found but verification failed`)
      console.log(`   - Reference match: ${data.reference === reference} (expected: ${reference}, got: ${data.reference})`)
      console.log(`   - Status: ${data.transaction_status}`)

    } catch (err: any) {
      console.log(`⚠️ [VERIFY PAYMENT] Attempt ${i + 1} failed:`)
      console.log(`   - Error type: ${err.constructor.name}`)
      console.log(`   - HTTP Status: ${err.response?.status}`)
      console.log(`   - Error message: ${err.message}`)
      
      // 404 == pas encore propagé ⇒ retry
      if (err.response?.status === 404) {
        console.log(`   - 404 detected: Transaction not yet propagated, will retry...`)
      } else {
        console.log(`   - Non-404 error: ${err.response?.data}`)
        // Pour les erreurs non-404, on sort immédiatement
        if (i === retries - 1) {
          throw err
        }
      }
    }

    // back-off exponentiel (3 s, 4.5 s, 6.75 s…)
    if (i < retries - 1) {
      const waitTime = delay * Math.pow(1.5, i)
      console.log(`⏳ [VERIFY PAYMENT] Waiting ${Math.round(waitTime)}ms before next attempt...`)
      await new Promise(r => setTimeout(r, waitTime))
    }
  }

  // toujours pas trouvé après n tentatives
  console.log(`❌ [VERIFY PAYMENT] TIMEOUT: Transaction not found after ${retries} attempts`)
  return { ok: false, pending: true }
}

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
    }).sort({ createdAt: -1 })

    res.json({ challenges })
  } catch (error) {
    console.error('Erreur récupération challenges actifs:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /api/challenges/completed - Récupérer les challenges complétés
router.get('/completed', async (req, res) => {
  try {
    const challenges = await Challenge.find({ 
      status: 'completed',
    }).sort({ updatedAt: -1 }) // Trier par date de completion (updatedAt)

    res.json({ challenges })
  } catch (error) {
    console.error('Erreur récupération challenges complétés:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /api/challenges/migrate-participation-price - Migrer les challenges sans participationPrice
router.post('/migrate-participation-price', async (req, res) => {
  try {
    console.log('🔧 [MIGRATION] Starting migration for participationPrice field...')
    
    // Trouver tous les challenges sans participationPrice
    const challengesWithoutPrice = await Challenge.find({ 
      participationPrice: { $exists: false } 
    })
    
    console.log(`🔧 [MIGRATION] Found ${challengesWithoutPrice.length} challenges without participationPrice`)
    
    let updated = 0
    for (const challenge of challengesWithoutPrice) {
      // Assigner un prix par défaut de 0 (gratuit)
      challenge.participationPrice = 0
      await challenge.save()
      updated++
      console.log(`🔧 [MIGRATION] Updated challenge "${challenge.title}" with participationPrice: 0`)
    }
    
    console.log(`🔧 [MIGRATION] Migration completed. Updated ${updated} challenges.`)
    
    res.json({
      success: true,
      message: `Migration completed. Updated ${updated} challenges.`,
      updatedCount: updated
    })
  } catch (error) {
    console.error('❌ [MIGRATION] Migration failed:', error)
    res.status(500).json({ 
      success: false,
      message: 'Migration failed',
      error: (error as Error).message 
    })
  }
})

// POST /api/challenges/fix-completed-challenges - Corriger les challenges qui devraient être complétés
router.post('/fix-completed-challenges', async (req, res) => {
  try {
    console.log('🔧 [FIX CHALLENGES] Starting fix for challenges that should be completed...')
    
    // Trouver tous les challenges actifs
    const activeChallenges = await Challenge.find({ status: 'active' })
    
    console.log(`🔧 [FIX CHALLENGES] Found ${activeChallenges.length} active challenges to check`)
    
    let fixed = 0
    for (const challenge of activeChallenges) {
      // Compter le nombre de participants qui ont effectivement joué (timeHeld > 0)
      const participationQuery = challenge.participationPrice > 0 
        ? { challengeId: challenge._id, paymentStatus: 'completed', timeHeld: { $gt: 0 } }
        : { challengeId: challenge._id, timeHeld: { $gt: 0 } }

      const completedParticipations = await Participation.countDocuments(participationQuery)

      console.log(`🎯 [FIX CHALLENGES] Challenge "${challenge.title}":`)
      console.log(`   - Max participants: ${challenge.maxParticipants}`)
      console.log(`   - Current participants: ${challenge.currentParticipants}`)
      console.log(`   - Completed participations: ${completedParticipations}`)

      // Si le challenge est plein et que tous ont joué, le marquer comme complété
      if (challenge.currentParticipants >= challenge.maxParticipants && 
          completedParticipations >= challenge.maxParticipants) {
        
        console.log(`✅ [FIX CHALLENGES] Marking challenge "${challenge.title}" as completed`)
        
        await Challenge.findByIdAndUpdate(challenge._id, {
          status: 'completed'
        })
        
        fixed++
        console.log(`🎉 [FIX CHALLENGES] Challenge "${challenge.title}" has been fixed!`)
      }
    }
    
    console.log(`🔧 [FIX CHALLENGES] Fix completed. Updated ${fixed} challenges.`)
    
    res.json({
      success: true,
      message: `Fix completed. Updated ${fixed} challenges.`,
      fixedCount: fixed,
      checkedCount: activeChallenges.length
    })
  } catch (error) {
    console.error('❌ [FIX CHALLENGES] Fix failed:', error)
    res.status(500).json({ 
      success: false,
      message: 'Fix failed',
      error: (error as Error).message 
    })
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
        maxParticipants: 100,
        firstPrize: 300,
        secondPrize: 150,
        thirdPrize: 50,
        participationPrice: 0.5,
        status: 'active'
      },
      {
        title: "⚡ Lightning Round",
        description: "Quick 6-hour challenge! Show your dedication in this intense short burst competition.",
        maxParticipants: 50,
        firstPrize: 120,
        secondPrize: 60,
        thirdPrize: 20,
        participationPrice: 0.2,
        status: 'active'
      },
      {
        title: "🏆 Champion's Trial",
        description: "The ultimate test of patience and determination. Only the most dedicated will prevail in this week-long challenge.",
        maxParticipants: 200,
        firstPrize: 600,
        secondPrize: 300,
        thirdPrize: 100,
        participationPrice: 1.0,
        status: 'active'
      },
      {
        title: "🌟 Rookie Challenge",
        description: "Perfect for newcomers! A gentle introduction to button endurance gaming with beginner-friendly duration.",
        maxParticipants: 75,
        firstPrize: 90,
        secondPrize: 45,
        thirdPrize: 15,
        participationPrice: 0,
        status: 'upcoming'
      },
      {
        title: "💪 Midnight Madness",
        description: "For night owls and insomniacs! This late-night challenge tests your ability to stay focused when others sleep.",
        maxParticipants: 80,
        firstPrize: 210,
        secondPrize: 105,
        thirdPrize: 35,
        participationPrice: 0.3,
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
    console.log('🆕 [CREATE-CHALLENGE DEBUG] ===== CREATING NEW CHALLENGE =====')
    console.log('🆕 [CREATE-CHALLENGE DEBUG] Request body:', req.body)
    
    const { title, description, maxParticipants, firstPrize, secondPrize, thirdPrize, participationPrice } = req.body

    console.log('🆕 [CREATE-CHALLENGE DEBUG] Extracted fields:', {
      title,
      description,
      maxParticipants,
      firstPrize,
      secondPrize,
      thirdPrize,
      participationPrice,
      participationPriceType: typeof participationPrice
    })

    const challengeData = {
      title,
      description,
      maxParticipants,
      firstPrize,
      secondPrize,
      thirdPrize,
      participationPrice,
      status: 'active'
    }

    console.log('🆕 [CREATE-CHALLENGE DEBUG] Challenge data before creation:', challengeData)

    const challenge = new Challenge(challengeData)

    console.log('🆕 [CREATE-CHALLENGE DEBUG] Challenge object after instantiation:', {
      title: challenge.title,
      participationPrice: challenge.participationPrice,
      hasParticipationPrice: 'participationPrice' in challenge,
      participationPriceType: typeof challenge.participationPrice
    })

    await challenge.save()

    console.log('🆕 [CREATE-CHALLENGE DEBUG] Challenge saved to database')
    console.log('🆕 [CREATE-CHALLENGE DEBUG] Challenge after save:', {
      id: challenge._id,
      title: challenge.title,
      participationPrice: challenge.participationPrice,
      hasParticipationPrice: 'participationPrice' in challenge
    })

    res.status(201).json({
      message: 'Challenge créé avec succès',
      challenge
    })
  } catch (error) {
    console.error('❌ [CREATE-CHALLENGE DEBUG] Error creating challenge:', error)
    console.error('❌ [CREATE-CHALLENGE DEBUG] Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    res.status(500).json({ message: 'Erreur serveur lors de la création' })
  }
})

// POST /api/challenges/create-1v1 - Create a 1v1 duel challenge
router.post('/create-1v1', auth, async (req: AuthRequest, res) => {
  try {
    const { participationPrice } = req.body
    const allowedPrices = [1, 5, 10]

    if (!req.user || req.user.walletAddress.toLowerCase() !== '0x21bee69e692ceb4c02b66c7a45620684904ba395') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    if (!allowedPrices.includes(Number(participationPrice))) {
      return res.status(400).json({ message: 'Invalid price' })
    }

    const prizeMap: Record<number, number> = { 1: 1.7, 5: 8.5, 10: 17 }

    const challenge = new Challenge({
      title: '1v1 Duel',
      description: `Duel entry ${participationPrice} WLD`,
      maxParticipants: 2,
      firstPrize: prizeMap[participationPrice],
      secondPrize: 0,
      thirdPrize: 0,
      participationPrice: participationPrice,
      status: 'active'
    })

    await challenge.save()

    res.status(201).json({ message: '1v1 challenge created', challenge })
  } catch (err) {
    console.error('Error creating 1v1 challenge:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/challenges/initiate-participation-payment - Initier le paiement de participation
router.post('/initiate-participation-payment', auth, async (req: AuthRequest, res) => {
  try {
    const { challengeId } = req.body
    
    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID is required' })
    }

    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' })
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({ error: 'Challenge is not active' })
    }

    if (challenge.participationPrice <= 0) {
      return res.status(400).json({ error: 'This challenge is free to join' })
    }

    // Refuser le paiement si le challenge est plein
    if (challenge.currentParticipants >= challenge.maxParticipants) {
      return res.status(400).json({ error: 'Challenge is full' })
    }

    // MODIFICATION: Vérifier si l'utilisateur a déjà une participation COMPLÉTÉE
    const completedParticipation = await Participation.findOne({
      userId: req.user!._id,
      challengeId,
      paymentStatus: 'completed'
    })

    if (completedParticipation) {
      return res.status(400).json({ error: 'You have already participated in this challenge' })
    }

    // MODIFICATION: Supprimer toute participation pending/failed existante pour permettre une nouvelle tentative
    await Participation.deleteMany({
      userId: req.user!._id,
      challengeId,
      paymentStatus: { $in: ['pending', 'failed'] }
    })

    // Générer un ID de référence unique
    const reference = crypto.randomUUID().replace(/-/g, '')
    
    // Créer une nouvelle participation en attente de paiement
    const participation = new Participation({
      userId: req.user!._id,
      challengeId,
      timeHeld: 0, // Sera mis à jour après le jeu
      challengesCompleted: 0,
      eliminationReason: 'completed',
      paymentReference: reference,
      wldPaid: challenge.participationPrice,
      paymentStatus: 'pending'
    })

    await participation.save()

    res.json({ 
      reference,
      challengeId,
      participationPrice: challenge.participationPrice,
      paymentAddress: PAYMENT_ADDRESS
    })
  } catch (error) {
    console.error('Error initiating challenge participation payment:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/challenges/confirm-participation-payment - Confirmer le paiement de participation
router.post('/confirm-participation-payment', auth, async (req: AuthRequest, res) => {
  try {
    console.log('🎯 [PAYMENT CONFIRM] ===== PAYMENT CONFIRMATION REQUEST RECEIVED =====')
    console.log('🎯 [PAYMENT CONFIRM] Request method:', req.method)
    console.log('🎯 [PAYMENT CONFIRM] Request headers:', req.headers)
    console.log('🎯 [PAYMENT CONFIRM] Request body (raw):', req.body)
    console.log('🎯 [PAYMENT CONFIRM] Request body type:', typeof req.body)
    console.log('🎯 [PAYMENT CONFIRM] Request body JSON:', JSON.stringify(req.body))
    
    // CORRECTION: Utiliser transaction_id au lieu de transactionId pour matcher le frontend
    const { reference, transaction_id } = req.body
    
    console.log('🎯 [PAYMENT CONFIRM] Extracted values:')
    console.log('   - reference:', reference, typeof reference)
    console.log('   - transaction_id:', transaction_id, typeof transaction_id)
    console.log('   - User ID:', req.user!._id)
    
    if (!reference || !transaction_id) {
      console.log('❌ [PAYMENT CONFIRM] Missing required fields!')
      console.log('   - reference missing:', !reference)
      console.log('   - transaction_id missing:', !transaction_id)
      return res.status(400).json({ error: 'Missing reference or transaction_id' })
    }

    // Trouver la participation en attente
    const participation = await Participation.findOne({
      paymentReference: reference,
      userId: req.user!._id,
      paymentStatus: 'pending'
    }).populate('challengeId')

    if (!participation) {
      return res.status(404).json({ error: 'Participation request not found' })
    }

    const freshChallenge = await Challenge.findById(participation.challengeId._id)
    if (freshChallenge && freshChallenge.currentParticipants >= freshChallenge.maxParticipants) {
      return res.status(400).json({ error: 'Challenge is full' })
    }

    // Pour les tests, accepter tous les paiements (à enlever en production)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('🧪 [PAYMENT DEBUG] DEVELOPMENT MODE: Auto-approving payment for testing')
      
      // Mettre à jour la participation comme payée
      participation.paymentStatus = 'completed'
      participation.transactionId = transaction_id
      await participation.save()

      // Incrémenter le nombre de participants du challenge
      await Challenge.findByIdAndUpdate(participation.challengeId._id, {
        $inc: { currentParticipants: 1 }
      })
      
      res.json({ 
        success: true,
        message: 'Payment confirmed (TEST MODE), you can now join the challenge!',
        participationId: participation._id
      })
      return
    }

    // CORRECTION: Utiliser la nouvelle fonction verifyPayment
    try {
      const result = await verifyPayment(transaction_id, reference)
      
      if (result.ok) {
        // Mettre à jour la participation comme payée
        participation.paymentStatus = 'completed'
        participation.transactionId = transaction_id
        await participation.save()

        // Incrémenter le nombre de participants du challenge
        await Challenge.findByIdAndUpdate(participation.challengeId._id, {
          $inc: { currentParticipants: 1 }
        })
        
        console.log(`✅ [PAYMENT SUCCESS] Payment confirmed for user ${req.user!._id}, transaction ${transaction_id}`)
        
        res.json({ 
          success: true,
          message: 'Payment confirmed, you can now join the challenge!',
          participationId: participation._id
        })
      } else if (result.pending) {
        // CORRECTION: Gérer le cas pending différemment
        participation.transactionId = transaction_id
        await participation.save()
        
        console.log(`⏳ [PAYMENT PENDING] Payment marked as pending for verification: ${transaction_id}`)
        
        res.json({
          success: true,
          status: 'pending_verification',
          message: 'Transaction still being processed. You can start playing while we verify your payment.',
          participationId: participation._id,
          transactionId: transaction_id,
          note: 'Your payment has been detected. If you experience any issues, contact support with transaction ID: ' + transaction_id
        })
      } else {
        // cas "failed"
        participation.paymentStatus = 'failed'
        participation.transactionId = transaction_id
        await participation.save()
        
        console.log(`❌ [PAYMENT FAILED] Payment verification failed for transaction ${transaction_id}`)
        res.status(400).json({ error: 'Transaction verification failed' })
      }
    } catch (worldApiError: any) {
      console.error('Error verifying with World API:', worldApiError.response?.data || worldApiError.message)
      
      // Au lieu de rejeter complètement, laisser la participation en pending pour vérification manuelle
      participation.transactionId = transaction_id
      await participation.save()
      
      console.log(`⏳ [PAYMENT PENDING] Payment marked as pending for manual verification: ${transaction_id}`)
      
      // Retourner un succès conditionnel pour éviter l'erreur 500 côté client
      res.json({
        success: true,
        message: 'Payment received! Verification is in progress. You can start playing while we confirm your transaction.',
        status: 'pending_verification',
        participationId: participation._id,
        transactionId: transaction_id,
        note: 'Your payment has been detected. If you experience any issues during gameplay, contact support with transaction ID: ' + transaction_id
      })
    }
  } catch (error) {
    console.error('Error confirming challenge participation payment:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Route pour lister les paiements en attente (admin only)
router.get('/pending-payments', auth, async (req: AuthRequest, res) => {
  try {
    // Vérifier si l'utilisateur est admin (vous pouvez ajuster cette logique selon vos besoins)
    // if (!req.user!.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' })
    // }

    const pendingPayments = await Participation.find({
      paymentStatus: 'pending',
      transactionId: { $ne: 'pending' }
    })
    .populate('userId', 'username email')
    .populate('challengeId', 'title')
    .sort({ createdAt: -1 })

    res.json({ 
      pendingPayments,
      count: pendingPayments.length
    })
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Route pour vérifier manuellement les paiements en attente (admin only)
router.post('/verify-pending-payment', auth, async (req: AuthRequest, res) => {
  try {
    const { participationId, forceApprove } = req.body
    
    // Vérifier si l'utilisateur est admin (vous pouvez ajuster cette logique selon vos besoins)
    // if (!req.user!.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' })
    // }

    if (!participationId) {
      return res.status(400).json({ error: 'participationId is required' })
    }

    const participation = await Participation.findById(participationId).populate('challengeId')
    
    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' })
    }

    if (participation.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Payment is not pending' })
    }

    if (!participation.transactionId || participation.transactionId === 'pending') {
      return res.status(400).json({ error: 'No transaction ID found' })
    }

    if (forceApprove) {
      // Forcer l'approbation sans vérification API
      participation.paymentStatus = 'completed'
      await participation.save()

      await Challenge.findByIdAndUpdate(participation.challengeId._id, {
        $inc: { currentParticipants: 1 }
      })

      console.log(`✅ [MANUAL VERIFY] Payment manually approved for participation ${participationId}`)
      
      res.json({ 
        success: true, 
        message: 'Payment manually approved',
        participationId: participation._id
      })
    } else {
      // CORRECTION: Utiliser la nouvelle fonction verifyPayment
      try {
        console.log(`🔧 [MANUAL VERIFY] Starting API verification for transaction ${participation.transactionId}`)
        
        const result = await verifyPayment(participation.transactionId, participation.paymentReference)
        
        if (result.ok) {
          participation.paymentStatus = 'completed'
          await participation.save()

          await Challenge.findByIdAndUpdate(participation.challengeId._id, {
            $inc: { currentParticipants: 1 }
          })
          
          console.log(`✅ [API VERIFY] Payment verified via API for participation ${participationId}`)
          
          res.json({ 
            success: true, 
            message: 'Payment verified successfully',
            participationId: participation._id
          })
        } else {
          console.log(`❌ [MANUAL VERIFY] FAILURE: Transaction verification failed`)
          res.status(400).json({ 
            error: 'Transaction verification failed',
            pending: result.pending || false
          })
        }
      } catch (apiError: any) {
        console.error('❌ [MANUAL VERIFY] API verification failed:', apiError)
        
        res.status(400).json({ 
          error: 'API verification failed', 
          details: apiError.response?.data?.detail || apiError.message 
        })
      }
    }
  } catch (error) {
    console.error('Error in manual payment verification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Route pour qu'un utilisateur puisse relancer la vérification de son paiement
router.post('/retry-payment-verification', auth, async (req: AuthRequest, res) => {
  try {
    const { participationId } = req.body
    
    if (!participationId) {
      return res.status(400).json({ error: 'participationId is required' })
    }

    // Vérifier que la participation appartient à l'utilisateur actuel
    const participation = await Participation.findOne({
      _id: participationId,
      userId: req.user!._id,
      paymentStatus: 'pending'
    }).populate('challengeId')
    
    if (!participation) {
      return res.status(404).json({ error: 'Participation not found or already verified' })
    }

    if (!participation.transactionId || participation.transactionId === 'pending') {
      return res.status(400).json({ error: 'No transaction ID found to verify' })
    }

    console.log(`🔄 [USER RETRY] User ${req.user!._id} requesting verification retry for transaction ${participation.transactionId}`)

    // CORRECTION: Utiliser la nouvelle fonction verifyPayment avec des paramètres plus agressifs
    try {
      const result = await verifyPayment(participation.transactionId, participation.paymentReference, 10, 2000)
      
      if (result.ok) {
        participation.paymentStatus = 'completed'
        await participation.save()

        await Challenge.findByIdAndUpdate(participation.challengeId._id, {
          $inc: { currentParticipants: 1 }
        })
        
        console.log(`✅ [USER RETRY SUCCESS] Payment verified for user ${req.user!._id}, transaction ${participation.transactionId}`)
        
        res.json({ 
          success: true,
          message: 'Payment successfully verified! You can now participate.',
          participationId: participation._id,
          paymentStatus: 'completed'
        })
      } else {
        console.log(`❌ [USER RETRY FAILED] Payment verification still failed after retry`)
        res.json({
          success: false,
          message: 'Verification still pending. Your transaction may need more time to be processed.',
          participationId: participation._id,
          paymentStatus: 'pending',
          suggestion: 'Please try again in a few minutes or contact support if the issue persists.',
          pending: result.pending || false
        })
      }
    } catch (error: any) {
      console.error('Error in user retry verification:', error.response?.data || error.message)
      res.json({
        success: false,
        message: 'Verification is still in progress. Please try again later.',
        participationId: participation._id,
        paymentStatus: 'pending',
        error: 'API temporarily unavailable'
      })
    }
  } catch (error) {
    console.error('Error in retry payment verification:', error)
    res.status(500).json({ error: 'Internal server error' })
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
    console.log('🔍 [GET-CHALLENGE DEBUG] ===== GETTING CHALLENGE =====')
    console.log('🔍 [GET-CHALLENGE DEBUG] Challenge ID:', req.params.challengeId)
    
    const challenge = await Challenge.findById(req.params.challengeId)
    
    if (!challenge) {
      console.log('❌ [GET-CHALLENGE DEBUG] Challenge not found')
      return res.status(404).json({ message: 'Challenge non trouvé' })
    }

    console.log('📋 [GET-CHALLENGE DEBUG] Challenge found:', {
      id: challenge._id,
      title: challenge.title,
      participationPrice: challenge.participationPrice,
      hasParticipationPriceField: 'participationPrice' in challenge
    })

    res.json({ challenge })
  } catch (error) {
    console.error('❌ [GET-CHALLENGE DEBUG] Error fetching challenge:', error)
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

    if (challenge.currentParticipants >= challenge.maxParticipants) {
      return res.status(400).json({ message: 'Challenge complet' })
    }

    // Pour les challenges payants, vérifier qu'il y a une participation payée
    if (challenge.participationPrice > 0) {
      // Chercher SEULEMENT une participation avec paiement complété
      const paidParticipation = await Participation.findOne({
        userId,
        challengeId,
        paymentStatus: 'completed'
      })

      if (!paidParticipation) {
        return res.status(400).json({ 
          message: 'Vous devez payer pour participer à ce challenge' 
        })
      }

      // Vérifier si l'utilisateur a déjà soumis ses résultats
      if (paidParticipation.timeHeld > 0) {
        return res.status(400).json({ 
          message: 'Vous avez déjà participé à ce challenge' 
        })
      }

      // Mettre à jour la participation existante avec les résultats
      paidParticipation.timeHeld = timeHeld
      paidParticipation.challengesCompleted = challengesCompleted || 0
      paidParticipation.eliminationReason = eliminationReason
      
      await paidParticipation.save()

      await User.findByIdAndUpdate(userId, {
        $inc: { totalChallengesPlayed: 1 },
        $max: { bestTime: timeHeld }
      })

      await calculateRankings(challengeId)

      res.status(201).json({
        message: 'Participation enregistrée avec succès',
        participation: paidParticipation
      })
    } else {
      // Challenge gratuit - permettre la mise à jour s'il existe déjà une participation sans résultat
      const existingParticipation = await Participation.findOne({ userId, challengeId })

      if (existingParticipation) {
        if (existingParticipation.timeHeld > 0) {
          // L'utilisateur a déjà terminé ce challenge
          return res.status(400).json({ 
            message: 'Vous avez déjà participé à ce challenge' 
          })
        }

        // Mettre à jour la participation existante (tentative déjà créée mais pas terminée)
        existingParticipation.timeHeld = timeHeld
        existingParticipation.challengesCompleted = challengesCompleted || 0
        existingParticipation.eliminationReason = eliminationReason

        await existingParticipation.save()

        await User.findByIdAndUpdate(userId, {
          $inc: { totalChallengesPlayed: 1 },
          $max: { bestTime: timeHeld }
        })

        await calculateRankings(challengeId)

        return res.status(201).json({
          message: 'Participation mise à jour avec succès',
          participation: existingParticipation
        })
      }

      // Aucune participation précédente – créer une nouvelle entrée
      const participation = new Participation({
        userId,
        challengeId,
        timeHeld,
        challengesCompleted: challengesCompleted || 0,
        eliminationReason,
        paymentReference: 'free',
        wldPaid: 0,
        paymentStatus: 'completed'
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
    }
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

    console.log('🔍 [CAN-PARTICIPATE DEBUG] ===== CHECKING PARTICIPATION =====')
    console.log('🔍 [CAN-PARTICIPATE DEBUG] Challenge ID:', challengeId)
    console.log('🔍 [CAN-PARTICIPATE DEBUG] User ID:', userId)

    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      console.log('❌ [CAN-PARTICIPATE DEBUG] Challenge not found')
      return res.status(404).json({ message: 'Challenge non trouvé' })
    }

    console.log('💰 [CAN-PARTICIPATE DEBUG] Challenge participation price:', challenge.participationPrice)

    if (challenge.participationPrice > 0) {
      console.log('💳 [CAN-PARTICIPATE DEBUG] This is a PAID challenge, checking payment status...')
      
      // Challenge payant - vérifier le statut de paiement
      const paidParticipation = await Participation.findOne({
        userId,
        challengeId,
        paymentStatus: 'completed'
      })
      console.log('✅ [CAN-PARTICIPATE DEBUG] Completed participation found:', paidParticipation)

      // MODIFICATION: Récupérer les participations pending avec une logique plus stricte
      const pendingParticipation = await Participation.findOne({
        userId,
        challengeId,
        paymentStatus: 'pending',
        transactionId: { $ne: 'pending' } // Seulement si une transaction est en cours
      })
      console.log('⏳ [CAN-PARTICIPATE DEBUG] Pending participation found:', pendingParticipation)

      // MODIFICATION: Si une participation failed existe, permettre une nouvelle tentative
      const failedParticipation = await Participation.findOne({
        userId,
        challengeId,
        paymentStatus: 'failed'
      })
      console.log('❌ [CAN-PARTICIPATE DEBUG] Failed participation found:', failedParticipation)

      const response = { 
        canParticipate: !!paidParticipation && paidParticipation.timeHeld === 0,
        needsPayment: !paidParticipation && !pendingParticipation, // Peut payer si pas de participation completed ni pending avec transaction
        hasPendingPayment: !!pendingParticipation,
        hasPaid: !!paidParticipation,
        participationPrice: challenge.participationPrice,
        paymentStatus: paidParticipation?.paymentStatus || (pendingParticipation?.paymentStatus || (failedParticipation?.paymentStatus || 'none'))
      }

      console.log('📊 [CAN-PARTICIPATE DEBUG] Response for PAID challenge:', response)
      res.json(response)
    } else {
      console.log('🆓 [CAN-PARTICIPATE DEBUG] This is a FREE challenge, checking existing participation...')
      
      // Challenge gratuit - logique originale
      const existingParticipation = await Participation.findOne({
        userId,
        challengeId
      })
      console.log('👤 [CAN-PARTICIPATE DEBUG] Existing participation found:', existingParticipation)

      const response = { 
        canParticipate: !existingParticipation,
        needsPayment: false,
        hasPendingPayment: false,
        hasPaid: true,
        participationPrice: 0
      }

      console.log('📊 [CAN-PARTICIPATE DEBUG] Response for FREE challenge:', response)
      res.json(response)
    }
  } catch (error) {
    console.error('❌ [CAN-PARTICIPATE DEBUG] Error checking participation:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

async function calculateRankings(challengeId: string) {
  try {
    // MODIFICATION: Ne calculer les rangs que pour les participations avec paiement complété
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      console.error('Challenge not found for ranking calculation')
      return
    }

    const participationQuery = challenge.participationPrice > 0 
      ? { challengeId, paymentStatus: 'completed' }
      : { challengeId }

    const participations = await Participation.find(participationQuery)
      .sort({ timeHeld: -1, challengesCompleted: -1, createdAt: 1 })

    for (let i = 0; i < participations.length; i++) {
      await Participation.findByIdAndUpdate(participations[i]._id, {
        rank: i + 1
      })
    }

    // NOUVELLE LOGIQUE: Vérifier si le challenge doit être marqué comme complété
    await checkAndUpdateChallengeCompletion(challengeId)
  } catch (error) {
    console.error('Erreur calcul classements:', error)
  }
}

// NOUVELLE FONCTION: Vérifier et mettre à jour le statut de completion du challenge
async function checkAndUpdateChallengeCompletion(challengeId: string) {
  try {
    const challenge = await Challenge.findById(challengeId)
    if (!challenge || challenge.status !== 'active') {
      return // Pas besoin de vérifier si le challenge n'est pas actif
    }

    // Compter le nombre de participants qui ont effectivement joué (timeHeld > 0)
    const participationQuery = challenge.participationPrice > 0 
      ? { challengeId, paymentStatus: 'completed', timeHeld: { $gt: 0 } }
      : { challengeId, timeHeld: { $gt: 0 } }

    const completedParticipations = await Participation.countDocuments(participationQuery)

    console.log(`🎯 [CHALLENGE COMPLETION CHECK] Challenge: ${challenge.title}`)
    console.log(`   - Max participants: ${challenge.maxParticipants}`)
    console.log(`   - Current participants: ${challenge.currentParticipants}`)
    console.log(`   - Completed participations: ${completedParticipations}`)

    // Conditions pour marquer le challenge comme complété:
    // 1. Le nombre de participants actuels >= nombre maximum
    // 2. Tous les participants ont joué (timeHeld > 0)
    if (challenge.currentParticipants >= challenge.maxParticipants && 
        completedParticipations >= challenge.maxParticipants) {
      
      console.log(`✅ [CHALLENGE COMPLETION] Marking challenge "${challenge.title}" as completed`)
      
      await Challenge.findByIdAndUpdate(challengeId, {
        status: 'completed'
      })

      console.log(`🎉 [CHALLENGE COMPLETION] Challenge "${challenge.title}" has been marked as completed!`)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de completion du challenge:', error)
  }
}

export default router
