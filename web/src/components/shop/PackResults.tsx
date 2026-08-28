// web/src/components/shop/PackResults.tsx
import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BuyPackResponse } from '@/services/shop.service';
import { soundManager } from '@/utils/audio';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface PackResultsProps {
  packResult: BuyPackResponse;
  onClose: () => void;
}

const RARITY_COLORS: Record<string, { border: string; badge: string; shadow: string; name: string }> = {
  COMMON: { border: 'border-zinc-400', badge: 'bg-zinc-600 text-zinc-100', shadow: 'shadow-zinc-500/20', name: 'Común' },
  UNCOMMON: { border: 'border-emerald-500', badge: 'bg-emerald-600 text-white', shadow: 'shadow-emerald-500/30', name: 'Inusual' },
  RARE: { border: 'border-sky-400', badge: 'bg-sky-500 text-white', shadow: 'shadow-sky-400/40', name: 'Rara' },
  EPIC: { border: 'border-purple-500', badge: 'bg-purple-600 text-white', shadow: 'shadow-purple-500/50', name: 'Épica' },
  LEGENDARY: { border: 'border-amber-400', badge: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black', shadow: 'shadow-[0_0_25px_rgba(251,191,36,0.6)]', name: 'Legendaria' },
};

export default function PackResults({ packResult, onClose }: PackResultsProps) {
  useEffect(() => {
    soundManager.playVictory();

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#EAB308', '#38BDF8', '#A855F7', '#22C55E'],
      zIndex: 100,
    });
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.18 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.6, rotateY: 90 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      transition: { type: 'spring', bounce: 0.45, duration: 0.7 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl flex flex-col items-center py-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent mb-8 uppercase tracking-widest text-center"
      >
        ¡Cartas Obtenidas!
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
        {packResult.cards.map((card, index) => {
          const style = RARITY_COLORS[card.rarity] || RARITY_COLORS.COMMON;

          return (
            <motion.div
              variants={cardVariants}
              key={`${card.id}-${index}`}
              className={`relative w-32 md:w-44 aspect-[2/3] rounded-2xl overflow-hidden border-2 bg-slate-900 shadow-2xl flex flex-col justify-between p-2 ${style.border} ${style.shadow}`}
            >
              {card.posterPath ? (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={`${TMDB_IMAGE_BASE}${card.posterPath}`}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 130px, 180px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2 text-center font-bold text-slate-400 text-xs">
                  {card.title}
                </div>
              )}

              {/* Tag de estado: ¡Nueva! o Multiplicador de copias */}
              <div className="z-10 flex justify-between items-center w-full">
                <span className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${style.badge}`}>
                  {style.name}
                </span>

                {card.isNew ? (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                    ¡Nueva!
                  </span>
                ) : (
                  <span className="bg-sky-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-sky-400">
                    x{card.quantity}
                  </span>
                )}
              </div>

              {/* Título de la película */}
              <div className="z-10 bg-black/80 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 text-center">
                <h4 className="text-xs font-bold truncate text-white">{card.title}</h4>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={onClose}
        className="mt-12 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/40 hover:scale-105 transition-transform cursor-pointer"
      >
        Continuar en la Tienda
      </motion.button>
    </motion.div>
  );
}