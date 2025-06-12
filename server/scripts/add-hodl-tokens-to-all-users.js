const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Charger les variables d'environnement
dotenv.config()

// Modèle User simplifié pour le script
const UserSchema = new mongoose.Schema({
  username: String,
  walletAddress: String,
  hodlTokenBalance: {
    type: Number,
    default: 5,
    min: 0
  }
}, {
  timestamps: true
})

const User = mongoose.model('User', UserSchema)

async function addHodlTokensToAllUsers() {
  console.log('🚀 Démarrage du script d\'ajout de tokens HODL...')
  
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ Connecté à MongoDB')
    
    // Récupérer tous les utilisateurs
    const users = await User.find({})
    console.log(`📊 ${users.length} utilisateurs trouvés`)
    
    if (users.length === 0) {
      console.log('ℹ️ Aucun utilisateur trouvé dans la base de données')
      return
    }
    
    let updatedCount = 0
    let skippedCount = 0
    
    console.log('\n🔄 Traitement des utilisateurs...')
    
    for (const user of users) {
      const currentBalance = user.hodlTokenBalance || 0
      
      if (currentBalance >= 5) {
        console.log(`⏭️ ${user.username} (${user.walletAddress?.slice(0, 8)}...): déjà ${currentBalance} tokens, ignoré`)
        skippedCount++
        continue
      }
      
      // Ajouter 5 tokens (ou compléter jusqu'à 5)
      const tokensToAdd = 5 - currentBalance
      user.hodlTokenBalance = 5
      await user.save()
      
      console.log(`✅ ${user.username} (${user.walletAddress?.slice(0, 8)}...): +${tokensToAdd} tokens (${currentBalance} → 5)`)
      updatedCount++
    }
    
    console.log('\n📊 Résumé:')
    console.log(`✅ Utilisateurs mis à jour: ${updatedCount}`)
    console.log(`⏭️ Utilisateurs ignorés: ${skippedCount}`)
    console.log(`📄 Total traité: ${users.length}`)
    
    if (updatedCount > 0) {
      console.log('\n🎉 Tokens HODL ajoutés avec succès à tous les utilisateurs!')
    } else {
      console.log('\nℹ️ Aucune mise à jour nécessaire - tous les utilisateurs ont déjà suffisamment de tokens')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des tokens:', error)
    process.exit(1)
  } finally {
    // Fermer la connexion
    await mongoose.disconnect()
    console.log('🔌 Connexion MongoDB fermée')
    process.exit(0)
  }
}

// Fonction pour donner des tokens à un utilisateur spécifique
async function addTokensToSpecificUser(walletAddress, amount = 5) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      console.log(`❌ Utilisateur avec l'adresse ${walletAddress} non trouvé`)
      return
    }
    
    const oldBalance = user.hodlTokenBalance || 0
    user.hodlTokenBalance = oldBalance + amount
    await user.save()
    
    console.log(`✅ ${user.username}: +${amount} tokens (${oldBalance} → ${user.hodlTokenBalance})`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Fonction pour reset tous les utilisateurs à 5 tokens
async function resetAllUsersTo5Tokens() {
  console.log('🔄 Reset de tous les utilisateurs à 5 tokens...')
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    
    const result = await User.updateMany({}, { hodlTokenBalance: 5 })
    console.log(`✅ ${result.modifiedCount} utilisateurs resetés à 5 tokens`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'add':
      await addHodlTokensToAllUsers()
      break
      
    case 'reset':
      await resetAllUsersTo5Tokens()
      break
      
    case 'user':
      const address = args[1]
      const amount = parseInt(args[2]) || 5
      if (!address) {
        console.log('❌ Usage: npm run hodl-script user <wallet_address> [amount]')
        process.exit(1)
      }
      await addTokensToSpecificUser(address, amount)
      break
      
    default:
      console.log('🔧 Script de gestion des tokens HODL')
      console.log('')
      console.log('Usage:')
      console.log('  node server/scripts/add-hodl-tokens-to-all-users.js add    - Ajouter 5 tokens à tous les utilisateurs')
      console.log('  node server/scripts/add-hodl-tokens-to-all-users.js reset  - Reset tous les utilisateurs à 5 tokens')
      console.log('  node server/scripts/add-hodl-tokens-to-all-users.js user <address> [amount] - Ajouter des tokens à un utilisateur spécifique')
      console.log('')
      console.log('Exemples:')
      console.log('  node server/scripts/add-hodl-tokens-to-all-users.js add')
      console.log('  node server/scripts/add-hodl-tokens-to-all-users.js user 0x123... 10')
      break
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
}

module.exports = {
  addHodlTokensToAllUsers,
  addTokensToSpecificUser,
  resetAllUsersTo5Tokens
} 