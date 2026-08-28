// web/src/components/shop/PackDisplay.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PackDisplayProps {
  packId: string;
  name: string;
  price: number;
  colorClasses: string;
  emoji: string;
  guaranteeText?: string;
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
  guaranteeText,
  isLoading,
  disabled,
  onBuy,
}: PackDisplayProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between shadow-lg relative overflow-hidden ${colorClasses}`}
    >
      {/* LADO IZQUIERDO: SOBRE EMOJI + INFO */}
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          animate={isLoading ? { scale: [1, 1.15, 1], rotate: [-5, 5, -5] } : {}}
          transition={{ repeat: isLoading ? Infinity : 0, duration: 0.5 }}
          className="w-12 h-14 rounded-xl bg-slate-950/60 border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0"
        >
          {emoji}
        </motion.div>

        <div className="min-w-0">
          <h3 className="text-sm font-black text-white uppercase tracking-wider truncate drop-shadow-md">
            Sobre {name}
          </h3>
          <span className="text-[10px] text-slate-300/90 font-medium block leading-tight">
            {guaranteeText || 'Cartas coleccionables'}
          </span>
          <span className="text-xs font-black text-amber-400 font-mono mt-0.5 block">
            {price.toLocaleString('es-AR')} 🪙
          </span>
        </div>
      </div>

      {/* LADO DERECHO: BOTÓN DE COMPRA 3D */}
      <button
        onClick={() => onBuy(packId)}
        disabled={disabled || isLoading}
        className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none shrink-0 ${
          disabled || isLoading
            ? 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 cursor-pointer'
        }`}
      >
        {isLoading ? 'Abriendo...' : 'Comprar'}
      </button>
    </motion.div>
  );
}