import mongoose, { Document, Schema } from 'mongoose'

export interface IChallenge extends Document {
  title: string
  description: string
  startDate: Date
  endDate: Date
  maxParticipants: number
  currentParticipants: number
  prizePool: number
  status: 'upcoming' | 'active' | 'completed'
  createdAt: Date
}

const ChallengeSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit faire au moins 3 caractères'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit faire au moins 10 caractères'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise'],
    validate: {
      validator: function(this: IChallenge, value: Date) {
        return value > this.startDate
      },
      message: 'La date de fin doit être après la date de début'
    }
  },
  maxParticipants: {
    type: Number,
    default: 1000,
    min: [1, 'Il doit y avoir au moins 1 participant maximum'],
    max: [10000, 'Le nombre maximum de participants ne peut pas dépasser 10000']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de participants ne peut pas être négatif']
  },
  prizePool: {
    type: Number,
    default: 0,
    min: [0, 'La cagnotte ne peut pas être négative']
  },
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'active', 'completed'],
      message: 'Le statut doit être upcoming, active ou completed'
    },
    default: 'upcoming'
  }
}, {
  timestamps: true
})

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema)