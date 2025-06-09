'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const localStorageData = typeof window !== 'undefined' ? {
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
    walletAddress: localStorage.getItem('walletAddress'),
    username: localStorage.getItem('username'),
    isAuthenticated: localStorage.getItem('isAuthenticated')
  } : {}

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Test Page</h1>
        
        {/* Current Auth State */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded ${isAuthenticated ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="font-medium">Authenticated</div>
              <div>{isAuthenticated ? '✅ Yes' : '❌ No'}</div>
            </div>
            <div className={`p-4 rounded ${isLoading ? 'bg-yellow-900' : 'bg-green-900'}`}>
              <div className="font-medium">Loading</div>
              <div>{isLoading ? '⏳ Loading' : '✅ Ready'}</div>
            </div>
            <div className={`p-4 rounded ${user ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="font-medium">User Object</div>
              <div>{user ? '✅ Present' : '❌ Missing'}</div>
            </div>
          </div>
        </div>

        {/* User Details */}
        {user && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Display Name:</strong> {user.displayName || 'N/A'}</p>
              <p><strong>Wallet Address:</strong> {user.walletAddress}</p>
              <p><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
              <p><strong>Auth Method:</strong> {user.authMethod}</p>
              <p><strong>Best Time:</strong> {user.bestTime}</p>
              <p><strong>Total Challenges:</strong> {user.totalChallengesPlayed}</p>
            </div>
          </div>
        )}

        {/* localStorage Data */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">localStorage Data</h2>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium mr-4"
          >
            🔄 Reload Page
          </button>
          
          {isAuthenticated && (
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium mr-4"
            >
              🚪 Logout
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium mr-4"
          >
            🏠 Go Home
          </button>

          <button
            onClick={() => window.location.href = '/mode-selection'}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium"
          >
            🎮 Go to Mode Selection
          </button>
        </div>
      </div>
    </div>
  )
} 