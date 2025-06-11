# HODL Token System

Cette documentation explique le système de tokens HODL intégré dans l'application.

## Vue d'ensemble

Le système HODL Token permet aux utilisateurs de :
1. Recevoir des tokens HODL gratuits (5 tokens par défaut à l'inscription)
2. Claim leurs tokens depuis l'interface web
3. Recevoir les tokens directement dans leur wallet via MiniKit/World App

## Architecture

### Contracts Déployés

- **HODL Token**: `0xCb17Da6Ded2736D480aCF93cb525d12f6f046BD4` (ERC20)
- **HODL Distributor**: `0xb525567dE6E171936aCB95698904634DA0a548C2` (Distributeur avec vouchers)

### Flux de fonctionnement

1. **Balance utilisateur**: Stockée dans MongoDB (`hodlTokenBalance`)
2. **Génération de voucher**: Serveur signe un voucher EIP712
3. **Transaction**: MiniKit envoie la transaction au contract distributor
4. **Claim**: L'utilisateur reçoit ses tokens dans son wallet

## Composants

### Backend

- `server/models/User.ts` - Modèle utilisateur avec balance HODL
- `server/utils/voucher.ts` - Utilitaires de signature EIP712
- `server/routes/hodl.ts` - Routes API pour les tokens HODL

### Frontend

- `src/components/HodlBalance.tsx` - Interface utilisateur
- `src/contracts/HodlDistributorABI.json` - ABI du contract distributor

## Variables d'environnement

```bash
# Clé privée pour signer les vouchers (REQUIRED)
TOKEN_PRIVATE_KEY=0x...

# App ID WorldCoin pour MiniKit (REQUIRED)
NEXT_PUBLIC_WLD_APP_ID=app_xxx
```

## Utilisation

### Pour les utilisateurs

1. Se connecter avec MiniKit/World App
2. Voir sa balance HODL sur la page d'accueil
3. Cliquer sur "Claim Tokens" pour recevoir les tokens
4. Confirmer la transaction dans World App

### Pour les développeurs

```typescript
// Ajouter des tokens à un utilisateur (pour tests)
await apiService.addHodlTokens(10) // Ajoute 10 tokens

// Récupérer la balance
const balance = await apiService.getHodlBalance()
```

## Sécurité

- Tous les vouchers sont signés avec EIP712
- La signature est vérifiée on-chain
- Deadline de 1 heure sur chaque voucher
- Nonce unique basé sur timestamp

## Tests

```bash
# Tester la génération de vouchers
node server/scripts/test-hodl.js
```

## Dépendances

- `ethers.js` - Signature EIP712
- `@worldcoin/minikit-js` - Intégration MiniKit
- `viem` - Utilitaires blockchain 