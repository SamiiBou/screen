const { ethers } = require('ethers')

// Configuration pour test
const DISTRIBUTOR_ADDRESS = '0xb525567dE6E171936aCB95698904634DA0a548C2'
const USER_ADDRESS = '0x126f7998Eb44Dd2d097A8AB2eBcb28dEA1646AC8' // exemple

// Domaine EIP712
const DOMAIN = {
  name: 'Distributor',
  version: '1',
  chainId: 480, // World Chain
  verifyingContract: DISTRIBUTOR_ADDRESS
}

const TYPES = {
  Voucher: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
}

async function testVoucherGeneration() {
  // Clé privée de test (REMPLACER par la vraie)
  const privateKey = process.env.TOKEN_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  
  const wallet = new ethers.Wallet(privateKey)
  console.log('🔑 Signer address:', wallet.address)
  
  // Créer un voucher de test
  const amount = ethers.parseEther('5') // 5 tokens
  const nonce = Date.now().toString()
  const deadline = Math.floor((Date.now() + 60 * 60 * 1000) / 1000).toString()
  
  const voucher = {
    to: USER_ADDRESS,
    amount: amount.toString(),
    nonce,
    deadline
  }
  
  console.log('\n📄 Voucher:', voucher)
  
  // Signer le voucher
  const signature = await wallet.signTypedData(DOMAIN, TYPES, voucher)
  console.log('\n✏️ Signature:', signature)
  
  // Vérifier la signature
  const recoveredAddress = ethers.verifyTypedData(DOMAIN, TYPES, voucher, signature)
  console.log('\n✅ Recovered address:', recoveredAddress)
  console.log('🎯 Matches signer:', recoveredAddress.toLowerCase() === wallet.address.toLowerCase())
  
  // Afficher les données pour debug
  console.log('\n🔍 Debug info:')
  console.log('- Amount in wei:', amount.toString())
  console.log('- Amount in tokens:', ethers.formatEther(amount))
  console.log('- Nonce:', nonce)
  console.log('- Deadline:', new Date(parseInt(deadline) * 1000).toISOString())
  
  return { voucher, signature }
}

// Exécuter le test si appelé directement
if (require.main === module) {
  testVoucherGeneration()
    .then(() => console.log('\n✅ Test terminé avec succès'))
    .catch(error => console.error('\n❌ Erreur:', error))
}

module.exports = { testVoucherGeneration } 