// web/src/components/draft/DraftLobby.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DraftLobbyProps {
  onStartDraft: () => void;
  isLoading: boolean;
}

export default function DraftLobby({ onStartDraft, isLoading }: DraftLobbyProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-4 px-4 pb-20">
      {/* HEADER */}
      <div className="text-center">
        <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Modo Competitivo
        </span>
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider mt-2 mb-2">
          Modo Draft
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Drafteá una mano de <span className="text-amber-400 font-bold">5 Power-Ups</span> y enfrentá un guantelete de <span className="text-white font-bold">3 Rondas</span> con categorías aleatorias.
        </p>
      </div>

      {/* REGLAS PRINCIPALES */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col items-center text-center shadow-lg">
          <span className="text-3xl mb-2">🃏</span>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Mano de 5 Cartas
          </h4>
          <p className="text-xs text-slate-400">
            Elegí 1 carta en 5 tandas consecutivas para armar tu mazo de la partida.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col items-center text-center shadow-lg">
          <span className="text-3xl mb-2">🔄</span>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Recarga por Ronda
          </h4>
          <p className="text-xs text-slate-400">
            Tus 5 power-ups se recargan al 100% al inicio de cada una de las 3 rondas.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col items-center text-center shadow-lg">
          <span className="text-3xl mb-2">🎲</span>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Categorías Sorpresa
          </h4>
          <p className="text-xs text-slate-400">
            Cada ronda se juega con una categoría aleatoria asignada por el sistema.
          </p>
        </div>
      </div>

      {/* LOS 3 NIVELES DE PREMIOS */}
      <div className="w-full bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-3 flex items-center gap-2 justify-center">
          🏆 Los 3 Niveles de Premios
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Nivel 1 */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col items-center text-center">
            <span className="text-xl mb-1">🥉</span>
            <span className="text-xs font-black uppercase text-amber-400">Premio Nivel 1</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Superar Ronda 1</span>
            <span className="text-xs font-bold text-slate-200 mt-2">
              150 🪙 | 100 XP | 5 ✨
            </span>
          </div>

          {/* Nivel 2 */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 flex flex-col items-center text-center">
            <span className="text-xl mb-1">🥈</span>
            <span className="text-xs font-black uppercase text-amber-300">Premio Nivel 2</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Superar Ronda 2</span>
            <span className="text-xs font-bold text-slate-200 mt-2">
              350 🪙 | 250 XP | 15 ✨ + Sobre Bronce
            </span>
          </div>

          {/* Nivel 3 */}
          <div className="bg-gradient-to-b from-amber-950/40 to-slate-950 p-3.5 rounded-xl border border-amber-400 flex flex-col items-center text-center shadow-lg shadow-amber-950/40">
            <span className="text-xl mb-1">👑</span>
            <span className="text-xs font-black uppercase text-yellow-300">Gran Premio (Nivel 3)</span>
            <span className="text-[10px] text-amber-400 font-mono mt-0.5">¡Campeón del Draft!</span>
            <span className="text-xs font-bold text-white mt-2">
              800 🪙 | 500 XP | 40 ✨ + Sobre Plata
            </span>
          </div>
        </div>
      </div>

      {/* BOTÓN DE COMIENZO */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartDraft}
        disabled={isLoading}
        className="w-full max-w-md py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-orange-950/50 uppercase tracking-wider cursor-pointer disabled:opacity-50"
      >
        {isLoading ? 'Iniciando Draft...' : '🃏 ¡Comenzar Draft de Cartas!'}
      </motion.button>
    </div>
  );
}
