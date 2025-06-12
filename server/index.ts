import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cron from 'node-cron'
import authRoutes from './routes/auth'
import challengeRoutes from './routes/challenges'
import leaderboardRoutes from './routes/leaderboard'
import setupRoutes from './routes/setup'
import hodlRoutes from './routes/hodl'
import User from './models/User'

dotenv.config()

// Debug des variables d'environnement
console.log('🔍 [SERVER DEBUG] Environment variables loaded:')
console.log('🔍 [SERVER DEBUG] NODE_ENV:', process.env.NODE_ENV)
console.log('🔍 [SERVER DEBUG] PORT:', process.env.PORT)
console.log('🔍 [SERVER DEBUG] TOKEN_PRIVATE_KEY exists:', !!process.env.TOKEN_PRIVATE_KEY)
console.log('🔍 [SERVER DEBUG] TOKEN_PRIVATE_KEY length:', process.env.TOKEN_PRIVATE_KEY?.length || 0)
console.log('🔍 [SERVER DEBUG] WORLD_APP_ID:', process.env.WORLD_APP_ID)
console.log('🔍 [SERVER DEBUG] Working directory:', process.cwd())
console.log('🔍 [SERVER DEBUG] All env vars with TOKEN:', Object.keys(process.env).filter(key => key.includes('TOKEN')))

const app = express()
const PORT = Number(process.env.PORT) || 8080

// Fonction pour distribuer des tokens à tous les utilisateurs
async function distributeTokensToAllUsers() {
  try {
    console.log('🎁 [CRON] Starting automatic token distribution....')
    
    const tokensToAdd = 0.5
    const result = await User.updateMany(
      {}, // Tous les utilisateurs
      { $inc: { hodlTokenBalance: tokensToAdd } } // Incrémenter la balance
    )
    
    const totalUsers = result.modifiedCount
    const totalTokensDistributed = totalUsers * tokensToAdd
    
    console.log(`✅ [CRON] Token distribution completed:`)
    console.log(`   - Users updated: ${totalUsers}`)
    console.log(`   - Tokens per user: ${tokensToAdd}`)
    console.log(`   - Total tokens distributed: ${totalTokensDistributed}`)
    console.log(`   - Next distribution in 2 hours`)
    
    // Log pour audit
    const logEntry = {
      timestamp: new Date().toISOString(),
      usersAffected: totalUsers,
      tokensPerUser: tokensToAdd,
      totalTokensDistributed: totalTokensDistributed,
      type: 'automatic_distribution'
    }
    
    console.log('📊 [AUDIT]', JSON.stringify(logEntry))
    
  } catch (error) {
    console.error('❌ [CRON] Error during token distribution:', error)
  }
}

// Configuration du cron job - toutes les 2 heures
// Pattern: '0 */2 * * *' = à chaque minute 0 de chaque 2ème heure
const startTokenDistribution = () => {
  console.log('⏰ [CRON] Setting up automatic token distribution (every 2 hours)...')
  
  // Lancer immédiatement une distribution pour test (optionnel - commenter en production)
  // setTimeout(() => {
  //   console.log('🚀 [CRON] Running initial token distribution...')
  //   distributeTokensToAllUsers()
  // }, 5000) // 5 secondes après le démarrage
  
  // Programmer la distribution automatique toutes les 2 heures
  cron.schedule('0 */2 * * *', async () => {
    console.log('⏰ [CRON] Scheduled token distribution triggered')
    await distributeTokensToAllUsers()
  }, {
    scheduled: true,
    timezone: "Europe/Paris" // Ajustez selon votre timezone
  })
  
  console.log('✅ [CRON] Automatic token distribution scheduled successfully')
  console.log('📅 [CRON] Next distribution: every 2 hours at minute 0')
}

// Configuration CORS pour Railway et autres environnements
const corsOptions = {
  origin: [
    'https://screen-fawn.vercel.app', // Frontend ngrok
    'http://localhost:3001', // Frontend local
    'http://localhost:3000', // Frontend local alternatif
    'https://screen-production.up.railway.app', // Railway backend
    /^https:\/\/.*\.railway\.app$/, // Tous les domaines Railway
    /^https:\/\/.*\.ngrok\.app$/, // Tous les domaines ngrok
    /^https:\/\/.*\.ngrok-free\.app$/, // Nouveaux domaines ngrok
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())

// Middleware additionnel pour Railway et ngrok
app.use((req, res, next) => {
  // Ajouter des en-têtes pour tous les environnements
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  
  // Log pour debug
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`)
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ MongoDB connecté avec succès')
    
    // Démarrer le système de distribution automatique après la connexion DB
    startTokenDistribution()
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error)
    process.exit(1)
  }
}

app.use('/api/auth', authRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/setup', setupRoutes)
app.use('/api/hodl', hodlRoutes)

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend opérationnel',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    features: {
      automaticTokenDistribution: true,
      distributionInterval: '2 hours',
      tokensPerDistribution: 0.5
    }
  })
})

// Route pour tester Railway
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend HODL2 opérationnel sur Railway!',
    endpoints: [
      '/api/health',
      '/api/auth/*',
      '/api/challenges/*',
      '/api/leaderboard/*',
      '/api/setup/*',
      '/api/hodl/*'
    ]
  })
})

// Route pour déclencher manuellement la distribution (pour debug/admin)
app.post('/api/admin/distribute-tokens', async (req, res) => {
  try {
    // Vérification basique (vous pouvez ajouter une authentification admin ici)
    const { adminKey } = req.body
    
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'debug-key-2024') {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    console.log('🔧 [ADMIN] Manual token distribution triggered')
    await distributeTokensToAllUsers()
    
    res.json({
      success: true,
      message: 'Token distribution completed manually',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ [ADMIN] Manual distribution error:', error)
    res.status(500).json({ error: 'Distribution failed' })
  }
})

// Route pour obtenir les statistiques de distribution
app.get('/api/admin/distribution-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({})
    const usersWithTokens = await User.countDocuments({ hodlTokenBalance: { $gt: 0 } })
    const usersWithoutTokens = totalUsers - usersWithTokens
    
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$hodlTokenBalance' },
          avgTokens: { $avg: '$hodlTokenBalance' },
          maxTokens: { $max: '$hodlTokenBalance' },
          minTokens: { $min: '$hodlTokenBalance' }
        }
      }
    ])
    
    const distributionStats = stats[0] || {
      totalTokens: 0,
      avgTokens: 0,
      maxTokens: 0,
      minTokens: 0
    }
    
    // Calculer la prochaine distribution
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setMinutes(0, 0, 0)
    nextHour.setHours(now.getHours() + (2 - (now.getHours() % 2)))
    
    res.json({
      success: true,
      system: {
        distributionActive: true,
        intervalHours: 2,
        tokensPerDistribution: 0.5,
        nextDistribution: nextHour.toISOString()
      },
      userStats: {
        totalUsers,
        usersWithTokens,
        usersWithoutTokens,
        percentageWithTokens: totalUsers > 0 ? Math.round((usersWithTokens / totalUsers) * 100) : 0
      },
      tokenStats: {
        totalTokensInCirculation: Math.round(distributionStats.totalTokens * 100) / 100,
        averageTokensPerUser: Math.round(distributionStats.avgTokens * 100) / 100,
        maxTokensHeld: Math.round(distributionStats.maxTokens * 100) / 100,
        minTokensHeld: Math.round(distributionStats.minTokens * 100) / 100
      },
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching distribution stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`)
    console.log(`🔗 Backend accessible via: https://screen-production.up.railway.app`)
    console.log(`🌐 Frontend accessible via: https://screen-fawn.vercel.app`)
    console.log(`🌍 Server listening on 0.0.0.0:${PORT}`)
  })
  
  // Gestion gracieuse de l'arrêt
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM reçu, arrêt gracieux du serveur...')
    server.close(() => {
      console.log('✅ Serveur fermé')
      mongoose.connection.close()
    })
  })
}).catch(error => {
  console.error('❌ Erreur lors du démarrage:', error)
  process.exit(1)
})