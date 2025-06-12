import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  username: string
  displayName?: string
  walletAddress: string
  avatar?: string
  verified: boolean
  authMethod: 'wallet'
  
  // MiniKit specific data
  minikitUsername?: string
  minikitUserId?: string
  minikitProfilePicture?: string
  minikitVerificationLevel?: string
  worldIdNullifierHash?: string
  
  // Human Verification data
  humanVerified: boolean
  humanVerifiedAt?: Date
  humanVerificationNullifier?: string
  tokenMultiplier: number
  
  // Authentication data
  lastLogin: Date
  lastWalletSignature?: string
  
  // Game data
  bestTime: number
  totalChallengesPlayed: number
  
  // HODL Token balance
  hodlTokenBalance: number
  
  createdAt: Date
  updatedAt: Date
  
  // Helper methods
  getMiniKitProfile(): any
  getPublicProfile(): any
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  authMethod: {
    type: String,
    enum: ['wallet'],
    default: 'wallet'
  },
  
  // MiniKit specific data
  minikitUsername: {
    type: String,
    trim: true
  },
  minikitUserId: {
    type: String,
    trim: true
  },
  minikitProfilePicture: {
    type: String,
    trim: true
  },
  minikitVerificationLevel: {
    type: String,
    enum: ['unverified', 'orb', 'phone', 'device'],
    default: 'unverified'
  },
  worldIdNullifierHash: {
    type: String,
    trim: true
  },
  
  // Human Verification data
  humanVerified: {
    type: Boolean,
    default: false
  },
  humanVerifiedAt: {
    type: Date
  },
  humanVerificationNullifier: {
    type: String,
    trim: true
  },
  tokenMultiplier: {
    type: Number,
    default: 1
  },
  
  // Authentication data
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastWalletSignature: {
    type: String,
    trim: true
  },
  
  // Game data
  bestTime: {
    type: Number,
    default: 0
  },
  totalChallengesPlayed: {
    type: Number,
    default: 0
  },
  
  // HODL Token balance
  hodlTokenBalance: {
    type: Number,
    default: 5, // Initialize with 5 tokens
    min: 0
  }
}, {
  timestamps: true
})

// Helper method to get MiniKit profile data
UserSchema.methods.getMiniKitProfile = function() {
  return {
    username: this.minikitUsername,
    userId: this.minikitUserId,
    profilePicture: this.minikitProfilePicture,
    verificationLevel: this.minikitVerificationLevel,
    nullifierHash: this.worldIdNullifierHash
  }
}

// Helper method to get public profile data
UserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    verified: this.verified,
    humanVerified: this.humanVerified,
    humanVerifiedAt: this.humanVerifiedAt,
    tokenMultiplier: this.tokenMultiplier,
    bestTime: this.bestTime,
    totalChallengesPlayed: this.totalChallengesPlayed,
    hodlTokenBalance: this.hodlTokenBalance,
    createdAt: this.createdAt
  }
}

export default mongoose.model<IUser>('User', UserSchema)