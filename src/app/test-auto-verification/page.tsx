'use client'

import React from 'react';
import { useHumanVerification } from '@/components/HumanVerificationProvider';
import HumanVerificationButton from '@/components/HumanVerificationButton';

export default function TestAutoVerificationPage() {
  const { isVerified, verificationData, showModal, refreshStatus } = useHumanVerification();

  const handleForceModal = () => {
    showModal();
  };

  const handleRefreshStatus = async () => {
    await refreshStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Automatic Verification Test</h1>
            <p className="text-gray-300 text-lg">
              Demonstration of the automatic human verification system
            </p>
          </div>

          {/* Status Dashboard */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Verification status:</span>
                  <span className={isVerified ? 'text-green-400' : 'text-red-400'}>
                    {isVerified ? '✅ Verified' : '❌ Not verified'}
                  </span>
                </div>
                
                {isVerified && verificationData && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Token multiplier:</span>
                      <span className="text-blue-400">
                        {verificationData.tokenMultiplier}x
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Human challenges:</span>
                      <span className="text-green-400">
                        {verificationData.benefits?.humanOnlyChallenges ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </div>
                    
                    {verificationData.humanVerifiedAt && (
                      <div className="flex items-center justify-between">
                        <span>Verified on:</span>
                        <span className="text-gray-300 text-sm">
                          {new Date(verificationData.humanVerifiedAt).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleForceModal}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Force modal display
                </button>
                
                <button
                  onClick={handleRefreshStatus}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Refresh status
                </button>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">How it works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">1.</div>
                <div>
                  <h4 className="font-medium mb-1">Automatic detection</h4>
                  <p className="text-gray-300 text-sm">
                    The system automatically detects if the user is logged in and verifies their human verification status.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">2.</div>
                <div>
                  <h4 className="font-medium mb-1">Smart delay</h4>
                  <p className="text-gray-300 text-sm">
                    If the user is not verified, the modal appears after a 2-second delay to avoid being intrusive.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">3.</div>
                <div>
                  <h4 className="font-medium mb-1">Once per session</h4>
                  <p className="text-gray-300 text-sm">
                    The modal only appears once per session to avoid harassing the user.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">4.</div>
                <div>
                  <h4 className="font-medium mb-1">Smart reactivation</h4>
                  <p className="text-gray-300 text-sm">
                    If the user logs out and then logs back in, the system reactivates for new users.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Section */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Component Testing</h2>
            <p className="text-gray-300 mb-6">
              These components now automatically use the global context:
            </p>
            
            <div className="space-y-6">
              {/* Banner */}
              <div>
                <h3 className="text-lg font-medium mb-3">Banner with global context</h3>
                <HumanVerificationButton
                  variant="banner"
                  onVerificationSuccess={(data) => {
                    console.log('Verification success from banner:', data);
                  }}
                />
              </div>
              
              {/* Card */}
              <div>
                <h3 className="text-lg font-medium mb-3">Card with global context</h3>
                <div className="max-w-sm">
                  <HumanVerificationButton
                    variant="card"
                    onVerificationSuccess={(data) => {
                      console.log('Verification success from card:', data);
                    }}
                  />
                </div>
              </div>
              
              {/* Buttons */}
              <div>
                <h3 className="text-lg font-medium mb-3">Buttons with global context</h3>
                <div className="flex gap-4">
                  <HumanVerificationButton
                    variant="button"
                    size="sm"
                    onVerificationSuccess={(data) => {
                      console.log('Verification success from small button:', data);
                    }}
                  />
                  <HumanVerificationButton
                    variant="button"
                    size="md"
                    onVerificationSuccess={(data) => {
                      console.log('Verification success from medium button:', data);
                    }}
                  />
                  <HumanVerificationButton
                    variant="button"
                    size="lg"
                    onVerificationSuccess={(data) => {
                      console.log('Verification success from large button:', data);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
            <p className="text-gray-300 mb-4">
              The provider is configured in the main layout with these parameters:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-400">// src/app/layout.tsx</div>
              <div className="text-blue-300">&lt;HumanVerificationProvider</div>
              <div className="text-green-300 ml-4">autoShowModal={`{true}`}</div>
              <div className="text-green-300 ml-4">delayMs={`{2000}`}</div>
              <div className="text-blue-300">&gt;</div>
              <div className="text-gray-300 ml-4">{`{children}`}</div>
              <div className="text-blue-300">&lt;/HumanVerificationProvider&gt;</div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <div><strong>autoShowModal:</strong> Automatically display modal for non-verified users</div>
              <div><strong>delayMs:</strong> 2-second delay before displaying modal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 