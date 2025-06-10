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
  return (
    <motion.button
      onClick={onClick}
      className={className}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.15 }
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AceternityButton; 