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
  status: 'upcoming' | 'active' | 'completed'
  createdAt: Date
}

const ChallengeSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  maxParticipants: {
    type: Number,
    default: 1000,
    min: [1, 'There must be at least 1 maximum participant'],
    max: [10000, 'Maximum number of participants cannot exceed 10000']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Number of participants cannot be negative']
  },
  firstPrize: {
    type: Number,
    required: [true, 'First prize is required'],
    min: [0, 'First prize cannot be negative']
  },
  secondPrize: {
    type: Number,
    required: [true, 'Second prize is required'],
    min: [0, 'Second prize cannot be negative']
  },
  thirdPrize: {
    type: Number,
    required: [true, 'Third prize is required'],
    min: [0, 'Third prize cannot be negative']
  },
  participationPrice: {
    type: Number,
    required: [true, 'Participation price is required'],
    min: [0, 'Participation price cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'active', 'completed'],
      message: 'Status must be upcoming, active or completed'
    },
    default: 'upcoming'
  }
}, {
  timestamps: true
})

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema)