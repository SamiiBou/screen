"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const challenges_1 = __importDefault(require("./routes/challenges"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const setup_1 = __importDefault(require("./routes/setup"));
const hodl_1 = __importDefault(require("./routes/hodl"));
dotenv_1.default.config();
// Debug des variables d'environnement
console.log('🔍 [SERVER DEBUG] Environment variables loaded:');
console.log('🔍 [SERVER DEBUG] NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 [SERVER DEBUG] PORT:', process.env.PORT);
console.log('🔍 [SERVER DEBUG] TOKEN_PRIVATE_KEY exists:', !!process.env.TOKEN_PRIVATE_KEY);
console.log('🔍 [SERVER DEBUG] TOKEN_PRIVATE_KEY length:', process.env.TOKEN_PRIVATE_KEY?.length || 0);
console.log('🔍 [SERVER DEBUG] WORLD_APP_ID:', process.env.WORLD_APP_ID);
console.log('🔍 [SERVER DEBUG] Working directory:', process.cwd());
console.log('🔍 [SERVER DEBUG] All env vars with TOKEN:', Object.keys(process.env).filter(key => key.includes('TOKEN')));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8080;
// Configuration CORS pour Railway et autres environnements
const corsOptions = {
    origin: [
        'https://screen-fawn.vercel.app', // Frontend ngrok
        'http://localhost:3001', // Frontend local
        'http://localhost:3000', // Frontend local alternatif
        'https://screen-production.up.railway.app', // Railway backend
        /^https:\/\/.*\.railway\.app$/, // Tous les domaines Railway
        /^https:\/\/.*\.ngrok\.app$/, // Tous les domaines ngrok
        /^https:\/\/.*\.ngrok-free\.app$/, // Nouveaux domaines ngrok
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Middleware additionnel pour Railway et ngrok
app.use((req, res, next) => {
    // Ajouter des en-têtes pour tous les environnements
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    // Log pour debug
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/button-game');
        console.log('✅ MongoDB connecté avec succès');
    }
    catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
};
app.use('/api/auth', auth_1.default);
app.use('/api/challenges', challenges_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/setup', setup_1.default);
app.use('/api/hodl', hodl_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend opérationnel',
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});
// Route pour tester Railway
app.get('/', (req, res) => {
    res.json({
        message: 'Backend HODL2 opérationnel sur Railway!',
        endpoints: [
            '/api/health',
            '/api/auth/*',
            '/api/challenges/*',
            '/api/leaderboard/*',
            '/api/setup/*',
            '/api/hodl/*'
        ]
    });
});
connectDB().then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}`);
        console.log(`🔗 Backend accessible via: https://screen-production.up.railway.app`);
        console.log(`🌐 Frontend accessible via: https://screen-fawn.vercel.app`);
        console.log(`🌍 Server listening on 0.0.0.0:${PORT}`);
    });
    // Gestion gracieuse de l'arrêt
    process.on('SIGTERM', () => {
        console.log('📴 SIGTERM reçu, arrêt gracieux du serveur...');
        server.close(() => {
            console.log('✅ Serveur fermé');
            mongoose_1.default.connection.close();
        });
    });
}).catch(error => {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
});
