// web/src/components/draft/DraftRoundIntro.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DraftRoundIntroProps {
  roundNumber: number;
  totalRounds: number; // 3
  category: { key: string; name: string; icon: string };
  targetScore: number;
  onStartRound: () => void;
  isLoading: boolean;
}

export default function DraftRoundIntro({
  roundNumber,
  totalRounds,
  category,
  targetScore,
  onStartRound,
  isLoading,
}: DraftRoundIntroProps) {
  const isFinalRound = roundNumber === totalRounds;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-8 px-6 bg-slate-900/90 backdrop-blur-md rounded-3xl border-2 border-slate-700 shadow-2xl text-center"
    >
      <span className={`text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border ${
        isFinalRound ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 animate-pulse' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
      }`}>
        {isFinalRound ? '🏆 Gran Final del Draft' : `Ronda ${roundNumber} de ${totalRounds}`}
      </span>

      <div className="flex flex-col items-center">
        <span className="text-6xl md:text-7xl mb-2">{category.icon}</span>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
          {category.name}
        </h2>
        <span className="text-xs text-slate-400 uppercase font-mono mt-1">
          Categoría Asignada al Azar
        </span>
      </div>

      {/* Tarjeta de Requisitos */}
      <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-400">🎯 Puntaje Mínimo para Sobrevivir:</span>
          <span className="text-emerald-400 font-mono font-bold text-base">
            {targetScore.toLocaleString('es-AR')} pts
          </span>
        </div>

        <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-900">
          <span className="text-slate-400">⚡ Power-Ups Disponibles:</span>
          <span className="text-amber-400 font-bold">5 Cartas Recargadas 🔄</span>
        </div>
      </div>

      {/* Botón de Inicio */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartRound}
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-orange-950/50 uppercase tracking-wider cursor-pointer disabled:opacity-50"
      >
        {isLoading ? 'Cargando Preguntas...' : `▶ ¡Comenzar Ronda ${roundNumber}!`}
      </motion.button>
    </motion.div>
  );
}
