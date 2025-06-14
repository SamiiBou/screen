import mongoose, { Document, Schema } from 'mongoose'

export interface IChallenge extends Document {
  title: string
  description: string
  maxParticipants: number
  currentParticipants: number
  firstPrize: number
  secondPrize: number
  thirdPrize: number
  participationPrice: number
  isDuel?: boolean
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
  firstPrize: {
    type: Number,
    required: [true, 'Le prix du 1er est requis'],
    min: [0, 'Le prix du 1er ne peut pas être négatif']
  },
  secondPrize: {
    type: Number,
    required: [true, 'Le prix du 2ème est requis'],
    min: [0, 'Le prix du 2ème ne peut pas être négatif']
  },
  thirdPrize: {
    type: Number,
    required: [true, 'Le prix du 3ème est requis'],
    min: [0, 'Le prix du 3ème ne peut pas être négatif']
  },
  isDuel: {
    type: Boolean,
    default: false
  },
  participationPrice: {
    type: Number,
    required: [true, 'Le prix de participation est requis'],
    min: [0, 'Le prix de participation ne peut pas être négatif'],
    default: 0
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