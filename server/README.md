# Button Game Server Configuration

## Configuration ngrok

### URLs actuelles :
- **Frontend**: https://screen-fawn.vercel.app → http://localhost:3001
- **Backend**: https://screen-production.up.railway.app → http://localhost:5173

### Variables d'environnement nécessaires (.env)

```bash
# Port du serveur
PORT=5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/button-game

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Node Environment
NODE_ENV=development
```

## Démarrage

1. **Frontend** (port 3001):
```bash
npm run dev
```

2. **Backend** (port 5173):
```bash
npm run dev:server
```

3. **ngrok tunnels**:
```bash
# Terminal 1 - Frontend
ngrok http 3001

# Terminal 2 - Backend  
ngrok http 5173
```

## CORS Configuration

Le serveur est configuré pour accepter les requêtes depuis :
- https://screen-fawn.vercel.app (frontend ngrok)
- http://localhost:3001 (frontend local)
- http://localhost:3000 (frontend local alternatif)

## Tests de connectivité

Utilisez le bouton "Test Backend Connection" dans l'interface d'authentification pour vérifier que l'API est accessible.

## Endpoints disponibles

- `GET /api/health` - Test de santé du serveur
- `GET /api/auth/nonce` - Générer un nonce pour l'authentification
- `POST /api/auth/complete-siwe` - Vérifier l'authentification SIWE
- `GET /api/auth/me` - Profil utilisateur
- `GET /api/auth/stats` - Statistiques générales 