"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
});
// Helper method to get MiniKit profile data
UserSchema.methods.getMiniKitProfile = function () {
    return {
        username: this.minikitUsername,
        userId: this.minikitUserId,
        profilePicture: this.minikitProfilePicture,
        verificationLevel: this.minikitVerificationLevel,
        nullifierHash: this.worldIdNullifierHash
    };
};
// Helper method to get public profile data
UserSchema.methods.getPublicProfile = function () {
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
    };
};
exports.default = mongoose_1.default.model('User', UserSchema);
