'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { MiniKit } from '@worldcoin/minikit-js'
import { useWaitForTransactionReceipt } from '@worldcoin/minikit-react'
import { createPublicClient, http } from 'viem'
import { worldchain } from 'viem/chains'
import { apiService } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import HodlDistributorABI from '@/contracts/HodlDistributorABI.json'

const HODL_DISTRIBUTOR_ADDRESS = '0xb525567dE6E171936aCB95698904634DA0a548C2'

interface HodlBalanceProps {
  className?: string
}

interface ClaimData {
  voucher: {
    to: string
    amount: string
    nonce: string
    deadline: string
  }
  signature: string
}

const publicClient = createPublicClient({
  chain: worldchain,
  transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
})

export default function HodlBalance({ className = '' }: HodlBalanceProps) {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [transactionId, setTransactionId] = useState<string>('')
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const { user, isAuthenticated } = useAuth()

  // Surveiller la transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    client: publicClient,
    appConfig: {
      app_id: process.env.NEXT_PUBLIC_WLD_APP_ID!,
    },
    transactionId: transactionId,
  })

  // Charger la balance au montage
  useEffect(() => {
    loadBalance()
  }, [isAuthenticated])

  // Gérer la confirmation de transaction
  useEffect(() => {
    if (isConfirmed && claimData) {
      handleClaimSuccess()
    }
  }, [isConfirmed, claimData])

  const loadBalance = async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      const response = await apiService.getHodlBalance()
      setBalance(response.balance || 0)
    } catch (error) {
      console.error('Erreur lors du chargement de la balance:', error)
      setBalance(0)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!isAuthenticated || balance <= 0 || claiming) return

    setClaiming(true)

    try {
      // 1. Générer le voucher côté serveur
      console.log('📄 Génération du voucher...')
      const voucherResponse = await apiService.generateHodlVoucher()

      setClaimData(voucherResponse)

      // 2. Préparer la transaction MiniKit
      console.log('🚀 Envoi de la transaction...')
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: HODL_DISTRIBUTOR_ADDRESS,
            abi: HodlDistributorABI,
            functionName: 'claim',
            args: [
              [
                voucherResponse.voucher.to,
                voucherResponse.voucher.amount,
                voucherResponse.voucher.nonce,
                voucherResponse.voucher.deadline,
              ],
              voucherResponse.signature,
            ],
          },
        ],
      })

      if (finalPayload.status === 'error') {
        throw new Error('Transaction failed')
      }

      console.log('✅ Transaction envoyée:', finalPayload.transaction_id)
      setTransactionId(finalPayload.transaction_id)
      
      // NE PAS faire d'optimistic update - attendre la confirmation

    } catch (error) {
      console.error('❌ Erreur lors du claim:', error)
      
      // Signaler l'échec au serveur
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      try {
        const failResponse = await apiService.reportFailedHodlClaim(errorMessage, transactionId)
        // Mettre à jour avec la balance réelle du serveur
        if (failResponse.currentBalance !== undefined) {
          setBalance(failResponse.currentBalance)
        }
      } catch (reportError) {
        console.error('Erreur lors du signalement d\'échec:', reportError)
        // En dernier recours, recharger la balance
        await loadBalance()
      }
      
      setClaiming(false)
      setClaimData(null)
      setTransactionId('')
      
      // Afficher l'erreur à l'utilisateur
      alert(`Erreur lors du claim des tokens: ${errorMessage}`)
    }
  }

  const handleClaimSuccess = async () => {
    try {
      const response = await apiService.confirmHodlClaim(transactionId, claimData?.voucher.amount)

      console.log('🎉 Claim confirmé avec succès!', response)
      
      // Mettre à jour la balance après confirmation
      setBalance(0)
      
      // Notification de succès
      alert(`🎉 Claim réussi ! Vous avez reçu ${response.claimedAmount || 'vos'} tokens HODL !`)
      
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error)
      // En cas d'erreur de confirmation, recharger la balance
      await loadBalance()
    } finally {
      setClaiming(false)
      setClaimData(null)
      setTransactionId('')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <motion.button
        disabled
        className={`px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed ${className}`}
      >
        Loading...
      </motion.button>
    )
  }

  const isProcessing = claiming || isConfirming
  const buttonText = isProcessing 
    ? (isConfirming ? 'Confirming...' : 'Claiming...') 
    : balance > 0 
      ? `${balance} HODL to claim`
      : 'No tokens to claim'

  return (
    <motion.button
      onClick={handleClaim}
      disabled={balance <= 0 || isProcessing}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        balance <= 0 
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : isProcessing
            ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
            : 'bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
      } ${className}`}
      whileHover={balance > 0 && !isProcessing ? { scale: 1.05 } : undefined}
      whileTap={balance > 0 && !isProcessing ? { scale: 0.95 } : undefined}
    >
      {isProcessing && (
        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin inline-block mr-2" />
      )}
      {buttonText}
    </motion.button>
  )
} 