import mongoose, { Document, Schema } from 'mongoose'

export interface IParticipation extends Document {
  userId: mongoose.Types.ObjectId
  challengeId: mongoose.Types.ObjectId
  timeHeld: number
  challengesCompleted: number
  eliminationReason: string
  rank: number
  participationDate: Date
  paymentReference: string
  transactionId: string
  wldPaid: number
  paymentStatus: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

const ParticipationSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge ID is required']
  },
  timeHeld: {
    type: Number,
    required: [true, 'Time held is required'],
    min: [0, 'Time held cannot be negative']
  },
  challengesCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Challenges completed cannot be negative']
  },
  eliminationReason: {
    type: String,
    required: [true, 'Elimination reason is required'],
    enum: ['completed', 'timeout', 'disconnected', 'voluntary', 'disqualified'],
    default: 'completed'
  },
  rank: {
    type: Number,
    min: [1, 'Rank must be at least 1']
  },
  participationDate: {
    type: Date,
    default: Date.now
  },
  paymentReference: {
    type: String,
    required: [true, 'Payment reference is required']
  },
  transactionId: {
    type: String,
    default: 'pending'
  },
  wldPaid: {
    type: Number,
    required: [true, 'WLD amount paid is required'],
    min: [0, 'WLD paid cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
})

// Index pour éviter les participations multiples au même challenge
ParticipationSchema.index({ userId: 1, challengeId: 1 }, { unique: true })

// Index pour les classements
ParticipationSchema.index({ challengeId: 1, rank: 1 })
ParticipationSchema.index({ challengeId: 1, timeHeld: -1 })

export default mongoose.model<IParticipation>('Participation', ParticipationSchema)