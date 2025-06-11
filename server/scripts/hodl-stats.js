const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Charger les variables d'environnement
dotenv.config()

// Modèle User simplifié
const UserSchema = new mongoose.Schema({
  username: String,
  walletAddress: String,
  hodlTokenBalance: {
    type: Number,
    default: 5,
    min: 0
  },
  createdAt: Date
}, {
  timestamps: true
})

const User = mongoose.model('User', UserSchema)

async function showHodlStats() {
  console.log('📊 Statistiques des tokens HODL\n')
  
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ Connecté à MongoDB\n')
    
    // Récupérer tous les utilisateurs
    const users = await User.find({}).sort({ hodlTokenBalance: -1 })
    
    if (users.length === 0) {
      console.log('ℹ️ Aucun utilisateur trouvé dans la base de données')
      return
    }
    
    // Calculer les statistiques
    const totalUsers = users.length
    const totalTokens = users.reduce((sum, user) => sum + (user.hodlTokenBalance || 0), 0)
    const avgTokens = totalTokens / totalUsers
    const usersWithTokens = users.filter(user => (user.hodlTokenBalance || 0) > 0).length
    const usersWithoutTokens = totalUsers - usersWithTokens
    
    // Grouper par balance
    const balanceGroups = {}
    users.forEach(user => {
      const balance = user.hodlTokenBalance || 0
      if (!balanceGroups[balance]) balanceGroups[balance] = 0
      balanceGroups[balance]++
    })
    
    // Afficher les statistiques générales
    console.log('📈 STATISTIQUES GÉNÉRALES')
    console.log('═'.repeat(40))
    console.log(`👥 Total utilisateurs: ${totalUsers}`)
    console.log(`🪙 Total tokens distribués: ${totalTokens}`)
    console.log(`📊 Moyenne tokens par utilisateur: ${avgTokens.toFixed(2)}`)
    console.log(`✅ Utilisateurs avec tokens: ${usersWithTokens}`)
    console.log(`❌ Utilisateurs sans tokens: ${usersWithoutTokens}`)
    
    // Distribution des balances
    console.log('\n💰 DISTRIBUTION DES BALANCES')
    console.log('═'.repeat(40))
    Object.keys(balanceGroups)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .forEach(balance => {
        const count = balanceGroups[balance]
        const percentage = ((count / totalUsers) * 100).toFixed(1)
        const bar = '█'.repeat(Math.ceil(count / totalUsers * 20))
        console.log(`${balance.padStart(3)} tokens: ${count.toString().padStart(3)} utilisateurs (${percentage}%) ${bar}`)
      })
    
    // Top 10 des utilisateurs avec le plus de tokens
    const topUsers = users.slice(0, 10).filter(user => (user.hodlTokenBalance || 0) > 0)
    if (topUsers.length > 0) {
      console.log('\n🏆 TOP UTILISATEURS')
      console.log('═'.repeat(60))
      topUsers.forEach((user, index) => {
        const rank = (index + 1).toString().padStart(2)
        const username = (user.username || 'Anonyme').padEnd(20)
        const address = (user.walletAddress?.slice(0, 8) + '...') || 'N/A'
        const tokens = (user.hodlTokenBalance || 0).toString().padStart(3)
        console.log(`${rank}. ${username} ${address.padEnd(12)} ${tokens} tokens`)
      })
    }
    
    // Utilisateurs sans tokens
    const usersNoTokens = users.filter(user => (user.hodlTokenBalance || 0) === 0)
    if (usersNoTokens.length > 0) {
      console.log('\n⚠️ UTILISATEURS SANS TOKENS')
      console.log('═'.repeat(60))
      usersNoTokens.forEach(user => {
        const username = (user.username || 'Anonyme').padEnd(20)
        const address = (user.walletAddress?.slice(0, 8) + '...') || 'N/A'
        const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
        console.log(`• ${username} ${address.padEnd(12)} (inscrit le ${date})`)
      })
    }
    
    console.log('\n✅ Rapport terminé!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Connexion MongoDB fermée')
    process.exit(0)
  }
}

// Exécuter le script
if (require.main === module) {
  showHodlStats().catch(error => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
}

module.exports = { showHodlStats } 