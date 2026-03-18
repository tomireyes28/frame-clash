// src/components/shop/PackResults.tsx
import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BuyPackResponse } from '@/services/shop.service';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface PackResultsProps {
  packResult: BuyPackResponse;
  onClose: () => void;
}

export default function PackResults({ packResult, onClose }: PackResultsProps) {
  
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#E50914', '#EAB308', '#3B82F6', '#8B5CF6'],
      zIndex: 100
    });
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.5, rotateY: 90 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      rotateY: 0,
      transition: { type: "spring", bounce: 0.5, duration: 0.8 } 
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl flex flex-col items-center"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl md:text-5xl font-black text-green-400 mb-12 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
      >
        ¡Nuevas Cartas!
      </motion.h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
        {packResult.cards.map((card, index) => (
          <motion.div 
            variants={cardVariants}
            key={`${card.id}-${index}`} 
            className="relative w-32 md:w-48 aspect-2/3 rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl bg-black"
          >
            {card.posterPath ? (
              <Image src={`${TMDB_IMAGE_BASE}${card.posterPath}`} alt={card.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2 text-center font-bold text-gray-400">
                {card.title}
              </div>
            )}
            
            {card.isNew ? (
              <div className="absolute -top-1 -right-1 bg-yellow-500 text-black px-3 py-1 text-xs md:text-sm font-black uppercase rotate-12 shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10">
                ¡Nueva!
              </div>
            ) : (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs md:text-sm font-black rounded shadow-md border border-blue-400 z-10">
                x{card.quantity}
              </div>
            )}
            
            <div className="absolute bottom-0 w-full bg-linear-to-t from-black via-black/80 to-transparent pt-6 pb-2 text-center border-t border-gray-800/50">
              <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-gray-300 drop-shadow-md">
                {card.rarity}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }} 
        onClick={onClose}
        className="mt-16 px-8 py-4 bg-[#E50914] text-white font-black text-lg uppercase tracking-widest rounded shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:scale-105 transition-transform cursor-pointer"
      >
        Volver a la Tienda
      </motion.button>
    </motion.div>
  );
}