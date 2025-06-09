# Button Endurance Game

Un jeu d'endurance moderne développé avec Next.js 15, integrant shadcn/ui et Aceternity UI pour une expérience utilisateur exceptionnelle.

## 🚀 Technologies

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI réutilisables et accessibles
- **Aceternity UI** - Composants UI interactifs et animés
- **Motion** - Animations fluides (framer-motion pour React 19)
- **React Icons** - Icônes React

## 📦 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Démarrage du serveur de développement

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3001`

## 🎨 Composants UI

### shadcn/ui

Le projet utilise shadcn/ui pour les composants de base :

```bash
# Initialiser shadcn/ui (déjà fait)
npx shadcn@latest init

# Ajouter des composants
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add label
```

### Aceternity UI

Les composants Aceternity UI sont intégrés pour des interactions avancées :

- **Cards animées** avec effets de particules
- **Animations fluides** avec motion
- **Design minimaliste** inspiré d'Apple

## 📂 Structure du projet

```
src/
├── app/
│   ├── test-aceternity/     # Page de test Aceternity UI
│   ├── ui-showcase/         # Démonstration des composants
│   └── page.tsx             # Page d'accueil
├── components/
│   └── ui/
│       ├── aceternity-card.tsx  # Composants Aceternity UI
│       ├── button.tsx           # shadcn/ui Button
│       ├── card.tsx             # shadcn/ui Card
│       ├── badge.tsx            # shadcn/ui Badge
│       ├── input.tsx            # shadcn/ui Input
│       └── label.tsx            # shadcn/ui Label
└── lib/
    └── utils.ts             # Utilitaires (cn function)
```

## 🎯 Pages de démonstration

### Test Aceternity UI
Visitez `/test-aceternity` pour voir les composants Aceternity UI en action.

### Showcase UI
Visitez `/ui-showcase` pour voir une démonstration complète des composants shadcn/ui et Aceternity UI.

## 🎨 Design System

### Couleurs

Le projet utilise une palette de couleurs inspirée d'Apple :

- **Texte principal** : `#1a1a1a`
- **Texte secondaire** : `#6b7280`
- **Arrière-plan** : `#f8fafc`
- **Accent** : `#007AFF`

### Composants

#### shadcn/ui
- Design system cohérent
- Accessibilité intégrée
- Variantes multiples
- Thème configurable

#### Aceternity UI
- Animations avancées
- Effets de particules
- Design Apple-like
- Interactions fluides

## 🔧 Configuration

### Tailwind CSS

Le projet est configuré avec Tailwind CSS v3 et inclut :
- Animations personnalisées
- Classes utilitaires étendues
- Support du dark mode
- Responsive design

### TypeScript

Configuration TypeScript stricte avec :
- Support Next.js 15
- Types pour React 19
- Chemins absolus (`@/`)

### Composants

Les composants sont configurés via `components.json` :

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 📱 Responsive Design

Toutes les interfaces sont optimisées pour :
- Mobile (320px+)
- Tablette (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## 🎬 Animations

### CSS Animations

```css
@keyframes move {
  0% { transform: translateX(-200px); }
  100% { transform: translateX(200px); }
}

.animate-move {
  animation: move 5s linear infinite;
}
```

### Motion Animations

Utilisation de motion/react pour :
- Transitions de page
- Hover effects
- Micro-interactions
- Animations de particules

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Démarrage en production

```bash
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants de base
- [Aceternity UI](https://ui.aceternity.com/) pour les composants avancés
- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling 