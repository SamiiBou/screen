'use client'

import React, { useState } from 'react'
import { MiniKit, verifySiweMessage } from '@worldcoin/minikit-js'
import { apiService } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'

interface WalletAuthProps {
  onAuthSuccess?: (userData: any) => void
  onAuthError?: (error: any) => void
}

const WalletAuth: React.FC<WalletAuthProps> = ({ onAuthSuccess, onAuthError }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  // Use the authentication context
  const { user, logout } = useAuth()

  // Function to retrieve MiniKit user information
  const getMiniKitUserData = async (walletAddress: string) => {
    console.log('🔍 Retrieving MiniKit user data...')
    
    try {
      // Fallback to manual methods if hook doesn't provide data
      let minikitUser, userInfo, verified
      
      try {
        minikitUser = await (MiniKit as any).getUserByAddress(walletAddress)
        console.log('👤 MiniKit user data retrieved:', minikitUser)
      } catch (e) {
        console.log('⚠️ getUserByAddress not available or failed')
      }

      try {
        userInfo = await (MiniKit as any).getUserInfo(walletAddress)
        console.log('👤 users info are :', userInfo)
      } catch (e) {
        console.log('⚠️ getUserInfo not available or failed')
      }

      try {
        const { getIsUserVerified } = await import('@worldcoin/minikit-js')
        verified = await getIsUserVerified(walletAddress)
        console.log('👤 is verified :', verified)
      } catch (e) {
        console.log('⚠️ getIsUserVerified not available or failed')
        verified = false
      }

      
      if (minikitUser || userInfo) {
        // Use available data in priority order
        const sourceData = userInfo || minikitUser
        
        const userData = {
          username: sourceData?.username || null,
          userId: sourceData?.id || sourceData?.userId || null,
          profilePicture: sourceData?.profilePictureUrl || sourceData?.profilePicture || sourceData?.avatar || null,
          verificationLevel: verified ? 'orb' : 'unverified', // Use retrieved verification
          nullifierHash: sourceData?.nullifierHash || null,
          // Add other fields if available
          displayName: sourceData?.displayName || sourceData?.username || null,
          bio: sourceData?.bio || null,
          isVerified: verified || false, // Use retrieved verification
          walletAddress: walletAddress,
        }
        
        console.log('📋 Formatted user data:', userData)
        
        // Log information retrieved on frontend side
        console.log('📊 USER INFORMATION RETRIEVED (FRONTEND):')
        console.log('- Username:', userData.username)
        console.log('- User ID:', userData.userId)
        console.log('- Profile Picture:', userData.profilePicture)
        console.log('- Verification Level:', userData.verificationLevel)
        console.log('- Display Name:', userData.displayName)
        console.log('- Bio:', userData.bio)
        console.log('- Is Verified:', userData.isVerified)
        console.log('- Nullifier Hash:', userData.nullifierHash)
        console.log('- Wallet Address:', userData.walletAddress)
        
        return userData
      } else {
        console.log('⚠️ No MiniKit user data found')
        return null
      }
    } catch (error) {
      console.error('❌ Error retrieving MiniKit data:', error)
      return null
    }
  }

  // Enhanced debug function
  const showDebugInfo = () => {
    const debug = {
      // MiniKit info
      miniKitInstalled: MiniKit.isInstalled(),
      windowMiniKit: !!(window as any).MiniKit,
      miniKitObject: MiniKit,
      
      // Check if we're in World App
      inWorldApp: /WorldApp/i.test(navigator.userAgent),
      userAgent: navigator.userAgent,
      
      // Environment info
      nodeEnv: process.env.NODE_ENV,
      
      // Browser info
      isWebView: /wv|WebView/i.test(navigator.userAgent),
      isMobile: /Mobi|Android|iPhone/i.test(navigator.userAgent),
      windowWidth: window.innerWidth,
      currentUrl: window.location.href,
      
      // Global World App info
      worldApp: !!(window as any).WorldApp,
      minikit: !!(window as any).minikit,
      worldcoin: !!(window as any).worldcoin,
      
      // Check all global objects
      globalObjects: Object.keys(window).filter(key => 
        key.toLowerCase().includes('world') || 
        key.toLowerCase().includes('minikit') ||
        key.toLowerCase().includes('wallet')
      ),
      
      // MiniKit specific checks
      miniKitMethods: MiniKit ? Object.getOwnPropertyNames(MiniKit) : 'MiniKit undefined',
      
      // Provider info
      hasMiniKitProvider: !!(window as any).MiniKitProvider,
      
      timestamp: new Date().toISOString()
    }
    
    setDebugInfo(debug)
    console.log('🔍 Complete debug info:', debug)
    
    // Show specific recommendations
    if (!debug.miniKitInstalled) {
      console.log('❌ MiniKit is not installed')
      if (!debug.inWorldApp) {
        console.log('💡 SOLUTION: Open this app inside World App to use MiniKit features')
      } else {
        console.log('💡 SOLUTION: MiniKit should be available but isn\'t detected. Check World App version.')
      }
    } else {
      console.log('✅ MiniKit is properly installed and detected')
    }
  }

  const signInWithWallet = async () => {
    console.log('🔍 Checking MiniKit...')
    console.log('MiniKit.isInstalled():', MiniKit.isInstalled())
    
    if (!MiniKit.isInstalled()) {
      console.log('❌ MiniKit not installed')
      showDebugInfo() // Automatically show debug info
      setError('World App not detected. Check debug info below.')
      return
    }

    console.log('✅ MiniKit detected, starting authentication')
    setIsLoading(true)
    setError(null)

    try {
      // 1. Get a nonce from backend
      console.log('📡 Retrieving nonce...')
      
      const nonceResponse = await apiService.getNonce()
      console.log('✅ Nonce received:', nonceResponse.nonce)

      // 2. Trigger wallet authentication with MiniKit
      console.log('🔑 Launching MiniKit authentication...')
      
      const authParams = {
        nonce: nonceResponse.nonce,
        requestId: crypto.randomUUID(),
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: 'Sign in to Button Game with your Ethereum wallet',
      }
      
      console.log('🔑 Authentication parameters:', authParams)
      
      const authResult = await MiniKit.commandsAsync.walletAuth(authParams)
      
      console.log('📝 Raw authentication result:', authResult)
      
      // Extract final payload
      const finalPayload = authResult.finalPayload || authResult.commandPayload || authResult
      console.log('📝 Extracted final payload:', finalPayload)

      if (finalPayload.status === 'error') {
        throw new Error((finalPayload as any).message || (finalPayload as any).error || 'MiniKit authentication failed')
      }

      // Check that we have the necessary data
      if (!finalPayload.signature || !finalPayload.address) {
        console.error('❌ Missing data in payload:', finalPayload)
        throw new Error('Incomplete authentication data')
      }

      // 3. Retrieve MiniKit user information
      console.log('👤 Retrieving MiniKit user information...')
      const minikitUserData = await getMiniKitUserData(finalPayload.address)

      // 4. Verify signature on backend with MiniKit data
      console.log('🔍 Verifying signature...')
      
      const verifyResult = await apiService.completeSiweAuth(
        finalPayload,
        nonceResponse.nonce,
        minikitUserData
      )

      console.log('✅ Verification result:', verifyResult)

      if (verifyResult.isValid) {
        const userData = {
          id: verifyResult.user.id,
          walletAddress: finalPayload.address,
          username: verifyResult.user.username,
          displayName: verifyResult.user.displayName,
          avatar: verifyResult.user.avatar,
          verified: verifyResult.user.verified,
          authMethod: verifyResult.user.authMethod,
          minikitProfile: verifyResult.user.minikitProfile,
          signature: finalPayload.signature
        }
        
        console.log('🎉 Authentication successful:', userData)
        console.log('🔑 JWT token received:', verifyResult.token)
        
        // The token and user data are already stored by apiService.completeSiweAuth
        // Just call the success callback
        onAuthSuccess?.(userData)
      } else {
        throw new Error(verifyResult.message || 'Invalid signature')
      }

    } catch (err: any) {
      console.error('❌ Wallet authentication error (details):', err)
      
      let errorMessage = 'Unknown error'
      if (err.message) {
        errorMessage = err.message
      } else if (err.name) {
        errorMessage = `Error ${err.name}`
      }
      
      setError(errorMessage)
      onAuthError?.(err)
      
      // Automatically show debug info on error
      showDebugInfo()
      
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    logout()
    setDebugInfo(null)
    setError(null)
  }

  // Backend connectivity test function
  const testBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connectivity...')
      
      const healthResponse = await fetch('https://0cb30698e141.ngrok.app/api/health', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      console.log('✅ Health check status:', healthResponse.status)
      const healthData = await healthResponse.json()
      console.log('✅ Health check data:', healthData)
      
      alert('✅ Backend accessible! Check console for details.')
      
    } catch (error) {
      console.error('❌ Connectivity test failed:', error)
      alert(`❌ Backend inaccessible: ${error}`)
    }
  }

  if (user) {
    return (
      <div className="wallet-auth-success">
        <div className="user-info">
          <div className="wallet-avatar">
            {(user as any).avatar ? (
              <img src={(user as any).avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              (user as any).username ? (user as any).username[0].toUpperCase() : '👤'
            )}
          </div>
          <div className="user-details">
            <p className="username">{(user as any).displayName || (user as any).username || 'Anonymous'}</p>
            <p className="wallet-address">
              {(user as any).walletAddress.slice(0, 6)}...{(user as any).walletAddress.slice(-4)}
            </p>
            {(user as any).verified && <span className="verified-badge">✓ Verified</span>}
          </div>
        </div>
        <button onClick={signOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="wallet-auth">
      <div className="wallet-auth-content">
        {error && (
          <div className="error-message mb-4 p-4 bg-red-500/20 border border-red-400/50 text-red-100 rounded-2xl">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <button 
          onClick={signInWithWallet} 
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 relative overflow-hidden ${
            isLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl text-white'
          }`}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Connecting...
            </>
          ) : (
            'Sign in with World'
          )}
        </button>

        {/* Test Backend Button */}
        <button
          onClick={testBackendConnection}
          className="w-full mt-4 py-2 rounded-xl font-medium text-sm bg-gray-600 hover:bg-gray-500 text-white transition-all duration-300"
        >
          🔧 Test Backend Connection
        </button>

        {debugInfo && (
          <div className="debug-info mt-4 p-4 bg-gray-800/50 rounded-lg text-xs text-gray-300">
            <details>
              <summary className="cursor-pointer mb-2 font-semibold">Debug Information</summary>
              <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletAuth 