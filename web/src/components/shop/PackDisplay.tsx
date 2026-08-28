// web/src/components/shop/PackDisplay.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '@/utils/audio';

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

const PACK_AESTHETICS: Record<string, { gradient: string; border: string; glow: string; badge: string; accent: string }> = {
  BRONZE: {
    gradient: 'from-amber-900 via-amber-950 to-slate-950',
    border: 'border-amber-700/80',
    glow: 'shadow-amber-950/60',
    badge: 'bg-amber-800 text-amber-200 border-amber-600',
    accent: 'text-amber-400',
  },
  SILVER: {
    gradient: 'from-slate-700 via-slate-900 to-slate-950',
    border: 'border-slate-400/80',
    glow: 'shadow-slate-900/60',
    badge: 'bg-slate-700 text-slate-200 border-slate-400',
    accent: 'text-slate-200',
  },
  GOLD: {
    gradient: 'from-yellow-900/90 via-amber-950 to-slate-950',
    border: 'border-amber-400',
    glow: 'shadow-amber-500/30 shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black border-amber-300',
    accent: 'text-amber-300',
  },
  PLATINUM: {
    gradient: 'from-cyan-950 via-sky-950 to-slate-950',
    border: 'border-cyan-400',
    glow: 'shadow-cyan-500/30 shadow-[0_0_25px_rgba(56,189,248,0.25)]',
    badge: 'bg-cyan-500 text-slate-950 font-black border-cyan-300',
    accent: 'text-cyan-300',
  },
  DIAMOND: {
    gradient: 'from-purple-950 via-fuchsia-950 to-slate-950',
    border: 'border-fuchsia-400',
    glow: 'shadow-fuchsia-500/40 shadow-[0_0_30px_rgba(217,70,239,0.3)]',
    badge: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black border-fuchsia-300',
    accent: 'text-fuchsia-300',
  },
};

export default function PackDisplay({
  packId,
  name,
  price,
  emoji,
  guaranteeText,
  isLoading,
  disabled,
  onBuy,
}: PackDisplayProps) {
  const style = PACK_AESTHETICS[packId] || PACK_AESTHETICS.GOLD;

  const handleBuyClick = () => {
    soundManager.playButtonClick();
    onBuy(packId);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`w-full p-3.5 rounded-3xl border-2 flex items-center justify-between shadow-xl relative overflow-hidden bg-gradient-to-r ${style.gradient} ${style.border} ${style.glow}`}
    >
      {/* Brillo foil diagonal */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* LADO IZQUIERDO: MINIATURA DE SOBRE FOIL + INFO */}
      <div className="flex items-center gap-3 min-w-0 z-10">
        {/* SOBRE 3D COMPACTO CON BORDE METÁLICO */}
        <motion.div
          animate={isLoading ? { rotate: [-8, 8, -8], scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: isLoading ? Infinity : 0, duration: 0.4 }}
          className={`w-13 h-16 rounded-2xl bg-gradient-to-b ${style.gradient} border-2 ${style.border} flex flex-col items-center justify-center relative shadow-lg shrink-0 overflow-hidden`}
        >
          {/* Crimp superior de aluminio */}
          <div className="w-full h-1.5 bg-black/40 border-b border-white/20" />
          <span className="text-2xl my-auto drop-shadow-md">{emoji}</span>
          {/* Crimp inferior */}
          <div className="w-full h-1.5 bg-black/40 border-t border-white/20" />
        </motion.div>

        {/* DETALLES DEL SOBRE */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${style.badge}`}>
              SOBRE
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider truncate">
              {name}
            </h3>
          </div>

          <span className="text-[10px] text-slate-300 font-medium block truncate leading-tight">
            {guaranteeText || '5 Cartas Coleccionables'}
          </span>

          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-black text-amber-400 font-mono">
              {price.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: BOTÓN DE COMPRA ARCADE 3D */}
      <div className="z-10 shrink-0 pl-2">
        <motion.button
          whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
          onClick={handleBuyClick}
          disabled={disabled || isLoading}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none flex items-center gap-1.5 ${
            disabled || isLoading
              ? 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed border border-slate-700 opacity-60'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 cursor-pointer border border-yellow-200/60 shadow-[0_4px_0_#b45309]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Abriendo...</span>
            </>
          ) : (
            <>
              <span>Abrir</span>
              <span>➔</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}