/*
  Lightweight audio manager used by ButtonGame.
  It wraps an HTMLAudioElement and provides async start(), stop(), fadeIn(), fadeOut().
  Audio file is optional: if missing or browser blocks autoplay, methods resolve silently so that
  gameplay logic is not interrupted.
*/

class SimpleAudioManager {
  private audio: HTMLAudioElement | null = null
  private context: AudioContext | null = null
  private gainNode: GainNode | null = null
  private source: MediaElementAudioSourceNode | null = null
  private isStarted = false

  async init() {
    if (typeof window === 'undefined' || this.isStarted) return

    // Load a short ambient loop (royalty-free) or silent placeholder.
    const src = '/ambient.mp3'
    const audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'

    // Create Web Audio context to control volume (for fades)
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const gain = ctx.createGain()
      gain.gain.value = 0 // start muted, fade in later

      const node = ctx.createMediaElementSource(audio)
      node.connect(gain).connect(ctx.destination)

      this.audio = audio
      this.context = ctx
      this.gainNode = gain
      this.source = node
    } catch (err) {
      // Fallback: no Web Audio API (older browser), just keep HTMLAudioElement
      this.audio = audio
    }
  }

  async start(): Promise<void> {
    await this.init()
    if (!this.audio) return

    try {
      await this.audio.play()
      this.isStarted = true
    } catch (err) {
      // Autoplay blocked: ignore
      console.warn('AudioManager: playback blocked or failed', err)
    }
  }

  fadeIn(duration = 2000) {
    if (!this.gainNode) return
    this.gainNode.gain.cancelScheduledValues(0)
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.context!.currentTime)
    this.gainNode.gain.linearRampToValueAtTime(1, this.context!.currentTime + duration / 1000)
  }

  fadeOut(duration = 2000) {
    if (!this.gainNode) return
    this.gainNode.gain.cancelScheduledValues(0)
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.context!.currentTime)
    this.gainNode.gain.linearRampToValueAtTime(0, this.context!.currentTime + duration / 1000)
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
    this.isStarted = false
  }
}

export const audioManager = new SimpleAudioManager() 