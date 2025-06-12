import React, { useState } from 'react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { apiService } from '@/utils/api';
import Image from 'next/image';

interface HumanVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess?: (data: any) => void;
}

const HumanVerificationModal: React.FC<HumanVerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onVerificationSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'intro' | 'verifying' | 'success'>('intro');

  const handleVerifyHuman = async () => {
    if (!MiniKit.isInstalled()) {
      setError('World App not detected. Please open this app in World App.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('verifying');

    try {
      // Configuration de la vérification World ID
      const verifyPayload = {
        action: 'verifyhuman', // Votre action ID du Developer Portal
        signal: undefined, // Optionnel
        verification_level: VerificationLevel.Orb, // Orb pour la vérification humaine
      };

      console.log('🔍 Starting World ID verification with payload:', verifyPayload);

      // Lancer la vérification World ID via MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === 'error') {
        throw new Error((finalPayload as any).message || 'World ID verification failed');
      }

      console.log('✅ World ID verification successful:', finalPayload);

      // Première étape : vérifier la preuve avec notre backend
      const verifyResponse = await apiService.verifyWorldID({
        proof: finalPayload.proof,
        merkle_root: finalPayload.merkle_root,
        nullifier_hash: finalPayload.nullifier_hash,
        verification_level: finalPayload.verification_level,
        action: 'verifyhuman',
        app_id: 'app_a0673c3ab430fecb1b2ff723784c7720', // Votre App ID
      });

      if (verifyResponse.status !== 'success') {
        throw new Error(verifyResponse.message || 'Backend verification failed');
      }

      // Deuxième étape : mettre à jour le profil utilisateur
      const updateResponse = await apiService.updateHumanVerification({
        nullifier_hash: finalPayload.nullifier_hash,
        verification_level: finalPayload.verification_level,
      });

      if (updateResponse.status !== 'success') {
        throw new Error(updateResponse.message || 'Failed to update user profile');
      }

      console.log('🎉 Human verification completed:', updateResponse.data);

      setStep('success');
      
      // Notifier le parent de la réussite avec les données du bonus
      setTimeout(() => {
        onVerificationSuccess?.(updateResponse.data);
        onClose();
      }, 3000);

    } catch (err: any) {
      console.error('❌ Human verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      setStep('intro');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="human-verification-overlay">
      <div className="human-verification-modal">
        {step === 'intro' && (
          <>
            <div className="modal-header">
              <button className="close-btn" onClick={onClose} disabled={isLoading}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="verification-card">
                {/* Logo HODL central */}
                <div className="logo-container">
                  <div className="logo-background">
                    <Image 
                      src="/HODL_LOGO.png" 
                      alt="HODL" 
                      width={80} 
                      height={80}
                      className="hodl-logo"
                      priority
                    />
                  </div>
                </div>

                {/* Texte principal */}
                <div className="verification-text">
                  <h2 className="main-title">Verify Your Humanity</h2>
                  <p className="subtitle">Unlock exclusive features and enhanced rewards</p>
                </div>

                {/* Avantages minimalistes */}
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <span className="benefit-text">2x Token Multiplier</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-text">Exclusive Challenges</span>
                  </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="error-message">
                    <span className="error-text">{error}</span>
                  </div>
                )}

                {/* Bouton principal */}
                <button 
                  className="verify-button"
                  onClick={handleVerifyHuman}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="button-spinner"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Continue with World ID</span>
                  )}
                </button>

                <div className="powered-by">
                  <span>Secured by</span>
                  <strong>World ID</strong>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'verifying' && (
          <div className="modal-content verifying">
            <div className="verification-progress">
              <div className="logo-container">
                <div className="logo-background verifying-state">
                  <Image 
                    src="/HODL_LOGO.png" 
                    alt="HODL" 
                    width={60} 
                    height={60}
                    className="hodl-logo"
                  />
                  <div className="verification-spinner"></div>
                </div>
              </div>
              <h3 className="verifying-title">Verifying Your Identity</h3>
              <p className="verifying-subtitle">Please complete the verification in your World App</p>
              <div className="verification-steps">
                <div className="step active">
                  <div className="step-dot"></div>
                  <span>World App Opened</span>
                </div>
                <div className="step">
                  <div className="step-dot"></div>
                  <span>Verification Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="modal-content success">
            <div className="success-container">
              <div className="logo-container">
                <div className="logo-background success-state">
                  <Image 
                    src="/HODL_LOGO.png" 
                    alt="HODL" 
                    width={80} 
                    height={80}
                    className="hodl-logo"
                  />
                  <div className="success-checkmark">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="16" fill="#00C851"/>
                      <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="success-content">
                <h3 className="success-title">Verification Complete!</h3>
                <p className="success-subtitle">Your humanity has been verified and exclusive features are now unlocked</p>
                
                <div className="success-benefits">
                  <div className="success-benefit">
                    <div className="success-benefit-content">
                      <h4>2x Token Multiplier</h4>
                      <p>Activated and ready to use</p>
                    </div>
                  </div>
                  <div className="success-benefit">
                    <div className="success-benefit-content">
                      <h4>Exclusive Challenges</h4>
                      <p>Human-only competitions unlocked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HumanVerificationModal; 