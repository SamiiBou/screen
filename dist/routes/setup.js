"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Challenge_1 = __importDefault(require("../models/Challenge"));
const router = express_1.default.Router();
router.post('/init-challenges', async (req, res) => {
    try {
        // Supprimer tous les challenges existants
        await Challenge_1.default.deleteMany({});
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        // Créer des challenges de test
        const challenges = [
            {
                title: "🚀 Challenge Débutant",
                description: "Perfect pour commencer ! Tenez le bouton le plus longtemps possible.",
                startDate: new Date(now.getTime() - 60 * 60 * 1000), // Commencé il y a 1h
                endDate: tomorrow,
                maxParticipants: 100,
                prizePool: 50,
                status: 'active'
            },
            {
                title: "💎 Challenge Élite",
                description: "Pour les vrais champions ! Défis anti-triche intensifiés.",
                startDate: now,
                endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 jours
                maxParticipants: 50,
                prizePool: 500,
                status: 'active'
            },
            {
                title: "🏆 Grand Challenge Hebdomadaire",
                description: "Le challenge ultime avec la plus grosse cagnotte !",
                startDate: now,
                endDate: nextWeek,
                maxParticipants: 1000,
                prizePool: 2000,
                status: 'active'
            },
            {
                title: "⚡ Challenge Flash",
                description: "Challenge rapide de 6 heures seulement !",
                startDate: now,
                endDate: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 heures
                maxParticipants: 200,
                prizePool: 100,
                status: 'active'
            },
            {
                title: "🌟 Challenge du Weekend",
                description: "Challenge spécial weekend avec bonus !",
                startDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Dans 2h
                endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 jours
                maxParticipants: 300,
                prizePool: 750,
                status: 'upcoming'
            }
        ];
        const createdChallenges = await Challenge_1.default.insertMany(challenges);
        res.json({
            message: `${createdChallenges.length} challenges créés avec succès`,
            challenges: createdChallenges
        });
    }
    catch (error) {
        console.error('Erreur création challenges:', error);
        // Plus de détails sur l'erreur
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: 'Erreur de validation',
                errors: validationErrors,
                details: error.message
            });
        }
        res.status(500).json({
            message: 'Erreur serveur lors de la création',
            error: error.message || 'Erreur inconnue'
        });
    }
});
router.get('/challenges-status', async (req, res) => {
    try {
        const totalChallenges = await Challenge_1.default.countDocuments();
        const activeChallenges = await Challenge_1.default.countDocuments({ status: 'active' });
        const upcomingChallenges = await Challenge_1.default.countDocuments({ status: 'upcoming' });
        const completedChallenges = await Challenge_1.default.countDocuments({ status: 'completed' });
        res.json({
            total: totalChallenges,
            active: activeChallenges,
            upcoming: upcomingChallenges,
            completed: completedChallenges
        });
    }
    catch (error) {
        console.error('Erreur status challenges:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
exports.default = router;
