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

const app = express()
const PORT = process.env.PORT || 5173

// Configuration CORS pour ngrok
const corsOptions = {
  origin: [
    'https://80887bc5356b.ngrok.app', // Frontend ngrok
    'http://localhost:3001', // Frontend local
    'http://localhost:3000', // Frontend local alternatif
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())

// Middleware additionnel pour ngrok
app.use((req, res, next) => {
  // Ajouter des en-têtes pour ngrok
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
    port: PORT
  })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`)
    console.log(`🔗 Backend accessible via: https://0cb30698e141.ngrok.app`)
    console.log(`🌐 Frontend accessible via: https://80887bc5356b.ngrok.app`)
  })
})