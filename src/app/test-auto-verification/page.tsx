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
            <h1 className="text-4xl font-bold mb-4">Test Vérification Automatique</h1>
            <p className="text-gray-300 text-lg">
              Démonstration du système de vérification humaine automatique
            </p>
          </div>

          {/* Status Dashboard */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Statut Actuel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Statut de vérification:</span>
                  <span className={isVerified ? 'text-green-400' : 'text-red-400'}>
                    {isVerified ? '✅ Vérifié' : '❌ Non vérifié'}
                  </span>
                </div>
                
                {isVerified && verificationData && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Multiplicateur de tokens:</span>
                      <span className="text-blue-400">
                        {verificationData.tokenMultiplier}x
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Challenges humains:</span>
                      <span className="text-green-400">
                        {verificationData.benefits?.humanOnlyChallenges ? '✅ Activé' : '❌ Désactivé'}
                      </span>
                    </div>
                    
                    {verificationData.humanVerifiedAt && (
                      <div className="flex items-center justify-between">
                        <span>Vérifié le:</span>
                        <span className="text-gray-300 text-sm">
                          {new Date(verificationData.humanVerifiedAt).toLocaleDateString('fr-FR')}
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
                  Forcer l'affichage du modal
                </button>
                
                <button
                  onClick={handleRefreshStatus}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Rafraîchir le statut
                </button>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Comment ça fonctionne</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">1.</div>
                <div>
                  <h4 className="font-medium mb-1">Détection automatique</h4>
                  <p className="text-gray-300 text-sm">
                    Le système détecte automatiquement si l'utilisateur est connecté et vérifie son statut de vérification humaine.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">2.</div>
                <div>
                  <h4 className="font-medium mb-1">Délai intelligent</h4>
                  <p className="text-gray-300 text-sm">
                    Si l'utilisateur n'est pas vérifié, le modal s'affiche après un délai de 2 secondes pour ne pas être intrusif.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">3.</div>
                <div>
                  <h4 className="font-medium mb-1">Une seule fois par session</h4>
                  <p className="text-gray-300 text-sm">
                    Le modal ne s'affiche qu'une seule fois par session pour ne pas harceler l'utilisateur.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono text-sm">4.</div>
                <div>
                  <h4 className="font-medium mb-1">Réactivation intelligente</h4>
                  <p className="text-gray-300 text-sm">
                    Si l'utilisateur se déconnecte puis se reconnecte, le système se réactive pour les nouveaux utilisateurs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Section */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Test des Composants</h2>
            <p className="text-gray-300 mb-6">
              Ces composants utilisent maintenant le contexte global automatiquement :
            </p>
            
            <div className="space-y-6">
              {/* Banner */}
              <div>
                <h3 className="text-lg font-medium mb-3">Bannière avec contexte global</h3>
                <HumanVerificationButton
                  variant="banner"
                  onVerificationSuccess={(data) => {
                    console.log('Verification success from banner:', data);
                  }}
                />
              </div>
              
              {/* Card */}
              <div>
                <h3 className="text-lg font-medium mb-3">Carte avec contexte global</h3>
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
                <h3 className="text-lg font-medium mb-3">Boutons avec contexte global</h3>
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
              Le provider est configuré dans le layout principal avec ces paramètres :
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
              <div><strong>autoShowModal:</strong> Affiche automatiquement le modal pour les non-vérifiés</div>
              <div><strong>delayMs:</strong> Délai de 2 secondes avant d'afficher le modal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 