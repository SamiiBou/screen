import { useState } from 'react'
import { AceternityButton } from './ui/AceternityButton'
import { apiService } from '@/utils/api'

interface AddDuelChallengeFormProps {
  onSuccess?: () => void
}

export default function AddDuelChallengeForm({ onSuccess }: AddDuelChallengeFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const createDuel = async (price: number) => {
    setLoading(true)
    setMessage(null)
    try {
      await apiService.createDuelChallenge(price)
      setMessage('Duel created successfully!')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setMessage(err.message || 'Error creating duel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start space-y-2">
      <div className="flex space-x-2">
        {[1,5,10].map((price) => (
          <AceternityButton
            key={price}
            onClick={() => createDuel(price)}
            disabled={loading}
            className="px-4 py-2 text-xs"
          >
            {loading ? 'Creating...' : `Create ${price} WLD Duel`}
          </AceternityButton>
        ))}
      </div>
      {message && <p className="text-xs text-gray-500">{message}</p>}
    </div>
  )
}
