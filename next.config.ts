import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['react-icons']
  }
}

export default nextConfig