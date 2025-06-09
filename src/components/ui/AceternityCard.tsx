import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface AceternityCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children: ReactNode;
  onClick?: () => void;
}

export const AceternityCard = ({ children, onClick, className = '', ...props }: AceternityCardProps) => (
  <motion.div
    onClick={onClick}
    className={`apple-card relative group cursor-pointer p-6 ${className}`}
    style={{
      background: 'var(--surface-primary) !important',
      border: '1px solid var(--border-color) !important',
      borderRadius: '16px !important',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04) !important',
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important',
      color: 'var(--text-primary) !important'
    }}
    whileHover={{ 
      scale: 1.02, 
      y: -4,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="relative z-10" style={{ color: 'var(--text-primary) !important' }}>
      {children}
    </div>
  </motion.div>
);

export default AceternityCard; 