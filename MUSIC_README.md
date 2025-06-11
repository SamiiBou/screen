# 🎵 Configuration Audio pour Button Game

## 📁 Organisation des fichiers

```
public/
  audio/
    ambient-1.mp3      # Piste ambient 1
    ambient-2.mp3      # Piste ambient 2
    lofi-1.mp3         # Piste lo-fi 1
    ...
src/
  utils/
    audioConfig.ts     # Configuration centralisée
    audioManager.ts    # Gestionnaire audio
```

## 🎶 Sources audio supportées

### 1. Fichiers locaux
- Placez vos fichiers audio dans `public/audio/`
- Formats supportés : `.mp3`, `.wav`, `.ogg`, `.m4a`
- Recommandé : MP3 128-320kbps pour un bon compromis qualité/taille

### 2. Radios en streaming
- URLs de streaming direct (format .mp3, .aac, .ogg)
- Radios low-fi, ambient, chillout pré-configurées

### 3. Audio synthétique
- Génération automatique de tons ambient si aucune source n'est disponible
- Style inspiré de Low Roar avec oscillateurs et modulation

## ⚙️ Configuration

Éditez `src/utils/audioConfig.ts` pour personnaliser :

```typescript
export const audioConfig = {
  // Volume par défaut (0.0 à 1.0)
  defaultVolume: 0.25,
  
  // Durée des transitions
  fadeInDuration: 3000,  // 3 secondes
  fadeOutDuration: 2000, // 2 secondes
  
  // Vos fichiers audio locaux
  localTracks: [
    '/audio/your-track-1.mp3',
    '/audio/your-track-2.mp3',
    // Ajoutez vos pistes ici
  ],
  
  // Radios en streaming
  radioStreams: [
    {
      name: 'Votre Radio',
      url: 'https://votre-radio.com/stream.mp3',
      genre: 'Ambient'
    }
  ]
}
```

## 🎧 Recommendations musicales (style Low Roar)

### Genres recommandés :
- **Ambient** : Sons atmosphériques, drones
- **Lo-Fi Hip Hop** : Beats calmes et répétitifs  
- **Downtempo** : Rythmes lents et relaxants
- **Chillwave** : Synthés nostalgiques
- **Post-Rock instrumental** : Mélodies éthérées

### Artistes similaires à Low Roar :
- Ólafur Arnalds
- Nils Frahm
- Max Richter
- Kiasmos
- Rival Consoles

### Sites pour trouver de la musique libre :
- **Freesound.org** : Sons ambient et field recordings
- **Jamendo** : Musique libre sous Creative Commons
- **Free Music Archive** : Large collection de musique libre
- **YouTube Audio Library** : Pistes gratuites pour créateurs

## 🔧 Fonctionnement technique

### Ordre de priorité :
1. **Fichiers locaux** (public/audio/)
2. **Radios en streaming** (URLs externes)
3. **Audio synthétique** (génération automatique)

### Gestion des erreurs :
- Tentative automatique de toutes les sources
- Fallback vers audio synthétique si rien ne fonctionne
- Logs détaillés dans la console

### Contrôles audio :
- **Démarrage** : Quand l'utilisateur clique sur START
- **Fade in** : Transition douce (3s par défaut)
- **Fade out** : Quand le jeu se termine (2s par défaut)
- **Arrêt** : Quand l'utilisateur quitte ou redémarre

## 🎮 Intégration dans le jeu

Le système audio est intégré dans `ButtonGame.tsx` :

- ▶️ **Démarrage** : Fonction `begin()`
- ⏹️ **Arrêt** : Fonction `finish()` et `restart()`
- 🔊 **Indicateur visuel** : Point bleu avec note de musique
- 🧹 **Nettoyage** : Arrêt automatique si l'utilisateur ferme la page

## 📱 Compatibilité

### Navigateurs :
- ✅ Chrome/Edge (excellent)
- ✅ Firefox (bon)
- ✅ Safari (bon, quelques limitations)
- ⚠️ Mobile Safari (restrictions autoplay)

### Notes importantes :
- Les navigateurs peuvent bloquer l'autoplay audio
- L'audio nécessite une interaction utilisateur (clic sur START)
- Certaines radios peuvent ne pas fonctionner selon les politiques CORS

## 🎛️ Personnalisation avancée

Pour une personnalisation plus poussée, éditez `audioManager.ts` :

- Modifier les algorithmes de synthèse audio
- Ajouter des effets audio (reverb, delay, etc.)
- Implémenter des transitions personnalisées
- Ajouter des contrôles de volume dynamiques

---

**Profitez de votre expérience musical ambient ! 🎵✨** 