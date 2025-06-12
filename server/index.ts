import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth'
import challengeRoutes from './routes/challenges'
import leaderboardRoutes from './routes/leaderboard'
import setupRoutes from './routes/setup'
import hodlRoutes from './routes/hodl'

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

// Configuration CORS pour Railway et autres environnements
const corsOptions = {
  origin: [
    'https://screen-fhdfrzon0-samiibous-projects.vercel.app', // Frontend ngrok
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
    environment: process.env.NODE_ENV || 'development'
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

connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`)
    console.log(`🔗 Backend accessible via: https://screen-production.up.railway.app`)
    console.log(`🌐 Frontend accessible via: https://screen-fhdfrzon0-samiibous-projects.vercel.app`)
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