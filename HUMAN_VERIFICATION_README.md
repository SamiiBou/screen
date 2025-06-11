# Human Verification System with World ID

Ce système permet aux utilisateurs de vérifier leur humanité en utilisant World ID de Worldcoin, débloquant des récompenses exclusives et l'accès à des challenges réservés aux humains.

## 🌟 Fonctionnalités

- **Vérification automatique** : Modal automatique pour les utilisateurs non-vérifiés
- **Vérification World ID** : Intégration avec MiniKit pour la vérification orb
- **Multiplicateur de tokens** : 2x tokens pour les humains vérifiés
- **Challenges exclusifs** : Accès aux challenges "human-only"
- **Interface moderne** : Composants React réutilisables avec CSS animé
- **Sécurité backend** : Vérification des preuves côté serveur
- **Contexte global** : Provider React pour gérer l'état dans toute l'app

## 🚀 Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre `.env` :

```bash
# World ID App Configuration
WORLD_APP_ID=app_a0673c3ab430fecb1b2ff723784c7720
NEXT_PUBLIC_WLD_APP_ID=app_a0673c3ab430fecb1b2ff723784c7720

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
```

### 2. Configuration World ID

Dans le [Developer Portal de Worldcoin](https://developer.worldcoin.org/) :

1. Créez une nouvelle action avec l'identifiant `verifyhuman`
2. Configurez le niveau de vérification sur `Orb`
3. Notez votre App ID

### 3. Installation des dépendances

```bash
npm install @worldcoin/minikit-js
```

## 🔧 Installation et intégration

### 1. Intégration automatique (Recommandée)

Le système fonctionne automatiquement une fois intégré dans le layout principal :

```tsx
// src/app/layout.tsx
import { HumanVerificationProvider } from '@/components/HumanVerificationProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MiniKitProvider>
          <AuthProvider>
            <HumanVerificationProvider
              autoShowModal={true}  // Affiche automatiquement le modal
              delayMs={2000}        // Délai de 2 secondes
            >
              {children}
            </HumanVerificationProvider>
          </AuthProvider>
        </MiniKitProvider>
      </body>
    </html>
  )
}
```

**Comportement automatique :**
- ✅ Détecte automatiquement les utilisateurs connectés non-vérifiés
- ✅ Affiche le modal après un délai intelligent (2 secondes par défaut)
- ✅ Ne s'affiche qu'une seule fois par session pour ne pas être intrusif
- ✅ Se réactive automatiquement pour les nouveaux utilisateurs

### 2. Utilisation du contexte global

Accédez au statut de vérification partout dans votre app :

```tsx
import { useHumanVerification } from '@/components/HumanVerificationProvider'

function YourComponent() {
  const { 
    isVerified, 
    verificationData, 
    showModal, 
    refreshStatus 
  } = useHumanVerification()

  return (
    <div>
      <p>Statut: {isVerified ? 'Vérifié' : 'Non vérifié'}</p>
      
      {!isVerified && (
        <button onClick={showModal}>
          Vérifier maintenant
        </button>
      )}
      
      {isVerified && (
        <p>Multiplicateur: {verificationData?.tokenMultiplier}x</p>
      )}
    </div>
  )
}
```

## 📦 Composants

### HumanVerificationProvider (Nouveau!)

Provider global qui gère automatiquement la vérification humaine dans toute l'application.

**Props:**
- `autoShowModal` (boolean): Affiche automatiquement le modal pour les non-vérifiés
- `delayMs` (number): Délai avant d'afficher le modal (défaut: 3000ms)
- `showOnLogin` (boolean): Vérifie seulement après login (défaut: true)

### HumanVerificationModal

Modal principal pour la vérification humaine.

```tsx
import HumanVerificationModal from '@/components/HumanVerificationModal'

const [isModalOpen, setIsModalOpen] = useState(false)

<HumanVerificationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onVerificationSuccess={(data) => {
    console.log('Verification successful:', data)
    // Rafraîchir l'état de l'application
  }}
/>
```

### HumanVerificationButton

Composant bouton avec plusieurs variantes qui utilise automatiquement le contexte global.

```tsx
import HumanVerificationButton from '@/components/HumanVerificationButton'

// Bouton simple
<HumanVerificationButton
  variant="button"
  size="md"
  onVerificationSuccess={handleSuccess}
/>

// Bannière
<HumanVerificationButton
  variant="banner"
  onVerificationSuccess={handleSuccess}
/>

// Carte
<HumanVerificationButton
  variant="card"
  onVerificationSuccess={handleSuccess}
/>
```

## 🎮 Exemples d'intégration

### 1. Dashboard avec vérification automatique

```tsx
import { useHumanVerification } from '@/components/HumanVerificationProvider'

function Dashboard() {
  const { isVerified, verificationData } = useHumanVerification()

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Bonus affiché automatiquement pour les vérifiés */}
      {isVerified && (
        <div className="bonus-banner">
          🎉 Vous gagnez {verificationData?.tokenMultiplier}x tokens !
        </div>
      )}
      
      {/* Le modal s'affiche automatiquement pour les non-vérifiés */}
      
      {/* Reste du contenu */}
    </div>
  )
}
```

### 2. Challenge avec restriction humaine

```tsx
function ChallengeCard({ challenge }) {
  const { isVerified, showModal } = useHumanVerification()
  
  const isHumanOnly = challenge.humanOnly
  const canParticipate = !isHumanOnly || isVerified
  
  return (
    <div className="challenge-card">
      <h3>{challenge.title}</h3>
      
      {isHumanOnly && (
        <div className="human-only-badge">
          👥 Réservé aux humains vérifiés
        </div>
      )}
      
      {!canParticipate ? (
        <div>
          <p>Ce challenge nécessite une vérification humaine</p>
          <button onClick={showModal}>
            Se vérifier maintenant
          </button>
        </div>
      ) : (
        <button>Rejoindre le challenge</button>
      )}
    </div>
  )
}
```

### 3. Système de tokens avec multiplicateur

```tsx
function TokenDisplay() {
  const { isVerified, verificationData } = useHumanVerification()
  const [tokens, setTokens] = useState(100)
  
  const effectiveTokens = isVerified 
    ? tokens * (verificationData?.tokenMultiplier || 1)
    : tokens
  
  return (
    <div>
      <div>Tokens base: {tokens}</div>
      {isVerified && (
        <div>
          Multiplicateur: x{verificationData?.tokenMultiplier}
          <div>Total: {effectiveTokens} tokens</div>
        </div>
      )}
    </div>
  )
}
```

## 🔧 API Endpoints

### POST `/api/auth/worldcoin-verify`

Vérifie la preuve World ID.

**Body:**
```json
{
  "proof": "...",
  "merkle_root": "...",
  "nullifier_hash": "...",
  "verification_level": "orb",
  "action": "verifyhuman",
  "app_id": "app_a0673c3ab430fecb1b2ff723784c7720"
}
```

### POST `/api/auth/update-human-verification`

Met à jour le statut de vérification de l'utilisateur.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nullifier_hash": "...",
  "verification_level": "orb"
}
```

### GET `/api/auth/human-verification-status`

Récupère le statut de vérification de l'utilisateur.

**Headers:** `Authorization: Bearer <token>`

## 💾 Modèle de données

Les nouveaux champs ajoutés au modèle `User` :

```typescript
interface IUser {
  // ... autres champs existants
  
  // Human Verification data
  humanVerified: boolean
  humanVerifiedAt?: Date
  humanVerificationNullifier?: string
  tokenMultiplier: number // 1 pour non-vérifié, 2 pour vérifié
}
```

## ⚙️ Configuration avancée

### Personnaliser le comportement automatique

```tsx
// Afficher seulement sur certaines pages
<HumanVerificationProvider
  autoShowModal={router.pathname !== '/onboarding'}
  delayMs={5000}  // Délai plus long
>
  {children}
</HumanVerificationProvider>

// Désactiver complètement l'automatisme
<HumanVerificationProvider
  autoShowModal={false}
>
  {children}
</HumanVerificationProvider>
```

### Contrôle programmatique

```tsx
function AdminPanel() {
  const { showModal, refreshStatus } = useHumanVerification()
  
  const handleForceVerification = () => {
    showModal() // Force l'affichage du modal
  }
  
  const handleRefresh = async () => {
    await refreshStatus() // Rafraîchit le statut depuis l'API
  }
  
  return (
    <div>
      <button onClick={handleForceVerification}>
        Forcer la vérification
      </button>
      <button onClick={handleRefresh}>
        Rafraîchir le statut
      </button>
    </div>
  )
}
```

## 🔐 Sécurité

### Production - Vérification des preuves

Pour la production, décommentez et configurez la vérification des preuves :

```typescript
// server/routes/auth.ts
import { verifyCloudProof } from '@worldcoin/minikit-js'

// Dans la route /worldcoin-verify
const verifyRes = await verifyCloudProof(
  { proof, merkle_root, nullifier_hash },
  app_id,
  action,
  signal
)

if (!verifyRes.success) {
  return res.status(400).json({
    status: 'error',
    message: 'Invalid World ID proof',
  })
}
```

### Prévention de la réutilisation

Le système empêche la réutilisation des `nullifier_hash` :

- Vérification avant mise à jour de l'utilisateur
- Un nullifier ne peut être utilisé que par un seul utilisateur
- Stockage sécurisé dans la base de données

## 🧪 Tests et développement

### Pages de test

- `/test-auto-verification` - Test du système automatique
- `/human-verification-demo` - Démonstration des composants

### Tests en développement

Le système simule la vérification réussie en développement. Pour tester :

1. Ouvrez l'application dans World App
2. Connectez-vous avec votre wallet
3. Le modal apparaîtra automatiquement après 2 secondes si vous n'êtes pas vérifié
4. Cliquez sur "Verify with World ID"
5. La vérification sera automatiquement simulée comme réussie

## 🎨 Personnalisation

### CSS Styling

Le fichier `HumanVerificationModal.css` contient tous les styles. Vous pouvez :

- Modifier les couleurs dans les gradients
- Ajuster les animations
- Changer les tailles et espacements

### Composant Button

Le `HumanVerificationButton` accepte des props pour la personnalisation :

- `variant`: 'button' | 'banner' | 'card'
- `size`: 'sm' | 'md' | 'lg'
- `className`: CSS classes personnalisées

## 📱 Compatibilité

- **World App** : Fonctionne parfaitement dans World App
- **Navigateurs web** : Détection et message d'erreur approprié
- **Mobile** : Interface responsive optimisée
- **SSR/Next.js** : Compatible avec le rendu côté serveur

## 🐛 Dépannage

### Erreur "World App not detected"

- Assurez-vous d'ouvrir l'app dans World App
- Vérifiez que MiniKit est correctement importé

### Le modal ne s'affiche pas automatiquement

- Vérifiez que l'utilisateur est connecté (`apiService.isAuthenticated()`)
- Vérifiez que `autoShowModal={true}` dans le provider
- Consultez la console pour les erreurs d'API

### Erreur "useHumanVerification must be used within HumanVerificationProvider"

- Assurez-vous que le composant est bien dans un enfant du provider
- Vérifiez que le provider est bien dans le layout principal

### Erreur "Invalid app ID"

- Vérifiez que `WORLD_APP_ID` correspond à votre App ID
- Assurez-vous que l'action `verifyhuman` existe dans le Developer Portal

### Erreur "This verification has already been used"

- Chaque verification World ID ne peut être utilisée qu'une seule fois
- L'utilisateur doit utiliser une nouvelle vérification

## 📚 Ressources

- [Documentation World ID](https://docs.worldcoin.org/)
- [MiniKit Documentation](https://docs.worldcoin.org/minikit)
- [Developer Portal](https://developer.worldcoin.org/)

## 🤝 Support

Pour toute question ou problème :

1. Vérifiez les logs de la console pour les erreurs
2. Testez sur `/test-auto-verification` pour voir le comportement
3. Assurez-vous que toutes les variables d'environnement sont configurées
4. Testez dans World App pour la meilleure expérience 