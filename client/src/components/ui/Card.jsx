import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, onClick, ...props }) => {
  return (
    <motion.div
      className={`glass-card p-6 ${hover ? 'hover:translate-y-[-2px]' : ''} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;