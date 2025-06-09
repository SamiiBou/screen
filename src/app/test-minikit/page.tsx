'use client'

import { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function TestMiniKitPage() {
  const [debug, setDebug] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    runTests()
  }, [])

  const runTests = () => {
    const tests = []
    
    // Test 1: Basic MiniKit availability
    tests.push({
      name: 'MiniKit Object Available',
      status: !!MiniKit ? 'PASS' : 'FAIL',
      details: !!MiniKit ? 'MiniKit object is available' : 'MiniKit object is undefined'
    })

    // Test 2: MiniKit Installation
    tests.push({
      name: 'MiniKit.isInstalled()',
      status: MiniKit?.isInstalled() ? 'PASS' : 'FAIL',
      details: MiniKit?.isInstalled() ? 'MiniKit is installed' : 'MiniKit is not installed - must run in World App'
    })

    // Test 3: User Agent Check
    const inWorldApp = /WorldApp/i.test(navigator.userAgent)
    tests.push({
      name: 'Running in World App',
      status: inWorldApp ? 'PASS' : 'FAIL',
      details: inWorldApp ? 'User agent indicates World App' : 'User agent does not indicate World App'
    })

    // Test 4: Global Objects
    const globalWorldObjects = Object.keys(window).filter(key => 
      key.toLowerCase().includes('world') || 
      key.toLowerCase().includes('minikit')
    )
    tests.push({
      name: 'Global World Objects',
      status: globalWorldObjects.length > 0 ? 'PASS' : 'FAIL',
      details: `Found: ${globalWorldObjects.join(', ') || 'None'}`
    })

    // Test 5: MiniKit Methods
    const miniKitMethods = MiniKit ? Object.getOwnPropertyNames(MiniKit) : []
    tests.push({
      name: 'MiniKit Methods Available',
      status: miniKitMethods.length > 0 ? 'PASS' : 'FAIL',
      details: `Available methods: ${miniKitMethods.slice(0, 5).join(', ')}${miniKitMethods.length > 5 ? '...' : ''}`
    })

    setTestResults(tests)

    // Debug info
    const debugInfo = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      miniKitInstalled: MiniKit?.isInstalled(),
      globalObjects: globalWorldObjects,
      miniKitMethods: miniKitMethods,
      worldApp: !!(window as any).WorldApp,
      minikit: !!(window as any).minikit,
      timestamp: new Date().toISOString()
    }

    setDebug(debugInfo)
    console.log('🔍 Test Results:', tests)
    console.log('🔍 Debug Info:', debugInfo)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">MiniKit Test Page</h1>
        
        {/* Quick Status */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded ${MiniKit ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="font-medium">MiniKit Object</div>
              <div>{MiniKit ? '✅ Available' : '❌ Missing'}</div>
            </div>
            <div className={`p-4 rounded ${MiniKit?.isInstalled() ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="font-medium">MiniKit Installed</div>
              <div>{MiniKit?.isInstalled() ? '✅ Installed' : '❌ Not Installed'}</div>
            </div>
            <div className={`p-4 rounded ${/WorldApp/i.test(navigator.userAgent) ? 'bg-green-900' : 'bg-yellow-900'}`}>
              <div className="font-medium">World App</div>
              <div>{/WorldApp/i.test(navigator.userAgent) ? '✅ Detected' : '⚠️ Not Detected'}</div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-3">
            {testResults.map((test, index) => (
              <div key={index} className={`p-4 rounded ${test.status === 'PASS' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{test.name}</span>
                  <span className={`px-2 py-1 rounded text-sm ${test.status === 'PASS' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {test.status}
                  </span>
                </div>
                <div className="text-sm text-gray-300 mt-1">{test.details}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-6 bg-blue-900/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>• <strong>To test MiniKit properly:</strong> Open this app inside the World App</p>
            <p>• <strong>In browser:</strong> MiniKit features will be limited but the page should load</p>
            <p>• <strong>Expected behavior:</strong> "MiniKit Installed" should show ✅ when running in World App</p>
          </div>
        </div>

        {/* Debug Info */}
        {debug && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={runTests}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            🔄 Run Tests Again
          </button>
          
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium ml-4"
          >
            🔑 Go to Auth Page
          </button>
        </div>
      </div>
    </div>
  )
} 