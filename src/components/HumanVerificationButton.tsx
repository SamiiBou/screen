import React, { useState, useEffect } from 'react';
import { apiService } from '@/utils/api';
import HumanVerificationModal from './HumanVerificationModal';
import { useHumanVerification } from './HumanVerificationProvider';

interface HumanVerificationButtonProps {
  onVerificationSuccess?: (data: any) => void;
  className?: string;
  variant?: 'button' | 'banner' | 'card';
  size?: 'sm' | 'md' | 'lg';
}

const HumanVerificationButton: React.FC<HumanVerificationButtonProps> = ({
  onVerificationSuccess,
  className = '',
  variant = 'button',
  size = 'md'
}) => {
  // États locaux (fallback si pas de provider)
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [localIsVerified, setLocalIsVerified] = useState(false);
  const [localVerificationData, setLocalVerificationData] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);

  // Essayer d'utiliser le contexte global
  let contextValue = null;
  try {
    contextValue = useHumanVerification();
  } catch (error) {
    // Pas de provider, utiliser les états locaux
  }

  // Utiliser le contexte s'il est disponible, sinon utiliser les états locaux
  const isVerified = contextValue?.isVerified ?? localIsVerified;
  const verificationData = contextValue?.verificationData ?? localVerificationData;
  const loading = contextValue ? false : localLoading; // Le provider gère son propre loading

  useEffect(() => {
    // Si pas de contexte, charger le statut localement
    if (!contextValue) {
      checkVerificationStatus();
    }
  }, [contextValue]);

  const checkVerificationStatus = async () => {
    if (contextValue) return; // Le provider s'en occupe
    
    try {
      const response = await apiService.getHumanVerificationStatus();
      if (response.status === 'success') {
        setLocalIsVerified(response.data.humanVerified);
        setLocalVerificationData(response.data);
      }
    } catch (error) {
      console.error('❌ Failed to check verification status:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (contextValue) {
      contextValue.showModal();
    } else {
      setLocalIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    if (contextValue) {
      contextValue.hideModal();
    } else {
      setLocalIsModalOpen(false);
    }
  };

  const handleVerificationSuccess = (data: any) => {
    console.log('🎉 Verification successful:', data);
    
    if (contextValue) {
      // Le provider gère déjà la mise à jour
      contextValue.refreshStatus();
    } else {
      setLocalIsVerified(true);
      setLocalVerificationData(data);
    }
    
    onVerificationSuccess?.(data);
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (isVerified) {
    if (variant === 'banner') {
      return (
        <div className={`bg-green-900/20 border border-green-500/30 rounded-lg p-4 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <div className="text-green-400 font-semibold">Verified Human</div>
              <div className="text-green-300 text-sm">
                Earning {verificationData?.tokenMultiplier}x tokens • Human-only challenges unlocked
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <div className={`bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-6 ${className}`}>
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-green-400 font-semibold text-lg mb-2">Verified Human</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-300">🚀</span>
                <span className="text-green-300">{verificationData?.tokenMultiplier}x Token Multiplier</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-300">🏆</span>
                <span className="text-green-300">Human-Only Challenges</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 ${className}`}>
        <span>✅</span>
        <span className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'} font-medium`}>
          Verified Human
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 cursor-pointer hover:bg-blue-900/30 transition-colors ${className}`} onClick={handleOpenModal}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <div className="text-blue-400 font-semibold">Verify Your Humanity</div>
                <div className="text-blue-300 text-sm">
                  Unlock 2x tokens and human-only challenges
                </div>
              </div>
            </div>
            <div className="text-blue-400">→</div>
          </div>
        </div>

        {/* Modal seulement si pas de provider global */}
        {!contextValue && (
          <HumanVerificationModal
            isOpen={localIsModalOpen}
            onClose={handleCloseModal}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <div className={`bg-gradient-to-br from-blue-900/30 to-purple-800/20 border border-blue-500/30 rounded-xl p-6 cursor-pointer hover:border-blue-400/50 transition-colors group ${className}`} onClick={handleOpenModal}>
          <div className="text-center">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="text-blue-400 font-semibold text-lg mb-2">Verify Your Humanity</h3>
            <p className="text-blue-300 text-sm mb-4">
              Unlock exclusive rewards and human-only challenges
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-blue-300">🚀</span>
                <span className="text-blue-300">2x Token Rewards</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-blue-300">🏆</span>
                <span className="text-blue-300">Human-Only Challenges</span>
              </div>
            </div>
            <div className="mt-4 text-blue-400 text-sm font-medium">
              Click to verify →
            </div>
          </div>
        </div>

        {/* Modal seulement si pas de provider global */}
        {!contextValue && (
          <HumanVerificationModal
            isOpen={localIsModalOpen}
            onClose={handleCloseModal}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`
          inline-flex items-center gap-2 px-4 py-2 
          bg-gradient-to-r from-blue-600 to-purple-600 
          text-white font-medium rounded-lg
          hover:from-blue-700 hover:to-purple-700
          transition-all duration-200
          ${size === 'sm' ? 'text-sm px-3 py-1.5' : size === 'lg' ? 'text-lg px-6 py-3' : 'text-base px-4 py-2'}
          ${className}
        `}
      >
        <span>🤖</span>
        <span>Verify Humanity</span>
      </button>

      {/* Modal seulement si pas de provider global */}
      {!contextValue && (
        <HumanVerificationModal
          isOpen={localIsModalOpen}
          onClose={handleCloseModal}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}
    </>
  );
};

export default HumanVerificationButton; 