'use client'

import { useEffect } from 'react'

export default function ErudaDebugger() {
  useEffect(() => {
    // Activer Eruda si on est en développement OU si le paramètre debug=1 est présent
    const isDev = process.env.NODE_ENV === 'development'
    const hasDebugParam = typeof window !== 'undefined' && 
      new URLSearchParams(window.location.search).get('debug') === '1'

    if (isDev || hasDebugParam) {
      // Charger Eruda dynamiquement
      const script = document.createElement('script')
      script.src = '//cdn.jsdelivr.net/npm/eruda'
      script.onload = () => {
        if (typeof window !== 'undefined' && (window as any).eruda) {
          (window as any).eruda.init()
          console.log('🔧 Eruda debugging tool initialized')
          console.log('📱 Pour ouvrir la console: Tapez sur le petit bouton en bas à droite')
        }
      }
      document.head.appendChild(script)
    }
  }, [])

  return null
}