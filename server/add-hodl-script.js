const mongoose = require('mongoose')
require('dotenv').config()

// Définir le schéma User (simplifié pour le script)
const UserSchema = new mongoose.Schema({
  username: String,
  walletAddress: String,
  hodlBalance: { type: Number, default: 0 },
  // ... autres champs
}, {
  timestamps: true
})

const User = mongoose.model('User', UserSchema)

async function addHodlToUser(identifier, amount = 5) {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ Connecté à MongoDB')

    // Chercher l'utilisateur par username ou adresse wallet
    let user
    if (identifier.startsWith('0x')) {
      // Si ça commence par 0x, c'est une adresse wallet
      user = await User.findOne({ walletAddress: identifier.toLowerCase() })
      console.log(`🔍 Recherche par adresse wallet: ${identifier}`)
    } else {
      // Sinon, c'est un username
      user = await User.findOne({ username: identifier })
      console.log(`🔍 Recherche par username: ${identifier}`)
    }

    if (!user) {
      console.log('❌ Utilisateur non trouvé!')
      console.log('💡 Astuce: Utilisez soit:')
      console.log('   - L\'adresse wallet (ex: 0x1234...)')
      console.log('   - Le username exact')
      return
    }

    console.log(`👤 Utilisateur trouvé: ${user.username}`)
    console.log(`💰 Balance HODL actuelle: ${user.hodlBalance || 0}`)

    // Ajouter les HODL
    const currentBalance = user.hodlBalance || 0
    user.hodlBalance = currentBalance + amount
    await user.save()

    console.log(`✅ ${amount} HODL ajoutés avec succès!`)
    console.log(`💰 Nouvelle balance HODL: ${user.hodlBalance}`)
    console.log(`🎯 L'utilisateur peut maintenant claim ses tokens!`)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Déconnecté de MongoDB')
  }
}

// Fonction pour lister tous les utilisateurs (utile pour debug)
async function listUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ Connecté à MongoDB')

    const users = await User.find({}).select('username walletAddress hodlBalance').limit(10)
    
    console.log('\n📋 Liste des utilisateurs:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`)
      console.log(`   Wallet: ${user.walletAddress}`)
      console.log(`   HODL Balance: ${user.hodlBalance || 0}`)
      console.log('   ─────────────────────────────────────')
    })

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Déconnecté de MongoDB')
  }
}

// Interface CLI
const args = process.argv.slice(2)
const command = args[0]

if (command === 'list') {
  listUsers()
} else if (command === 'add') {
  const identifier = args[1]
  const amount = args[2] ? parseInt(args[2]) : 5
  
  if (!identifier) {
    console.log('❌ Usage: node add-hodl-script.js add <username|wallet> [amount]')
    console.log('📝 Exemples:')
    console.log('   node add-hodl-script.js add john_doe 5')
    console.log('   node add-hodl-script.js add 0x1234567890abcdef 10')
    console.log('\n💡 Pour voir la liste des utilisateurs:')
    console.log('   node add-hodl-script.js list')
    process.exit(1)
  }
  
  addHodlToUser(identifier, amount)
} else {
  console.log('🎯 Script pour ajouter des HODL tokens')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 Commandes disponibles:')
  console.log('   node add-hodl-script.js list                    - Lister les utilisateurs')
  console.log('   node add-hodl-script.js add <user> [amount]     - Ajouter des HODL')
  console.log('\n📝 Exemples:')
  console.log('   node add-hodl-script.js add john_doe 5')
  console.log('   node add-hodl-script.js add 0x1234567890abcdef 10')
} 