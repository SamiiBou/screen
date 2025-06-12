#!/bin/bash

# Script de vérification avant déploiement
echo "🔍 Vérification TypeScript et Linting avant déploiement..."

# Vérification TypeScript
echo "📝 Vérification des types TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Erreurs TypeScript détectées! Corrigez-les avant de déployer."
    exit 1
fi

# Vérification ESLint
echo "🔍 Vérification ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Erreurs de linting détectées! Corrigez-les avant de déployer."
    exit 1
fi

# Test de build
echo "🏗️ Test de build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build! Corrigez-les avant de déployer."
    exit 1
fi

echo "✅ Toutes les vérifications sont passées! Vous pouvez déployer en toute sécurité." 