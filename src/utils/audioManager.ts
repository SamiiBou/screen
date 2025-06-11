import { audioConfig } from './audioConfig'

export class AudioManager {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false
  private currentTrackIndex = 0
  private currentRadioIndex = 0
  private currentlyPlaying: string | null = null
  
  // Radios ambient/lofi qui fonctionnent en streaming
  private radioStreams = [
    'http://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/', // FluxFM Chillhop
    'https://lofi.streamguys1.com/lofi', // LoFi Radio
    'https://relay.publicdomainproject.org/chillout_lounge.mp3', // Chillout/Lounge
    'https://streaming.radionomy.com/JamendoLounge', // Jamendo Lounge
    'https://live.musopen.org:8085/streamvbr0', // Musopen Classical (ambient)
  ]

  // Fichiers audio locaux (vous pouvez ajouter vos propres fichiers dans public/audio/)
  private localTracks = [
    '/audio/ambient-1.mp3',
    '/audio/ambient-2.mp3', 
    '/audio/ambient-3.mp3',
    '/audio/lofi-1.mp3',
    '/audio/lofi-2.mp3',
  ]

  private tryPlayTrack(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.audio) {
        this.audio.pause()
        this.audio = null
      }

      this.audio = new Audio()
      this.audio.crossOrigin = 'anonymous'
      this.audio.volume = audioConfig.defaultVolume
      this.audio.loop = false
      
      const onCanPlay = () => {
        this.audio?.removeEventListener('canplaythrough', onCanPlay)
        this.audio?.removeEventListener('error', onError)
        this.currentlyPlaying = url
        resolve(true)
      }
      
      const onError = () => {
        this.audio?.removeEventListener('canplaythrough', onCanPlay)
        this.audio?.removeEventListener('error', onError)
        console.warn('🎵 Impossible de charger:', url)
        resolve(false)
      }
      
      this.audio.addEventListener('canplaythrough', onCanPlay)
      this.audio.addEventListener('error', onError)
      
      // Pour les radios, on boucle indéfiniment
      // Pour les pistes, on passe à la suivante quand elle se termine
      this.audio.addEventListener('ended', () => {
        if (this.isPlaying) {
          this.playNext()
        }
      })
      
      this.audio.src = url
      this.audio.load()
    })
  }

  private async playNext() {
    if (!this.isPlaying) return
    
    // D'abord essayer les fichiers locaux
    for (let i = 0; i < audioConfig.localTracks.length; i++) {
      const trackIndex = (this.currentTrackIndex + i) % audioConfig.localTracks.length
      const trackUrl = audioConfig.localTracks[trackIndex]
      const success = await this.tryPlayTrack(trackUrl)
      
      if (success && this.audio) {
        this.currentTrackIndex = (trackIndex + 1) % audioConfig.localTracks.length
        try {
          await this.audio.play()
          console.log('🎵 Lecture de la piste locale:', trackUrl)
          return
        } catch (e) {
          console.warn('🎵 Erreur de lecture:', e)
        }
      }
    }
    
    // Si aucune piste locale ne fonctionne, essayer les radios en streaming
    for (let i = 0; i < audioConfig.radioStreams.length; i++) {
      const radioIndex = (this.currentRadioIndex + i) % audioConfig.radioStreams.length
      const radio = audioConfig.radioStreams[radioIndex]
      const success = await this.tryPlayTrack(radio.url)
      
      if (success && this.audio) {
        this.currentRadioIndex = (radioIndex + 1) % audioConfig.radioStreams.length
        try {
          await this.audio.play()
          console.log(`🎵 Lecture de la radio: ${radio.name} (${radio.genre})`)
          return
        } catch (e) {
          console.warn('🎵 Erreur de lecture radio:', e)
        }
      }
    }
    
    // Dernier recours : générer un ton ambient synthétique
    console.log('🎵 Aucune source audio disponible, génération de sons synthétiques')
    this.createSynthAmbient()
  }

  private createSynthAmbient() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Créer des oscillateurs pour un son ambient doux style Low Roar
      const osc1 = audioContext.createOscillator()
      const osc2 = audioContext.createOscillator()
      const osc3 = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()
      
      // Fréquences inspirées de Low Roar (tons mineurs, ambient)
      osc1.type = 'sine'
      osc2.type = 'triangle'
      osc3.type = 'sawtooth'
      
      osc1.frequency.setValueAtTime(110, audioContext.currentTime) // A2
      osc2.frequency.setValueAtTime(165, audioContext.currentTime) // E3
      osc3.frequency.setValueAtTime(220, audioContext.currentTime) // A3
      
      // Filtre passe-bas pour adoucir
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, audioContext.currentTime)
      filter.Q.setValueAtTime(0.5, audioContext.currentTime)
      
      // Volume très doux avec fade in lent
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 4)
      
      // Routing du signal
      osc1.connect(gainNode)
      osc2.connect(gainNode)
      osc3.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      osc1.start()
      osc2.start()
      osc3.start()
      
      // Modulation lente des fréquences pour créer du mouvement
      const lfo = audioContext.createOscillator()
      const lfoGain = audioContext.createGain()
      lfo.frequency.setValueAtTime(0.1, audioContext.currentTime) // Très lent
      lfoGain.gain.setValueAtTime(5, audioContext.currentTime) // Modulation subtile
      
      lfo.connect(lfoGain)
      lfoGain.connect(osc2.frequency)
      lfo.start()
      
      // Arrêter après 45 secondes et recommencer avec des variations
      setTimeout(() => {
        try {
          osc1.stop()
          osc2.stop()
          osc3.stop()
          lfo.stop()
        } catch (e) {
          // Ignorer les erreurs de stop si déjà arrêté
        }
        
        if (this.isPlaying) {
          setTimeout(() => this.createSynthAmbient(), 2000)
        }
      }, 45000)
      
      console.log('🎵 Génération de musique ambient synthétique (style Low Roar)')
      this.currentlyPlaying = 'Ambient synthétique'
    } catch (e) {
      console.warn('🎵 Impossible de créer l\'audio synthétique:', e)
    }
  }

  async start() {
    if (this.isPlaying) return
    
    console.log('🎵 Démarrage de la musique ambient...')
    this.isPlaying = true
    
    // Essayer de démarrer la lecture
    try {
      await this.playNext()
    } catch (e) {
      console.warn('🎵 Lecture automatique bloquée par le navigateur, nécessite une interaction utilisateur')
      // Nous essaierons quand même, le navigateur peut autoriser selon le contexte
    }
  }

  stop() {
    console.log('🎵 Arrêt de la musique')
    this.isPlaying = false
    this.currentlyPlaying = null
    
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume))
    }
  }

  fadeIn(duration = audioConfig.fadeInDuration) {
    if (!this.audio) return
    
    this.audio.volume = 0
    const targetVolume = audioConfig.defaultVolume
    const steps = 30
    const stepTime = duration / steps
    const volumeStep = targetVolume / steps
    
    let currentStep = 0
    const fadeInterval = setInterval(() => {
      if (!this.audio || currentStep >= steps) {
        clearInterval(fadeInterval)
        return
      }
      
      currentStep++
      this.audio.volume = Math.min(targetVolume, currentStep * volumeStep)
    }, stepTime)
  }

  fadeOut(duration = audioConfig.fadeOutDuration) {
    if (!this.audio) return
    
    const initialVolume = this.audio.volume
    const steps = 20
    const stepTime = duration / steps
    const volumeStep = initialVolume / steps
    
    let currentStep = 0
    const fadeInterval = setInterval(() => {
      if (!this.audio || currentStep >= steps) {
        clearInterval(fadeInterval)
        if (this.audio) {
          this.audio.volume = 0
        }
        return
      }
      
      currentStep++
      this.audio.volume = Math.max(0, initialVolume - (currentStep * volumeStep))
    }, stepTime)
  }

  // Obtenir des informations sur ce qui joue actuellement
  getCurrentTrack(): string | null {
    return this.currentlyPlaying
  }

  // Vérifier si la musique joue
  getIsPlaying(): boolean {
    return this.isPlaying && this.audio !== null
  }
}

// Instance globale
export const audioManager = new AudioManager() 