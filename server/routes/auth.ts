import express from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { verifySiweMessage } from '@worldcoin/minikit-js'
import User, { IUser } from '../models/User'
import { auth, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Store pour les nonces (en production, utilise Redis ou une DB)
const nonceStore = new Map()

// Nettoyer les anciens nonces (expiration après 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [nonce, timestamp] of nonceStore.entries()) {
    if (now - timestamp > 5 * 60 * 1000) { // 5 minutes
      nonceStore.delete(nonce)
    }
  }
}, 60 * 1000) // Nettoyer chaque minute

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d',
  })
}

// Fonction pour nettoyer le nom d'utilisateur
const sanitizeUsername = (username: string) => {
  if (!username) return null
  
  // Remplacer les caractères non autorisés par des underscores
  // Le regex autorise seulement lettres, chiffres et underscores
  const sanitized = username.replace(/[^a-zA-Z0-9_]/g, '_')
  
  // S'assurer que le nom fait au moins 3 caractères
  if (sanitized.length < 3) {
    return `user_${sanitized}_${Date.now().toString().slice(-4)}`
  }
  
  // S'assurer que le nom ne dépasse pas 30 caractères
  return sanitized.slice(0, 30)
}

// Fonction pour générer un nom d'utilisateur unique
const generateUniqueUsername = async (baseUsername: string | null, walletAddress: string) => {
  if (!baseUsername) {
    // Fallback: utiliser l'adresse wallet
    baseUsername = `user_${walletAddress.slice(2, 8)}`
  }
  
  let uniqueUsername = baseUsername
  let counter = 1
  
  // Vérifier si le nom d'utilisateur existe déjà
  while (await User.findOne({ username: uniqueUsername })) {
    // Si le nom existe, ajouter un numéro
    const suffix = `_${counter}`
    const maxBaseLength = 30 - suffix.length
    uniqueUsername = baseUsername.slice(0, maxBaseLength) + suffix
    counter++
    
    // Éviter une boucle infinie
    if (counter > 999) {
      uniqueUsername = `user_${Date.now().toString().slice(-8)}`
      break
    }
  }
  
  return uniqueUsername
}

// GET /api/auth/nonce - Générer un nonce pour l'authentification
router.get('/nonce', (req, res) => {
  console.log('📡 Requête nonce reçue')
  console.log('📡 Headers:', req.headers)
  console.log('📡 Origin:', req.get('origin'))
  
  try {
    // Générer un nonce de 8+ caractères alphanumériques
    const nonce = crypto.randomUUID().replace(/-/g, '')
    console.log('✅ Nonce généré:', nonce)
    
    // Stocker le nonce avec timestamp
    nonceStore.set(nonce, Date.now())
    console.log('✅ Nonce stocké dans le store')
    
    // Pour ngrok/cross-origin, on utilise aussi un cookie en backup
    res.cookie('siwe', nonce, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Important pour ngrok
    })
    
    console.log('✅ Cookie nonce défini')
    
    res.json({ 
      nonce,
      timestamp: Date.now(),
      expires: Date.now() + 5 * 60 * 1000
    })
    
  } catch (error: any) {
    console.error('❌ Erreur génération nonce:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate nonce',
      error: error.message
    })
  }
})

// POST /api/auth/complete-siwe - Vérifier l'authentification SIWE
router.post('/complete-siwe', async (req, res) => {
  console.log('📡 Requête vérification SIWE reçue')
  console.log('📡 Body:', req.body)
  console.log('📡 Cookies reçus:', req.cookies)
  
  try {
    const { payload, nonce, minikitUserData } = req.body
    
    if (!payload || !nonce) {
      console.log('❌ Payload ou nonce manquant')
      return res.status(400).json({
        status: 'error',
        isValid: false,
        message: 'Payload et nonce requis'
      })
    }
    
    // Vérifier le nonce dans le store ET dans les cookies
    const storedTimestamp = nonceStore.get(nonce)
    const cookieNonce = req.cookies.siwe
    
    console.log('🔍 Nonce dans store:', !!storedTimestamp)
    console.log('🔍 Nonce dans cookie:', cookieNonce)
    console.log('🔍 Nonce reçu:', nonce)
    
    // Vérifier que le nonce existe (store OU cookie) et n'est pas expiré
    const isNonceValid = storedTimestamp || (cookieNonce === nonce)
    const isNotExpired = storedTimestamp ? (Date.now() - storedTimestamp < 5 * 60 * 1000) : true
    
    if (!isNonceValid || !isNotExpired) {
      console.log('❌ Nonce invalide ou expiré')
      console.log('Valid:', isNonceValid, 'Not expired:', isNotExpired)
      return res.status(400).json({
        status: 'error',
        isValid: false,
        message: 'Invalid or expired nonce'
      })
    }
    
    console.log('✅ Nonce valide, vérification signature...')
    
    // Vérifier le message SIWE
    const validMessage = await verifySiweMessage(payload, nonce)
    console.log('✅ Résultat vérification:', validMessage)
    
    if (validMessage.isValid) {
      // Nettoyer le nonce après utilisation
      nonceStore.delete(nonce)
      res.clearCookie('siwe')
      
      console.log('✅ Authentification réussie pour:', payload.address)
      console.log('📋 Données MiniKit reçues:', minikitUserData)
      
      // Créer ou mettre à jour l'utilisateur avec les données MiniKit
      const walletAddress = payload.address.toLowerCase()
      
      // Préparer les données utilisateur
      const userData: any = {
        walletAddress,
        lastLogin: new Date(),
        authMethod: 'wallet',
        lastWalletSignature: payload.signature,
      }
      
      // Ajouter les données MiniKit si disponibles
      if (minikitUserData) {
        console.log('🔍 Traitement des données MiniKit:', minikitUserData)
        
        if (minikitUserData.username) {
          userData.minikitUsername = minikitUserData.username
          // Utiliser le username MiniKit comme username principal s'il n'existe pas
          const sanitizedUsername = sanitizeUsername(minikitUserData.username)
          userData.username = await generateUniqueUsername(sanitizedUsername, walletAddress)
          userData.displayName = sanitizedUsername // Garder le nom original comme displayName
        }
        
        if (minikitUserData.userId) {
          userData.minikitUserId = minikitUserData.userId
        }
        
        if (minikitUserData.profilePicture) {
          userData.minikitProfilePicture = minikitUserData.profilePicture
          userData.avatar = minikitUserData.profilePicture
        }
        
        if (minikitUserData.verificationLevel) {
          userData.minikitVerificationLevel = minikitUserData.verificationLevel
          userData.verified = minikitUserData.verificationLevel === 'orb'
        }
        
        if (minikitUserData.nullifierHash) {
          userData.worldIdNullifierHash = minikitUserData.nullifierHash
        }
      }
      
      // Si pas de username MiniKit, générer un username basé sur l'adresse wallet
      if (!userData.username) {
        userData.username = await generateUniqueUsername(null, walletAddress)
        userData.displayName = userData.username
      }
      
      console.log('💾 Données utilisateur à sauvegarder:', userData)
      
      try {
        // Chercher l'utilisateur existant ou en créer un nouveau
        let user = await User.findOne({ walletAddress }) as IUser | null
        
        if (user) {
          console.log('👤 Utilisateur existant trouvé:', user._id)
          // Mettre à jour les données existantes
          Object.assign(user, userData)
          await user.save()
          console.log('✅ Utilisateur mis à jour avec succès')
          
          // Generate JWT token for API authentication
          const token = generateToken((user._id as any).toString())
          
          res.json({
            status: 'success',
            isValid: true,
            message: 'Connexion réussie',
            token,
            user: {
              id: (user._id as any).toString(),
              username: user.username,
              displayName: user.displayName,
              walletAddress: user.walletAddress,
              avatar: user.avatar,
              verified: user.verified,
              authMethod: user.authMethod,
              bestTime: user.bestTime,
              totalChallengesPlayed: user.totalChallengesPlayed,
              minikitProfile: user.getMiniKitProfile(),
              publicProfile: user.getPublicProfile()
            }
          })
          
        } else {
          console.log('👤 Création d\'un nouvel utilisateur')
          user = new User(userData) as IUser
          await user.save()
          console.log('✅ Nouvel utilisateur créé avec succès')
          
          // Generate JWT token for API authentication
          const token = generateToken((user._id as any).toString())
          
          res.json({
            status: 'success',
            isValid: true,
            message: 'Compte créé avec succès',
            token,
            user: {
              id: (user._id as any).toString(),
              username: user.username,
              displayName: user.displayName,
              walletAddress: user.walletAddress,
              avatar: user.avatar,
              verified: user.verified,
              authMethod: user.authMethod,
              bestTime: user.bestTime,
              totalChallengesPlayed: user.totalChallengesPlayed,
              minikitProfile: user.getMiniKitProfile(),
              publicProfile: user.getPublicProfile()
            }
          })
        }
        
      } catch (dbError: any) {
        console.error('❌ Erreur base de données:', dbError)
        
        // Si erreur de duplication, essayer de récupérer l'utilisateur existant
        if (dbError.code === 11000) {
          console.log('🔄 Tentative de récupération utilisateur existant...')
          const existingUser = await User.findOne({ walletAddress }) as IUser | null
          if (existingUser) {
            console.log('✅ Utilisateur existant récupéré')
            
            // Generate JWT token for API authentication
            const token = generateToken((existingUser._id as any).toString())
            
            res.json({
              status: 'success',
              isValid: true,
              message: 'Connexion réussie',
              token,
              user: {
                id: (existingUser._id as any).toString(),
                username: existingUser.username,
                displayName: existingUser.displayName,
                walletAddress: existingUser.walletAddress,
                avatar: existingUser.avatar,
                verified: existingUser.verified,
                authMethod: existingUser.authMethod,
                bestTime: existingUser.bestTime,
                totalChallengesPlayed: existingUser.totalChallengesPlayed,
                minikitProfile: existingUser.getMiniKitProfile(),
                publicProfile: existingUser.getPublicProfile()
              }
            })
            return
          }
        }
        
        throw dbError
      }
      
    } else {
      console.log('❌ Signature invalide')
      res.status(400).json({
        status: 'error',
        isValid: false,
        message: 'Invalid signature',
        details: validMessage
      })
    }
    
  } catch (error: any) {
    console.error('❌ Erreur vérification SIWE:', error)
    res.status(500).json({
      status: 'error',
      isValid: false,
      message: error.message || 'Verification failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// GET /api/auth/me - Obtenir le profil utilisateur connecté
router.get('/me', auth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!
    res.json({
      user: {
        id: (user._id as any).toString(),
        username: user.username,
        displayName: user.displayName,
        walletAddress: user.walletAddress,
        avatar: user.avatar,
        verified: user.verified,
        authMethod: user.authMethod,
        bestTime: user.bestTime,
        totalChallengesPlayed: user.totalChallengesPlayed,
        minikitProfile: user.getMiniKitProfile(),
        publicProfile: user.getPublicProfile()
      }
    })
  } catch (error: any) {
    console.error('Erreur profil:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /api/auth/stats - Obtenir les statistiques générales
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const walletUsers = await User.countDocuments({ authMethod: 'wallet' })
    const verifiedUsers = await User.countDocuments({ verified: true })
    
    res.json({
      status: 'success',
      stats: {
        totalUsers,
        walletUsers,
        verifiedUsers,
        nonceStoreSize: nonceStore.size
      }
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// World ID verification endpoint
router.post('/worldcoin-verify', async (req, res, next) => {
  try {
    const { proof, merkle_root, nullifier_hash, action, signal, app_id } = req.body

    console.log('🔍 World ID verification data:', req.body)

    // Vérifier que les données requises sont présentes
    if (!proof || !merkle_root || !nullifier_hash || !action || !app_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required verification data',
      })
    }

    // Vérifier l'action
    if (action !== 'verifyhuman') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action for human verification',
      })
    }

    // Vérifier l'app_id
    if (app_id !== process.env.WORLD_APP_ID && app_id !== 'app_a0673c3ab430fecb1b2ff723784c7720') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid app ID',
      })
    }

    // Vérifier si ce nullifier_hash a déjà été utilisé
    const existingUser = await User.findOne({ humanVerificationNullifier: nullifier_hash })
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'This verification has already been used',
      })
    }

    // TODO: Ici, en production, vous devriez vérifier la preuve avec l'API World ID
    // const { verifyCloudProof } = require('@worldcoin/minikit-js')
    // const verifyRes = await verifyCloudProof(
    //   { proof, merkle_root, nullifier_hash },
    //   app_id,
    //   action,
    //   signal
    // )
    // if (!verifyRes.success) {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Invalid World ID proof',
    //   })
    // }

    // Simuler la vérification réussie pour le développement
    console.log('✅ World ID verification simulated as successful')

    res.status(200).json({
      status: 'success',
      message: 'World ID verification successful',
      data: {
        verified: true,
        nullifier_hash,
        action,
      },
    })
  } catch (error) {
    console.error('❌ World ID verification error:', error)
    next(error)
  }
})

// Mettre à jour le statut de vérification humaine de l'utilisateur
router.post('/update-human-verification', auth, async (req: AuthRequest, res, next) => {
  try {
    const { nullifier_hash, verification_level } = req.body

    if (!nullifier_hash) {
      return res.status(400).json({
        status: 'error',
        message: 'Nullifier hash is required',
      })
    }

    // Vérifier si ce nullifier_hash a déjà été utilisé par un autre utilisateur
    const existingUser = await User.findOne({ 
      humanVerificationNullifier: nullifier_hash,
      _id: { $ne: req.user!._id }
    })

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'This verification has already been used by another user',
      })
    }

    // Mettre à jour l'utilisateur actuel
    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      {
        humanVerified: true,
        humanVerifiedAt: new Date(),
        humanVerificationNullifier: nullifier_hash,
        minikitVerificationLevel: verification_level || 'orb',
        tokenMultiplier: 2, // 2x multiplier pour les humains vérifiés
      },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      })
    }

    console.log(`✅ User ${updatedUser.username} verified as human with 2x token multiplier`)

    res.json({
      status: 'success',
      message: 'Human verification updated successfully',
      data: {
        humanVerified: updatedUser.humanVerified,
        tokenMultiplier: updatedUser.tokenMultiplier,
        verifiedAt: updatedUser.humanVerifiedAt,
        benefits: {
          tokenMultiplier: '2x',
          humanOnlyChallenges: true,
        }
      }
    })

  } catch (error) {
    console.error('❌ Update human verification error:', error)
    next(error)
  }
})

// Obtenir le statut de vérification humaine
router.get('/human-verification-status', auth, async (req: AuthRequest, res, next) => {
  try {
    const user = req.user!

    res.json({
      status: 'success',
      data: {
        humanVerified: user.humanVerified,
        humanVerifiedAt: user.humanVerifiedAt,
        tokenMultiplier: user.tokenMultiplier,
        benefits: {
          tokenMultiplier: user.humanVerified ? '2x' : '1x',
          humanOnlyChallenges: user.humanVerified,
        }
      }
    })

  } catch (error) {
    console.error('❌ Get human verification status error:', error)
    next(error)
  }
})

export default router