import express from 'express'
import User from '../models/User'
import { auth, AuthRequest } from '../middleware/auth'
import { generateSignedVoucher } from '../utils/voucher'

const router = express.Router()

/**
 * GET /api/hodl/balance
 * Récupère la balance de tokens HODL de l'utilisateur
 */
router.get('/balance', auth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json({ 
      balance: user.hodlTokenBalance,
      walletAddress: user.walletAddress 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la balance:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * POST /api/hodl/generate-voucher
 * Génère un voucher signé pour claim des tokens
 */
router.post('/generate-voucher', auth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Vérifier que l'utilisateur a des tokens à claim
    if (user.hodlTokenBalance <= 0) {
      return res.status(400).json({ error: 'Aucun token à claim' })
    }

    // Stocker la balance SANS la débiter immédiatement
    const tokensToHodl = user.hodlTokenBalance

    // Récupérer la clé privée depuis les variables d'environnement
    const privateKey = process.env.TOKEN_PRIVATE_KEY
    if (!privateKey) {
      console.error('TOKEN_PRIVATE_KEY non configurée')
      return res.status(500).json({ error: 'Configuration serveur manquante' })
    }

    // Générer le voucher signé
    const { voucher, signature } = await generateSignedVoucher(
      user.walletAddress,
      tokensToHodl,
      privateKey
    )

    // NE PAS débiter la balance ici - attendre la confirmation de transaction

    res.json({
      voucher,
      signature,
      message: `Voucher généré pour ${tokensToHodl} tokens HODL`
    })
  } catch (error) {
    console.error('Erreur lors de la génération du voucher:', error)
    res.status(500).json({ error: 'Erreur lors de la génération du voucher' })
  }
})

/**
 * POST /api/hodl/claim-success
 * Marque un claim comme réussi (appelé après confirmation de transaction)
 */
router.post('/claim-success', auth, async (req: AuthRequest, res) => {
  try {
    const { transactionHash, amount } = req.body
    
    if (!transactionHash) {
      return res.status(400).json({ error: 'Hash de transaction requis' })
    }

    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // MAINTENANT débiter la balance de l'utilisateur
    const previousBalance = user.hodlTokenBalance
    user.hodlTokenBalance = 0
    await user.save()

    // Log pour le suivi
    console.log(`✅ Claim réussi pour utilisateur ${req.user!.id}:`, {
      transactionHash,
      amount,
      previousBalance,
      newBalance: user.hodlTokenBalance,
      timestamp: new Date()
    })

    res.json({ 
      success: true,
      message: 'Claim confirmé avec succès',
      transactionHash,
      claimedAmount: previousBalance
    })
  } catch (error) {
    console.error('Erreur lors de la confirmation du claim:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * POST /api/hodl/add-tokens
 * Ajoute des tokens à la balance d'un utilisateur (pour tests/admin)
 */
router.post('/add-tokens', auth, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' })
    }

    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    user.hodlTokenBalance += amount
    await user.save()

    res.json({
      success: true,
      newBalance: user.hodlTokenBalance,
      message: `${amount} tokens ajoutés à votre balance`
    })
  } catch (error) {
    console.error('Erreur lors de l\'ajout de tokens:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * POST /api/hodl/claim-failed
 * Marque un claim comme échoué (appelé après échec de transaction)
 */
router.post('/claim-failed', auth, async (req: AuthRequest, res) => {
  try {
    const { error, transactionId } = req.body
    
    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Log pour le suivi
    console.log(`❌ Claim échoué pour utilisateur ${req.user!.id}:`, {
      error,
      transactionId,
      currentBalance: user.hodlTokenBalance,
      timestamp: new Date()
    })

    // Retourner la balance actuelle pour s'assurer que le frontend est synchronisé
    res.json({ 
      success: true,
      message: 'Échec du claim enregistré',
      currentBalance: user.hodlTokenBalance
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'échec:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router 