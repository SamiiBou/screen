'use client'
export const dynamic = 'force-dynamic'

import React from 'react';
import HumanVerificationButton from '@/components/HumanVerificationButton';

export default function HumanVerificationDemo() {
  const handleVerificationSuccess = (data: any) => {
    console.log('🎉 Verification successful in demo:', data);
    // Ici vous pouvez ajouter la logique pour rafraîchir l'état de l'app
    // par exemple, refetch le profil utilisateur, mettre à jour le contexte, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Human Verification System</h1>
            <p className="text-gray-300 text-lg">
              Demonstrate the World ID human verification integration
            </p>
          </div>

          {/* Demo Sections */}
          <div className="space-y-12">
            
            {/* Button Variants */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Button Variants</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Small Button */}
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Small Button</h3>
                  <HumanVerificationButton
                    variant="button"
                    size="sm"
                    onVerificationSuccess={handleVerificationSuccess}
                  />
                </div>

                {/* Medium Button */}
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Medium Button</h3>
                  <HumanVerificationButton
                    variant="button"
                    size="md"
                    onVerificationSuccess={handleVerificationSuccess}
                  />
                </div>

                {/* Large Button */}
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Large Button</h3>
                  <HumanVerificationButton
                    variant="button"
                    size="lg"
                    onVerificationSuccess={handleVerificationSuccess}
                  />
                </div>
              </div>
            </section>

            {/* Banner Variant */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Banner Variant</h2>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <p className="text-gray-300 mb-4">
                  Use this variant to prominently display the verification option in the UI.
                  Perfect for dashboard headers or important announcements.
                </p>
                <HumanVerificationButton
                  variant="banner"
                  onVerificationSuccess={handleVerificationSuccess}
                />
              </div>
            </section>

            {/* Card Variant */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Card Variant</h2>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <p className="text-gray-300 mb-4">
                  Use this variant as a featured section or in a grid of options.
                  Great for onboarding flows or feature highlights.
                </p>
                <div className="max-w-sm">
                  <HumanVerificationButton
                    variant="card"
                    onVerificationSuccess={handleVerificationSuccess}
                  />
                </div>
              </div>
            </section>

            {/* Integration Examples */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Integration Examples</h2>
              
              {/* Dashboard Header Example */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Dashboard Header</h3>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-2xl font-bold">Dashboard</h1>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-300">Balance: 150 tokens</div>
                        <HumanVerificationButton
                          variant="button"
                          size="sm"
                          onVerificationSuccess={handleVerificationSuccess}
                        />
                      </div>
                    </div>
                    <HumanVerificationButton
                      variant="banner"
                      onVerificationSuccess={handleVerificationSuccess}
                    />
                  </div>
                </div>

                {/* Profile Page Example */}
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Profile Page Section</h3>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Account Security</h2>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Two-Factor Authentication</span>
                            <span className="text-green-400">✅ Enabled</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Email Verification</span>
                            <span className="text-green-400">✅ Verified</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Human Verification</span>
                            <HumanVerificationButton
                              variant="button"
                              size="sm"
                              onVerificationSuccess={handleVerificationSuccess}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <HumanVerificationButton
                          variant="card"
                          onVerificationSuccess={handleVerificationSuccess}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Benefits of Human Verification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                  <div className="text-2xl mb-3">🚀</div>
                  <h3 className="text-blue-400 font-semibold text-lg mb-2">2x Token Rewards</h3>
                  <p className="text-blue-300 text-sm">
                    Verified humans earn double tokens for all activities, maximizing their rewards.
                  </p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                  <div className="text-2xl mb-3">🏆</div>
                  <h3 className="text-purple-400 font-semibold text-lg mb-2">Human-Only Challenges</h3>
                  <p className="text-purple-300 text-sm">
                    Access exclusive challenges designed specifically for verified humans.
                  </p>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                  <div className="text-2xl mb-3">🛡️</div>
                  <h3 className="text-green-400 font-semibold text-lg mb-2">Bot Protection</h3>
                  <p className="text-green-300 text-sm">
                    Help maintain a fair and authentic gaming environment.
                  </p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                  <div className="text-2xl mb-3">🌟</div>
                  <h3 className="text-yellow-400 font-semibold text-lg mb-2">Premium Features</h3>
                  <p className="text-yellow-300 text-sm">
                    Unlock additional features and privileges reserved for verified users.
                  </p>
                </div>
              </div>
            </section>

            {/* Technical Details */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Technical Implementation</h2>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400 font-mono text-sm">1.</div>
                    <div>
                      <h4 className="font-medium mb-1">World ID Integration</h4>
                      <p className="text-gray-300 text-sm">
                        Uses Worldcoin&apos;s MiniKit to verify human identity through orb verification.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400 font-mono text-sm">2.</div>
                    <div>
                      <h4 className="font-medium mb-1">Backend Verification</h4>
                      <p className="text-gray-300 text-sm">
                        Proof is verified on the server to ensure security and prevent manipulation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400 font-mono text-sm">3.</div>
                    <div>
                      <h4 className="font-medium mb-1">Database Storage</h4>
                      <p className="text-gray-300 text-sm">
                        Verification status and multipliers are stored securely in the user database.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400 font-mono text-sm">4.</div>
                    <div>
                      <h4 className="font-medium mb-1">Real-time Updates</h4>
                      <p className="text-gray-300 text-sm">
                        UI automatically updates to reflect verification status and benefits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 