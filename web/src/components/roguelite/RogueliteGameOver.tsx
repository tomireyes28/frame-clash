// web/src/components/roguelite/RogueliteGameOver.tsx
'use client';

import React from 'react';
import { SubmitWaveResponse } from '@/services/roguelite.service';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface RogueliteGameOverProps {
  result: SubmitWaveResponse;
  onRetry: () => void;
}

export default function RogueliteGameOver({ result, onRetry }: RogueliteGameOverProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-6 px-4 bg-slate-900/95 backdrop-blur-md rounded-3xl border-2 border-rose-600/60 shadow-2xl"
    >
      <div className="text-center">
        <span className="text-5xl block mb-2">💀</span>
        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Fin de la Corrida
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider mt-3">
          Caíste en la Ronda {result.wave}
        </h2>
        {result.isNewRecord && (
          <span className="inline-block mt-2 bg-amber-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full uppercase shadow">
            ⭐ ¡Nuevo Récord Personal! ⭐
          </span>
        )}
      </div>

      {/* Tarjeta de Puntajes */}
      <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex justify-around items-center text-center">
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold block">Puntaje Ronda</span>
          <span className="text-xl md:text-2xl font-black text-rose-400 font-mono">
            {result.roundScore.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="h-8 w-px bg-slate-800" />
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold block">Requerido</span>
          <span className="text-xl md:text-2xl font-black text-slate-300 font-mono">
            {result.targetScore.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Botín Acreditado */}
      <div className="w-full bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
        <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3 flex items-center gap-2">
          💰 Recompensas Acreditadas a tu Cuenta
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="text-2xl">🪙</span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Monedas</span>
              <span className="text-base font-black text-amber-400 font-mono">
                +{result.accumulatedCoins}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Experiencia</span>
              <span className="text-base font-black text-sky-400 font-mono">
                +{result.accumulatedXp} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="w-full flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl uppercase tracking-wider cursor-pointer"
        >
          🔄 Intentar Otra Corrida
        </motion.button>

        <Link
          href="/"
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-center text-sm rounded-xl border border-slate-700 transition"
        >
          ← Volver al Menú Principal
        </Link>
      </div>
    </motion.div>
  );
}
