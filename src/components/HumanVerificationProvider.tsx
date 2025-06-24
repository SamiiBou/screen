'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '@/utils/api';
import HumanVerificationModal from './HumanVerificationModal';

interface HumanVerificationContextType {
  isVerified: boolean;
  verificationData: any;
  showModal: () => void;
  hideModal: () => void;
  refreshStatus: () => Promise<void>;
}

const HumanVerificationContext = createContext<HumanVerificationContextType | null>(null);

export const useHumanVerification = () => {
  const context = useContext(HumanVerificationContext);
  if (!context) {
    throw new Error('useHumanVerification must be used within HumanVerificationProvider');
  }
  return context;
};

interface HumanVerificationProviderProps {
  children: React.ReactNode;
  autoShowModal?: boolean; // Si true, affiche automatiquement le modal pour les non-vérifiés
  showOnLogin?: boolean;   // Si true, vérifie seulement après login
  delayMs?: number;        // Délai avant d'afficher le modal (en millisecondes)
}

export const HumanVerificationProvider: React.FC<HumanVerificationProviderProps> = ({
  children,
  autoShowModal = true,
  showOnLogin = true,
  delayMs = 2000, // 2 secondes par défaut
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasShownModal, setHasShownModal] = useState(false); // Éviter de montrer le modal plusieurs fois
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier le statut de vérification
  const checkVerificationStatus = useCallback(async () => {
    try {
      // Vérifier d'abord si l'utilisateur est connecté
      if (!apiService.isAuthenticated()) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      
      const response = await apiService.getHumanVerificationStatus();
      if (response.status === 'success') {
        setIsVerified(response.data.humanVerified);
        setVerificationData(response.data);
        
        // Si l'utilisateur n'est pas vérifié et qu'on doit afficher le modal automatiquement
        if (!response.data.humanVerified && autoShowModal && !hasShownModal) {
          // Délai avant d'afficher le modal pour ne pas être trop agressif
          setTimeout(() => {
            if (!hasShownModal) { // Double vérification
              setIsModalOpen(true);
              setHasShownModal(true);
            }
          }, delayMs);
        }
      }
    } catch (error) {
      console.error('❌ Failed to check human verification status:', error);
      // Si erreur d'auth, l'utilisateur n'est probablement pas connecté
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [autoShowModal, hasShownModal]);

  // Rafraîchir le statut
  const refreshStatus = async () => {
    await checkVerificationStatus();
  };

  // Contrôles manuels du modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  const hideModal = () => {
    setIsModalOpen(false);
  };

  // Gérer le succès de la vérification
  const handleVerificationSuccess = (data: any) => {
    console.log('🎉 Human verification successful:', data);
    setIsVerified(true);
    setVerificationData(data);
    setIsModalOpen(false);
    setHasShownModal(true); // Marquer comme affiché pour éviter de le remontrer
  };

  // Effet pour vérifier le statut au montage et quand l'auth change
  useEffect(() => {
    // Vérifier immédiatement
    checkVerificationStatus();

    // Optionnel: Écouter les changements d'authentication
    const interval = setInterval(() => {
      const currentlyAuthenticated = apiService.isAuthenticated();
      if (currentlyAuthenticated !== isAuthenticated) {
        if (currentlyAuthenticated) {
          // L'utilisateur vient de se connecter
          setHasShownModal(false); // Reset pour permettre d'afficher le modal
          checkVerificationStatus();
        } else {
          // L'utilisateur s'est déconnecté
          setIsAuthenticated(false);
          setIsVerified(false);
          setVerificationData(null);
          setIsModalOpen(false);
          setHasShownModal(false);
        }
      }
    }, 2000); // Vérifier toutes les 2 secondes

    return () => clearInterval(interval);
  }, [isAuthenticated, checkVerificationStatus]);

  // Réinitialiser hasShownModal si l'utilisateur devient non-vérifié
  useEffect(() => {
    if (!isVerified) {
      setHasShownModal(false);
    }
  }, [isVerified]);

  const contextValue: HumanVerificationContextType = {
    isVerified,
    verificationData,
    showModal,
    hideModal,
    refreshStatus,
  };

  return (
    <HumanVerificationContext.Provider value={contextValue}>
      {children}
      
      {/* Modal automatique */}
      <HumanVerificationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Ne pas remettre hasShownModal à false ici pour éviter de harceler l'utilisateur
        }}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </HumanVerificationContext.Provider>
  );
};

export default HumanVerificationProvider; 