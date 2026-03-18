// src/components/shop/PackDisplay.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PackDisplayProps {
  packId: string;
  name: string;
  price: number;
  colorClasses: string;
  emoji: string;
  isLoading: boolean;
  disabled: boolean;
  onBuy: (packId: string) => void;
}

export default function PackDisplay({ 
  packId, 
  name, 
  price, 
  colorClasses, 
  emoji,
  isLoading, 
  disabled, 
  onBuy 
}: PackDisplayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm bg-black/50 border border-gray-800 rounded-2xl p-8 flex flex-col items-center shadow-2xl"
    >
      <motion.div 
        animate={isLoading ? { 
          x: [-5, 5, -5, 5, 0], 
          y: [-2, 2, -2, 2, 0],
          scale: [1, 1.05, 1],
        } : {}}
        transition={{ repeat: isLoading ? Infinity : 0, duration: 0.4 }}
        className={`w-40 h-56 rounded-xl mb-6 border-2 flex items-center justify-center relative overflow-hidden ${colorClasses}`}
      >
        <span className="text-6xl absolute opacity-20 rotate-12">{emoji}</span>
        <span className="text-2xl font-black text-white z-10 uppercase tracking-widest text-center drop-shadow-lg leading-tight">
          {name}
        </span>
      </motion.div>
      
      <button
        onClick={() => onBuy(packId)}
        disabled={disabled || isLoading}
        className={`w-full py-4 rounded-lg font-black text-xl tracking-widest uppercase transition-all flex justify-center items-center gap-2 ${
          disabled || isLoading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105 shadow-[0_0_15px_rgba(234,179,8,0.5)] cursor-pointer'
        }`}
      >
        {isLoading ? 'Abriendo...' : `Comprar (${price} 🪙)`}
      </button>
    </motion.div>
  );
}