'use client'

import React, { ReactNode } from 'react'

interface FullHeightContainerProps {
  children: ReactNode
  className?: string
}

export const FullHeightContainer: React.FC<FullHeightContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`min-h-screen w-full flex flex-col ${className}`}
      style={{
        minHeight: '100dvh', // Utilise dynamic viewport height si supporté, sinon fallback à 100vh
      }}
    >
      {children}
    </div>
  )
}

export default FullHeightContainer 