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
const ChallengeSchema = new mongoose_1.Schema({
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
});
exports.default = mongoose_1.default.model('Challenge', ChallengeSchema);
