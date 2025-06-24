import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { AceternityButton } from './ui/AceternityButton'
import { apiService } from '@/utils/api'

interface AddChallengeFormProps {
  onSuccess?: () => void
}

export default function AddChallengeForm({ onSuccess }: AddChallengeFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fields, setFields] = useState({
    title: '',
    description: '',
    maxParticipants: 100,
    firstPrize: 0,
    secondPrize: 0,
    thirdPrize: 0,
    participationPrice: 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    
    console.log('🆕 [FORM DEBUG] ===== SUBMITTING CHALLENGE FORM =====')
    console.log('🆕 [FORM DEBUG] Raw fields:', fields)
    
    try {
      // Validation simple
      if (!fields.title || !fields.description) {
        setError('Titre et description sont requis')
        setLoading(false)
        return
      }
      if (fields.title.length < 3) {
        setError('Le titre doit faire au moins 3 caractères')
        setLoading(false)
        return
      }
      if (fields.description.length < 10) {
        setError('La description doit faire au moins 10 caractères')
        setLoading(false)
        return
      }
      if (fields.firstPrize <= 0 || fields.secondPrize <= 0 || fields.thirdPrize <= 0) {
        setError('Tous les prix doivent être supérieurs à 0')
        setLoading(false)
        return
      }

      const challengeData = {
        ...fields,
        maxParticipants: Number(fields.maxParticipants),
        firstPrize: Number(fields.firstPrize),
        secondPrize: Number(fields.secondPrize),
        thirdPrize: Number(fields.thirdPrize),
        participationPrice: Number(fields.participationPrice)
      }

      console.log('🆕 [FORM DEBUG] Challenge data to send:', challengeData)
      console.log('🆕 [FORM DEBUG] Participation price details:', {
        rawValue: fields.participationPrice,
        convertedValue: Number(fields.participationPrice),
        type: typeof Number(fields.participationPrice)
      })

      const response = await apiService.createChallenge(challengeData)
      console.log('🆕 [FORM DEBUG] Create challenge response:', response)

      setSuccess('Challenge créé avec succès !')
      setFields({
        title: '',
        description: '',
        maxParticipants: 100,
        firstPrize: 0,
        secondPrize: 0,
        thirdPrize: 0,
        participationPrice: 0
      })
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('❌ [FORM DEBUG] Error creating challenge:', err)
      setError(err.message || 'Erreur lors de la création du challenge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8">
      <AceternityButton
        className="text-gray-500 hover:text-black transition-colors text-sm font-medium mb-8"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '\u2212 Close' : '+ Add Challenge'}
      </AceternityButton>
      {open && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-8 space-y-6 max-w-lg mx-auto">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-600">TITLE</Label>
            <Input id="title" name="title" value={fields.title} onChange={handleChange} required minLength={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-600">DESCRIPTION</Label>
            <textarea id="description" name="description" value={fields.description} onChange={handleChange} required minLength={10} className="mt-1 w-full rounded-md border border-input px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <div>
            <Label htmlFor="maxParticipants" className="text-sm font-medium text-gray-600">MAX PLAYERS</Label>
            <Input id="maxParticipants" name="maxParticipants" type="number" min={1} max={10000} value={fields.maxParticipants} onChange={handleChange} required className="mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="firstPrize" className="text-sm font-medium text-gray-600">1ER PRIX (WLD)</Label>
              <Input id="firstPrize" name="firstPrize" type="number" min={0} step="0.1" value={fields.firstPrize} onChange={handleChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="secondPrize" className="text-sm font-medium text-gray-600">2EME PRIX (WLD)</Label>
              <Input id="secondPrize" name="secondPrize" type="number" min={0} step="0.1" value={fields.secondPrize} onChange={handleChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="thirdPrize" className="text-sm font-medium text-gray-600">3EME PRIX (WLD)</Label>
              <Input id="thirdPrize" name="thirdPrize" type="number" min={0} step="0.1" value={fields.thirdPrize} onChange={handleChange} required className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="participationPrice" className="text-sm font-medium text-gray-600">PARTICIPATION PRICE (WLD)</Label>
            <Input id="participationPrice" name="participationPrice" type="number" min={0} step="0.1" value={fields.participationPrice} onChange={handleChange} required className="mt-1" />
            <p className="text-xs text-gray-500 mt-1">Prix d&apos;entrée en WLD (0 pour un challenge gratuit)</p>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <AceternityButton
            type="submit"
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-all duration-200 w-full text-sm font-medium hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Challenge'}
          </AceternityButton>
        </form>
      )}
    </div>
  )
} 