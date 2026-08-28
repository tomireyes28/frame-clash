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
    <div className="w-full flex flex-col items-center gap-4 py-2 px-3 pb-6">
      {/* HEADER */}
      <div className="text-center">
        <span className="bg-purple-950/80 text-purple-400 border border-purple-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
          🎲 Modo Estrategia TCG
        </span>
        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 bg-clip-text text-transparent uppercase tracking-wider">
          Modo Draft
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Elegí <strong className="text-amber-400">5 Power-Ups</strong> y superá las 3 rondas sorpresa.
        </p>
      </div>

      {/* 3 REGLAS COMPACTAS (HORIZONTAL/VERTICAL MÓVIL) */}
      <div className="w-full grid grid-cols-3 gap-2">
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center shadow-md">
          <span className="text-xl mb-1">🃏</span>
          <h4 className="text-[10px] font-bold text-white uppercase">5 Cartas</h4>
          <p className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">1 por tanda</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center shadow-md">
          <span className="text-xl mb-1">🔄</span>
          <h4 className="text-[10px] font-bold text-white uppercase">Recarga</h4>
          <p className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">100% c/ ronda</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center shadow-md">
          <span className="text-xl mb-1">🎲</span>
          <h4 className="text-[10px] font-bold text-white uppercase">Aleatorio</h4>
          <p className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">3 Categorías</p>
        </div>
      </div>

      {/* PREMIOS DEL DRAFT */}
      <div className="w-full bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-lg">
        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block text-center mb-2.5">
          🏆 Recompensas por Ronda
        </span>

        <div className="flex flex-col gap-2">
          {/* Nivel 1 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥉</span>
              <div>
                <h5 className="text-[11px] font-bold text-white">Ronda 1</h5>
                <span className="text-[9px] text-slate-400">Superviviente</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              150 🪙 • 100 XP • 5 ✨
            </span>
          </div>

          {/* Nivel 2 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥈</span>
              <div>
                <h5 className="text-[11px] font-bold text-white">Ronda 2</h5>
                <span className="text-[9px] text-slate-400">+ Sobre Bronce</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">
              350 🪙 • 250 XP • 15 ✨
            </span>
          </div>

          {/* Nivel 3 - Campeón */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 p-2.5 rounded-xl border-2 border-amber-400 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <div>
                <h5 className="text-[11px] font-black text-amber-400">¡Campeón!</h5>
                <span className="text-[9px] text-amber-300/80">+ Sobre Plata 🎁</span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-amber-400">
              800 🪙 • 500 XP • 40 ✨
            </span>
          </div>
        </div>
      </div>

      {/* BOTÓN 3D "JUICY" */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onStartDraft}
        disabled={isLoading}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_5px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer disabled:opacity-50 mt-1"
      >
        {isLoading ? 'Iniciando Draft...' : '🃏 ¡COMENZAR DRAFT DE CARTAS!'}
      </motion.button>
    </div>
  );
}
