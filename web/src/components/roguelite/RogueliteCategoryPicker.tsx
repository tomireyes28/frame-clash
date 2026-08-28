// web/src/components/roguelite/RogueliteCategoryPicker.tsx
'use client';

import React from 'react';
import { CategoryOption } from '@/services/roguelite.service';
import { motion, Variants } from 'framer-motion';

interface RogueliteCategoryPickerProps {
  wave: number;
  targetScore: number;
  categories: CategoryOption[];
  onSelectCategory: (categoryKey: string) => void;
  isLoading: boolean;
}

export default function RogueliteCategoryPicker({
  wave,
  targetScore,
  categories,
  onSelectCategory,
  isLoading,
}: RogueliteCategoryPickerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120 } },
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-6 px-4">
      {/* HEADER DE RONDA */}
      <div className="text-center">
        <span className="bg-amber-400/10 text-amber-400 border border-amber-400/40 text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Tanda Infinita
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mt-2">
          Ronda {wave}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-slate-400 text-sm font-medium">Puntaje mínimo requerido para sobrevivir:</span>
          <span className="text-emerald-400 font-mono font-black text-lg bg-slate-900 px-3 py-0.5 rounded-lg border border-emerald-500/40 shadow-inner">
            {targetScore.toLocaleString('es-AR')} pts
          </span>
        </div>
      </div>

      <p className="text-slate-400 text-xs md:text-sm text-center -mt-2">
        Elegí 1 de las 3 categorías para disputar las 10 preguntas de esta ronda:
      </p>

      {/* LAS 3 CATEGORÍAS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-2"
      >
        {categories.map((cat, index) => (
          <motion.button
            key={`${cat.key}-${index}`}
            variants={cardVariants}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectCategory(cat.key)}
            disabled={isLoading}
            className="group relative p-6 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-amber-400/80 shadow-2xl flex flex-col items-center justify-between text-center transition-all duration-300 min-h-56 cursor-pointer disabled:opacity-50"
          >
            {/* Destello de fondo al pasar el mouse */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="text-5xl md:text-6xl mb-3 group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>

            <div className="z-10">
              <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block mt-1">
                {cat.type === 'genre' ? 'Género de Cine' : cat.type === 'decade' ? 'Década Histórica' : 'Temática Especial'}
              </span>
            </div>

            <div className="z-10 w-full mt-4 py-2 px-3 rounded-xl bg-slate-800/80 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-300 font-bold text-xs transition-colors">
              {isLoading ? 'Iniciando...' : 'Elegir Categoría →'}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
