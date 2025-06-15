import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { apiService } from '@/utils/api'
import Image from 'next/image'

interface AddDuelChallengeFormProps {
  onSuccess?: () => void
}

export default function AddDuelChallengeForm({ onSuccess }: AddDuelChallengeFormProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const createDuel = async (price: number) => {
    setLoading(price)
    setMessage(null)
    try {
      await apiService.createDuelChallenge(price)
      setMessage('Duel created successfully')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setMessage(err.message || 'Error creating duel')
    } finally {
      setLoading(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const duelOptions = [
    { price: 1, description: 'Quick duel' },
    { price: 5, description: 'Standard duel' },
    { price: 10, description: 'Premium duel' }
  ]

  return (
    <>
      {/* Bouton simple pour ouvrir la modal */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
      >
        <span>⚔️</span>
        <span>Create New Duel</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚔️</span>
                </div>
                <h3 className="text-2xl font-light text-black mb-2">Create New Duel</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Challenge another player to a 1v1 battle. Winner takes most of the prize pool.
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4 mb-8">
                {duelOptions.map(({ price, description }) => (
                  <motion.button
                    key={price}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      createDuel(price)
                      setShowModal(false)
                    }}
                    disabled={loading !== null}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{price}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-lg font-light text-black">{price}</span>
                              <Image src="/WLD.png" alt="WLD" width={16} height={16} className="opacity-60" />
                              <span className="text-lg font-light text-black">WLD</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      
                      {loading === price ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="text-gray-400">
                          →
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-gray-500 text-sm font-medium hover:text-black transition-colors"
              >
                Cancel
              </button>
              
              {/* Message dans la modal */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 rounded-lg text-sm text-center bg-gray-50 text-gray-700 border border-gray-200"
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}