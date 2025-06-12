# 🛠️ Guide de Développement

## Vérification des erreurs TypeScript avant déploiement

### 🚀 Scripts disponibles

```bash
# Vérifier uniquement les types TypeScript
npm run type-check

# Vérifier le linting
npm run lint

# Vérifier types + linting
npm run check-all

# Script complet avant déploiement
./check-before-deploy.sh
```

### 🔍 Comment détecter toutes les erreurs avant le build

1. **Vérification locale** : Toujours exécuter avant de push
   ```bash
   npm run type-check
   ```

2. **Vérification complète** : Avant déploiement
   ```bash
   ./check-before-deploy.sh
   ```

3. **Configuration de l'éditeur** : 
   - Activez TypeScript strict mode
   - Installez l'extension TypeScript dans votre éditeur
   - Configurez l'auto-save avec vérification

### 🚨 Types d'erreurs courantes

1. **Propriétés optionnelles** : 
   ```typescript
   // ❌ Erreur
   const value = claimData?.voucher.amount  // peut être undefined
   
   // ✅ Correct
   if (!claimData?.voucher?.amount) return
   const value = claimData.voucher.amount
   ```

2. **Types unions** :
   ```typescript
   // ❌ Erreur
   function process(value: string | number | undefined) { ... }
   
   // ✅ Correct
   function process(value: string | number) { ... }
   if (value !== undefined) process(value)
   ```

3. **Vérifications null** :
   ```typescript
   // ❌ Erreur
   user.name.toLowerCase()  // user peut être null
   
   // ✅ Correct
   user?.name?.toLowerCase()
   ```

### 🔧 Configuration stricte recommandée

Votre `tsconfig.json` est déjà configuré avec :
- `"strict": true` - Active toutes les vérifications strictes
- `"noEmit": true` - Vérification sans génération de fichiers

### 🤖 Automatisation

- **GitHub Actions** : Vérification automatique sur chaque push
- **Pre-commit hooks** : Empêche les commits avec erreurs TypeScript
- **CI/CD** : Échec du déploiement si erreurs détectées

### 📋 Checklist avant déploiement

- [ ] `npm run type-check` ✅
- [ ] `npm run lint` ✅  
- [ ] `npm run build` ✅
- [ ] Tests manuels ✅
- [ ] Deploy 🚀 