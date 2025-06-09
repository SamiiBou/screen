'use client'

import { useState } from 'react'

interface ApiResult {
  status: number | string
  success: boolean
  data?: any
  error?: string
  description: string
}

interface ApiResults {
  [endpoint: string]: ApiResult
}

export default function TestApiPage() {
  const [results, setResults] = useState<ApiResults>({})
  const [loading, setLoading] = useState(false)

  const testApi = async (endpoint: string, description: string) => {
    try {
      console.log(`Testing ${endpoint}...`)
      const response = await fetch(`https://0cb30698e141.ngrok.app/api${endpoint}`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      setResults((prev: ApiResults) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          success: response.ok,
          data,
          description
        }
      }))
      
      console.log(`✅ ${endpoint}:`, data)
      
    } catch (error) {
      console.error(`❌ ${endpoint}:`, error)
      setResults((prev: ApiResults) => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          description
        }
      }))
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults({})
    
    const tests = [
      { endpoint: '/health', description: 'Backend Health Check' },
      { endpoint: '/challenges/stats', description: 'Challenge Statistics' },
      { endpoint: '/challenges/active', description: 'Active Challenges' },
      { endpoint: '/challenges', description: 'All Challenges' },
    ]

    for (const test of tests) {
      await testApi(test.endpoint, test.description)
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setLoading(false)
  }

  const initChallenges = async () => {
    try {
      const response = await fetch('https://0cb30698e141.ngrok.app/api/challenges/init-default', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      
      setResults((prev: ApiResults) => ({
        ...prev,
        '/challenges/init-default': {
          status: response.status,
          success: response.ok,
          data,
          description: 'Initialize Default Challenges'
        }
      }))
      
      if (response.ok) {
        alert(`✅ ${data.message}`)
        // Relancer les tests pour voir les nouveaux challenges
        await runAllTests()
      } else {
        alert(`❌ Error: ${data.message}`)
      }
      
    } catch (error) {
      console.error('Error initializing challenges:', error)
      alert(`❌ Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-auto" style={{
      overscrollBehavior: 'none',
      WebkitOverscrollBehavior: 'none' as any,
      touchAction: 'pan-y'
    } as React.CSSProperties}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Dashboard</h1>
        
        {/* Actions */}
        <div className="mb-8 space-x-4">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Testing...' : '🧪 Run All Tests'}
          </button>
          
          <button
            onClick={initChallenges}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium"
          >
            🚀 Initialize Challenges
          </button>
          
          <button
            onClick={() => window.location.href = '/mode-selection'}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium"
          >
            🎮 Mode Selection
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {Object.entries(results).map(([endpoint, result]: [string, ApiResult]) => (
            <div key={endpoint} className={`p-6 rounded-lg border ${
              result.success ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{result.description}</h3>
                  <p className="text-gray-400 text-sm">{endpoint}</p>
                </div>
                <div className={`px-3 py-1 rounded text-sm font-medium ${
                  result.success ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {result.status}
                </div>
              </div>
              
              <div className="mt-4">
                <details className="cursor-pointer">
                  <summary className="text-sm text-gray-300 hover:text-white">
                    {result.success ? 'View Response' : 'View Error'}
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-800 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && !loading && (
          <div className="text-center text-gray-400 py-12">
            <p>Click "Run All Tests" to start testing the API endpoints</p>
          </div>
        )}
      </div>
    </div>
  )
} 