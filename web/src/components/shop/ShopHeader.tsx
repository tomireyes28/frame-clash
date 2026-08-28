// web/src/components/shop/ShopHeader.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ShopHeaderProps {
  currentCoins: number | null;
  onClaimFreeCoins: () => void;
}

export default function ShopHeader({ currentCoins, onClaimFreeCoins }: ShopHeaderProps) {
  return (
    <div className="w-full flex flex-col items-center text-center mb-3">
      {/* Título & Badge */}
      <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1 shadow-md">
        🛒 Bóveda de Coleccionista
      </span>
      <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent uppercase tracking-wider">
        Tienda de Sobres
      </h1>
      <p className="text-[10px] text-slate-400 mt-0.5 mb-2.5">
        Desbloqueá películas para tu mazo y obtené polvo estelar ✨.
      </p>

      {/* BALANCE Y BOTÓN DE MONEDAS GRATIS */}
      <div className="w-full bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪙</span>
          <div className="text-left">
            <span className="text-[9px] text-slate-400 font-mono block leading-none">
              TUS MONEDAS
            </span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {currentCoins !== null ? currentCoins.toLocaleString('es-AR') : '...'}
            </span>
          </div>
        </div>

        {/* 🎁 BOTÓN DE TOP-UP DEMO */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClaimFreeCoins}
          className="py-1.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-[0_3px_0_#9a3412] active:translate-y-0.5 active:shadow-none transition flex items-center gap-1 cursor-pointer border border-yellow-200"
        >
          <span>🎁</span>
          <span>+50.000 Gratis</span>
        </motion.button>
      </div>
    </div>
  );
}