// Configuration des sources audio pour le jeu
export const audioConfig = {
  // Volume par défaut (0.0 à 1.0)
  defaultVolume: 0.25,
  
  // Durée des fade in/out en millisecondes
  fadeInDuration: 3000,
  fadeOutDuration: 2000,
  
  // Fichiers audio locaux (placez vos fichiers dans public/audio/)
  // Formats supportés: .mp3, .wav, .ogg, .m4a
  localTracks: [
    '/audio/LowRoar.mp3',
    // '/audio/ambient-2.mp3', 
    // '/audio/ambient-3.mp3',
    // '/audio/lofi-1.mp3',
    // '/audio/lofi-2.mp3',
    // '/audio/downtempo-1.mp3',
    // '/audio/chillwave-1.mp3',
  ],
  
  // Radios en streaming (testées et fonctionnelles)
  radioStreams: [
    {
      name: 'LoFi Hip Hop Radio',
      url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
      genre: 'Lo-Fi Hip Hop'
    },
    {
      name: 'Chillout Lounge',
      url: 'https://relay.publicdomainproject.org/chillout_lounge.mp3',
      genre: 'Chillout'
    },
    {
      name: 'Ambient Sleeping Pill',
      url: 'https://radio.stereoscenic.com/asp-s',
      genre: 'Ambient'
    },
    {
      name: 'SomaFM Drone Zone',
      url: 'https://somafm.com/dronezone130.pls',
      genre: 'Ambient Drone'
    },
    {
      name: 'Radio Caprice - Ambient',
      url: 'http://79.120.77.11:8000/ambient',
      genre: 'Ambient'
    }
  ],
  
  // URLs de secours (YouTube Audio, SoundCloud, etc.)
  // Note: Ces URLs peuvent ne pas fonctionner en raison des politiques CORS
  fallbackSources: [
    'https://www.youtube.com/watch?v=jfKfPfyJRdk', // LoFi Hip Hop
  ],
  
  // Instructions pour ajouter vos propres pistes
  instructions: `
    Pour ajouter vos propres pistes audio :
    
    1. FICHIERS LOCAUX :
       - Placez vos fichiers audio dans le dossier public/audio/
       - Ajoutez les chemins dans le tableau 'localTracks' ci-dessus
       - Exemple: '/audio/ma-piste-ambient.mp3'
    
    2. RADIOS EN STREAMING :
       - Trouvez l'URL de streaming direct (format .mp3, .aac, .ogg)
       - Ajoutez l'URL dans le tableau 'radioStreams'
       - Testez que l'URL fonctionne dans votre navigateur
    
    3. FORMATS SUPPORTÉS :
       - MP3 (recommandé pour la compatibilité)
       - WAV (haute qualité, fichiers volumineux)
       - OGG (bonne compression, moins compatible)
       - M4A/AAC (bon compromis qualité/taille)
    
    4. CONSEILS :
       - Utilisez des fichiers de 128kbps à 320kbps pour l'audio en streaming
       - Évitez les fichiers trop volumineux (>10MB) pour le web
       - Préférez les pistes sans paroles pour une ambiance zen
       - Testez les URLs de radio avant de les ajouter
  `
} 