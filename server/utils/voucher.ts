import { ethers } from 'ethers'

// Types pour les vouchers
export interface Voucher {
  to: string
  amount: string
  nonce: string
  deadline: string
}

// Configuration EIP712 pour le distributeur
const DOMAIN = {
  name: 'Distributor',
  version: '1',
  chainId: 480, // World Chain
  verifyingContract: '0x25567dE6E171936aCB95698904634DA0a548C2' // Adresse du distributor
}

const TYPES = {
  Voucher: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
}

/**
 * Génère un voucher signé pour claim des tokens HODL
 */
export async function generateSignedVoucher(
  userAddress: string,
  amount: number,
  privateKey: string
): Promise<{ voucher: Voucher; signature: string }> {
  // Créer le wallet signataire
  const wallet = new ethers.Wallet(privateKey)
  
  // Convertir amount en wei (18 decimals)
  const amountWei = ethers.parseEther(amount.toString())
  
  // Générer un nonce unique basé sur timestamp + address
  const nonce = Date.now().toString()
  
  // Deadline: 1 heure à partir de maintenant
  const deadline = Math.floor((Date.now() + 60 * 60 * 1000) / 1000).toString()
  
  // Créer le voucher
  const voucher: Voucher = {
    to: userAddress,
    amount: amountWei.toString(),
    nonce,
    deadline
  }
  
  // Signer le voucher avec EIP712
  const signature = await wallet.signTypedData(DOMAIN, TYPES, voucher)
  
  console.log('🎫 Voucher généré:', {
    to: voucher.to,
    amount: `${amount} tokens (${voucher.amount} wei)`,
    nonce: voucher.nonce,
    deadline: new Date(parseInt(voucher.deadline) * 1000).toISOString(),
    signerAddress: wallet.address
  })
  
  return { voucher, signature }
}

/**
 * Vérifie qu'un voucher est valide
 */
export function verifyVoucher(
  voucher: Voucher,
  signature: string,
  expectedSigner: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyTypedData(DOMAIN, TYPES, voucher, signature)
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase()
  } catch (error) {
    console.error('Erreur lors de la vérification du voucher:', error)
    return false
  }
}

/**
 * Convertit un montant en tokens vers wei
 */
export function tokensToWei(amount: number): string {
  return ethers.parseEther(amount.toString()).toString()
}

/**
 * Convertit wei vers tokens
 */
export function weiToTokens(amountWei: string): number {
  return parseFloat(ethers.formatEther(amountWei))
} 