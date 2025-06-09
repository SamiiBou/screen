/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'apple-blue': '#007aff',
        'apple-blue-dark': '#0056cc',
        'apple-gray': '#f2f2f7',
        'apple-gray-2': '#e5e5ea',
        'apple-gray-3': '#d1d1d6',
        'apple-gray-4': '#c7c7cc',
        'apple-gray-5': '#aeaeb2',
        'apple-gray-6': '#8e8e93',
        'apple-text-primary': '#1d1d1f',
        'apple-text-secondary': '#86868b',
      },
      animation: {
        'move': 'move 5s linear infinite',
        'apple-pulse': 'apple-pulse 2s infinite ease-in-out',
        'target-pulse': 'target-pulse 2s infinite ease-in-out',
        'eliminated-bounce': 'eliminated-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        move: {
          '0%': { transform: 'translateX(-200px)' },
          '100%': { transform: 'translateX(200px)' },
        },
        'apple-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 20px 60px rgba(0, 0, 0, 0.15)',
          },
          '50%': { 
            transform: 'scale(1.1)',
            boxShadow: '0 0 60px rgba(255, 215, 0, 1), 0 20px 60px rgba(0, 0, 0, 0.15)',
          },
        },
        'target-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.8',
            boxShadow: '0 0 20px rgba(0, 188, 212, 0.5)',
          },
          '50%': { 
            transform: 'scale(1.2)',
            opacity: '0.4',
            boxShadow: '0 0 40px rgba(0, 188, 212, 0.8)',
          },
        },
        'eliminated-bounce': {
          '0%': {
            transform: 'translate(-50%, -50%) scale(0) rotate(-10deg)',
            opacity: '0',
          },
          '70%': {
            transform: 'translate(-50%, -50%) scale(1.1) rotate(2deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'apple-small': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'apple-medium': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'apple-large': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'apple-xl': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}