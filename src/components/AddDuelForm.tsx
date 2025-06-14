import { useState } from 'react'
import { AceternityButton } from './ui/AceternityButton'
import { apiService } from '@/utils/api'

interface AddDuelFormProps {
  onSuccess?: () => void
}

export default function AddDuelForm({ onSuccess }: AddDuelFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [entryFee, setEntryFee] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await apiService.createDuel(entryFee)
      setSuccess('Duel created!')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create duel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        {[1,5,10].map(fee => (
          <button
            key={fee}
            type="button"
            onClick={() => setEntryFee(fee)}
            className={`px-4 py-2 rounded-full text-sm border ${entryFee===fee? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            {fee} WLD
          </button>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <AceternityButton type="submit" disabled={loading} className="bg-black text-white px-6 py-2 rounded-full text-sm">
        {loading ? 'Creating...' : 'Create 1v1'}
      </AceternityButton>
    </form>
  )
}
