import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AceternityButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export const AceternityButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  ...props 
}: AceternityButtonProps) => {
  const baseStyles = {
    border: 'none !important',
    borderRadius: '12px !important',
    fontWeight: '500 !important',
    fontSize: '1rem !important',
    padding: '14px 28px !important',
    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important',
    cursor: 'pointer !important',
    fontFamily: 'inherit !important',
    display: 'inline-flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
    gap: '8px !important',
    textDecoration: 'none !important'
  };

  const primaryStyles = {
    ...baseStyles,
    background: 'var(--apple-blue) !important',
    color: 'white !important',
    boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3) !important'
  };

  const secondaryStyles = {
    ...baseStyles,
    background: 'var(--surface-secondary) !important',
    color: 'var(--text-primary) !important',
    border: '1px solid var(--border-color) !important',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04) !important'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`apple-button ${className}`}
      style={variant === 'primary' ? primaryStyles : secondaryStyles}
      whileHover={{ 
        scale: 1.02, 
        y: -1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10" style={{ color: 'inherit !important' }}>
        {children}
      </span>
    </motion.button>
  );
};

export default AceternityButton; 