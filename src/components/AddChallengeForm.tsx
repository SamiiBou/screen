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
    startDate: '',
    endDate: '',
    maxParticipants: 100,
    prizePool: 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      // Validation simple
      if (!fields.title || !fields.description || !fields.startDate || !fields.endDate) {
        setError('Tous les champs sont requis')
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
      if (new Date(fields.endDate) <= new Date(fields.startDate)) {
        setError('La date de fin doit être après la date de début')
        setLoading(false)
        return
      }
      await apiService.createChallenge({
        ...fields,
        maxParticipants: Number(fields.maxParticipants),
        prizePool: Number(fields.prizePool)
      })
      setSuccess('Challenge créé avec succès !')
      setFields({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        maxParticipants: 100,
        prizePool: 0
      })
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du challenge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8">
      <AceternityButton
        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors mb-4"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Fermer le formulaire' : 'Ajouter un challenge'}
      </AceternityButton>
      {open && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-md max-w-xl mx-auto">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" value={fields.title} onChange={handleChange} required minLength={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" value={fields.description} onChange={handleChange} required minLength={10} className="mt-1 w-full rounded-md border border-input px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Début</Label>
              <Input id="startDate" name="startDate" type="datetime-local" value={fields.startDate} onChange={handleChange} required className="mt-1" />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Fin</Label>
              <Input id="endDate" name="endDate" type="datetime-local" value={fields.endDate} onChange={handleChange} required className="mt-1" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="maxParticipants">Participants max</Label>
              <Input id="maxParticipants" name="maxParticipants" type="number" min={1} max={10000} value={fields.maxParticipants} onChange={handleChange} required className="mt-1" />
            </div>
            <div className="flex-1">
              <Label htmlFor="prizePool">Cagnotte (€)</Label>
              <Input id="prizePool" name="prizePool" type="number" min={0} value={fields.prizePool} onChange={handleChange} required className="mt-1" />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <AceternityButton
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors w-full"
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer le challenge'}
          </AceternityButton>
        </form>
      )}
    </div>
  )
} 