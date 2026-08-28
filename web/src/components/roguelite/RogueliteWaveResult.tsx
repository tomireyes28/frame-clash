// web/src/components/roguelite/RogueliteWaveResult.tsx
'use client';

import React, { useEffect } from 'react';
import { SubmitWaveResponse } from '@/services/roguelite.service';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '@/utils/audio';

interface RogueliteWaveResultProps {
  result: SubmitWaveResponse;
  onNextWave: () => void;
}

export default function RogueliteWaveResult({ result, onNextWave }: RogueliteWaveResultProps) {
  useEffect(() => {
    soundManager.playVictory();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#38BDF8', '#8B5CF6'],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-6 px-4 bg-slate-900/90 backdrop-blur-md rounded-3xl border-2 border-emerald-500/50 shadow-2xl"
    >
      <div className="text-center">
        <span className="text-4xl md:text-5xl block mb-2">🎉</span>
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          ¡Supervivencia Exitosa!
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider mt-3">
          Ronda {result.wave} Superada
        </h2>
      </div>

      {/* Tarjeta de Puntajes */}
      <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex justify-around items-center text-center">
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold block">Puntaje Ronda</span>
          <span className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
            {result.roundScore.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="h-8 w-px bg-slate-800" />
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold block">Objetivo</span>
          <span className="text-xl md:text-2xl font-black text-slate-300 font-mono">
            {result.targetScore.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Cofre de Recompensas Acumuladas */}
      <div className="w-full bg-gradient-to-br from-slate-950 to-slate-900 p-5 rounded-2xl border border-amber-500/30">
        <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-3 flex items-center gap-2">
          💎 Botín Acumulado de la Corrida
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="text-2xl">🪙</span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Monedas</span>
              <span className="text-base font-black text-amber-400 font-mono">
                +{result.accumulatedCoins}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Experiencia</span>
              <span className="text-base font-black text-sky-400 font-mono">
                +{result.accumulatedXp} XP
              </span>
            </div>
          </div>
        </div>

        {result.accumulatedPacks && result.accumulatedPacks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
            <span className="text-xl">📦</span>
            <span className="text-xs font-bold text-amber-300">
              Sobres Ganados: {result.accumulatedPacks.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Botón Siguiente Ronda */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNextWave}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-950/50 uppercase tracking-wider cursor-pointer"
      >
        Elegir Categoría → Ronda {result.wave + 1}
      </motion.button>
    </motion.div>
  );
}
