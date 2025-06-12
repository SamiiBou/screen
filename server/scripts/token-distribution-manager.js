require('dotenv').config()
const mongoose = require('mongoose')

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

async function distributeTokensManually(amount = 0.5) {
  console.log(`🎁 Manuel token distribution starting (${amount} tokens per user)...`)
  
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ Connected to MongoDB')
    
    const result = await User.updateMany(
      {}, 
      { $inc: { hodlTokenBalance: amount } }
    )
    
    const totalUsers = result.modifiedCount
    const totalTokensDistributed = totalUsers * amount
    
    console.log(`✅ Token distribution completed:`)
    console.log(`   - Users updated: ${totalUsers}`)
    console.log(`   - Tokens per user: ${amount}`)
    console.log(`   - Total tokens distributed: ${totalTokensDistributed}`)
    
    // Afficher quelques statistiques
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
    
    if (stats[0]) {
      console.log(`\n📊 Current token statistics:`)
      console.log(`   - Total tokens in circulation: ${Math.round(stats[0].totalTokens * 100) / 100}`)
      console.log(`   - Average tokens per user: ${Math.round(stats[0].avgTokens * 100) / 100}`)
      console.log(`   - Max tokens held: ${Math.round(stats[0].maxTokens * 100) / 100}`)
      console.log(`   - Min tokens held: ${Math.round(stats[0].minTokens * 100) / 100}`)
    }
    
  } catch (error) {
    console.error('❌ Error during manual distribution:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

async function showDistributionStats() {
  console.log('📊 Token Distribution Statistics\n')
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ Connected to MongoDB\n')
    
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
    
    console.log('👥 USER STATISTICS')
    console.log('═'.repeat(40))
    console.log(`Total users: ${totalUsers}`)
    console.log(`Users with tokens: ${usersWithTokens}`)
    console.log(`Users without tokens: ${usersWithoutTokens}`)
    console.log(`Percentage with tokens: ${totalUsers > 0 ? Math.round((usersWithTokens / totalUsers) * 100) : 0}%`)
    
    console.log('\n💰 TOKEN STATISTICS')
    console.log('═'.repeat(40))
    console.log(`Total tokens in circulation: ${Math.round(distributionStats.totalTokens * 100) / 100}`)
    console.log(`Average tokens per user: ${Math.round(distributionStats.avgTokens * 100) / 100}`)
    console.log(`Maximum tokens held: ${Math.round(distributionStats.maxTokens * 100) / 100}`)
    console.log(`Minimum tokens held: ${Math.round(distributionStats.minTokens * 100) / 100}`)
    
    // Distribution par tranches
    const ranges = [
      { min: 0, max: 0, label: '0 tokens' },
      { min: 0.1, max: 5, label: '0.1-5 tokens' },
      { min: 5.1, max: 10, label: '5.1-10 tokens' },
      { min: 10.1, max: 20, label: '10.1-20 tokens' },
      { min: 20.1, max: 50, label: '20.1-50 tokens' },
      { min: 50.1, max: Infinity, label: '50+ tokens' }
    ]
    
    console.log('\n📈 TOKEN DISTRIBUTION')
    console.log('═'.repeat(40))
    
    for (const range of ranges) {
      let condition = {}
      if (range.max === Infinity) {
        condition = { hodlTokenBalance: { $gt: range.min } }
      } else if (range.min === 0 && range.max === 0) {
        condition = { hodlTokenBalance: 0 }
      } else {
        condition = { hodlTokenBalance: { $gte: range.min, $lte: range.max } }
      }
      
      const count = await User.countDocuments(condition)
      const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
      const bar = '█'.repeat(Math.ceil(percentage / 5))
      console.log(`${range.label.padEnd(15)}: ${count.toString().padStart(3)} users (${percentage}%) ${bar}`)
    }
    
    // Top 10 utilisateurs
    const topUsers = await User.find({})
      .sort({ hodlTokenBalance: -1 })
      .limit(10)
      .select('username walletAddress hodlTokenBalance')
    
    if (topUsers.length > 0) {
      console.log('\n🏆 TOP 10 USERS BY TOKENS')
      console.log('═'.repeat(60))
      topUsers.forEach((user, index) => {
        const rank = (index + 1).toString().padStart(2)
        const username = (user.username || 'Anonymous').padEnd(20)
        const address = (user.walletAddress?.slice(0, 8) + '...' || 'N/A').padEnd(12)
        const tokens = user.hodlTokenBalance.toFixed(1).padStart(6)
        console.log(`${rank}. ${username} ${address} ${tokens} tokens`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

async function simulateDistributions(hours = 24) {
  console.log(`🔮 Simulating ${hours} hours of automatic distributions (every 2 hours)...\n`)
  
  const distributions = Math.floor(hours / 2)
  const tokensPerDistribution = 0.5
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game')
    console.log('✅ Connected to MongoDB')
    
    const totalUsers = await User.countDocuments({})
    
    for (let i = 1; i <= distributions; i++) {
      const hourTime = i * 2
      const totalTokensForThisDistribution = totalUsers * tokensPerDistribution
      
      console.log(`⏰ Distribution ${i}/${distributions} (at ${hourTime}h):`)
      console.log(`   Adding ${tokensPerDistribution} tokens to ${totalUsers} users`)
      console.log(`   Total tokens distributed: ${totalTokensForThisDistribution}`)
      
      // Note: Cette simulation n'applique pas réellement les changements
      // Décommentez la ligne suivante pour appliquer réellement
      // await User.updateMany({}, { $inc: { hodlTokenBalance: tokensPerDistribution } })
    }
    
    console.log(`\n📊 SIMULATION SUMMARY:`)
    console.log(`   Total distributions: ${distributions}`)
    console.log(`   Tokens per user total: ${distributions * tokensPerDistribution}`)
    console.log(`   Total tokens distributed: ${distributions * totalUsers * tokensPerDistribution}`)
    console.log(`\n💡 To apply this simulation, uncomment the update line in the script`)
    
  } catch (error) {
    console.error('❌ Error during simulation:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'distribute':
      const amount = parseFloat(args[1]) || 0.5
      await distributeTokensManually(amount)
      break
      
    case 'stats':
      await showDistributionStats()
      break
      
    case 'simulate':
      const hours = parseInt(args[1]) || 24
      await simulateDistributions(hours)
      break
      
    default:
      console.log('🤖 Token Distribution Manager')
      console.log('')
      console.log('Usage:')
      console.log('  node server/scripts/token-distribution-manager.js distribute [amount]  - Distribute tokens manually')
      console.log('  node server/scripts/token-distribution-manager.js stats               - Show distribution statistics')
      console.log('  node server/scripts/token-distribution-manager.js simulate [hours]    - Simulate distributions')
      console.log('')
      console.log('Examples:')
      console.log('  node server/scripts/token-distribution-manager.js distribute 0.5')
      console.log('  node server/scripts/token-distribution-manager.js stats')
      console.log('  node server/scripts/token-distribution-manager.js simulate 48')
      break
  }
  
  process.exit(0)
}

main().catch(error => {
  console.error('❌ Script error:', error)
  process.exit(1)
}) 