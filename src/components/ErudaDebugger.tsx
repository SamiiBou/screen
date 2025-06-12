'use client'

import { useEffect } from 'react'

export default function ErudaDebugger() {
  useEffect(() => {
    // Activer Eruda TOUJOURS (suppression des conditions restrictives)
    const isDev = process.env.NODE_ENV === 'development'
    const hasDebugParam = typeof window !== 'undefined' && 
      new URLSearchParams(window.location.search).get('debug') === '1'

    // Détection World App / WebView mobile
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
    const isWorldApp = /WorldApp|World\s*Coin|MiniKit/i.test(ua)
    const isMobileWebView = /Android|iPhone|iPad|iPod/i.test(ua) && /wv|WebView/i.test(ua)

    // Charger Eruda TOUJOURS (plus de conditions)
    const script = document.createElement('script')
    script.src = '//cdn.jsdelivr.net/npm/eruda'
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).eruda) {
        (window as any).eruda.init()
        console.log('🔧 Eruda debugging tool initialized')
        console.log('📱 Pour ouvrir la console: Tapez sur le petit bouton en bas à droite')
        console.log('🌍 Environment:', isDev ? 'Development' : 'Production')
        console.log('🔧 World App detected:', isWorldApp)
        console.log('📱 Mobile WebView detected:', isMobileWebView)
      }
    }
    document.head.appendChild(script)
  }, [])

  return null
}