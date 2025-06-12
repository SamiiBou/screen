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
const ParticipationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    challengeId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
});
// Index pour éviter les participations multiples au même challenge
ParticipationSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
// Index pour les classements
ParticipationSchema.index({ challengeId: 1, rank: 1 });
ParticipationSchema.index({ challengeId: 1, timeHeld: -1 });
exports.default = mongoose_1.default.model('Participation', ParticipationSchema);
