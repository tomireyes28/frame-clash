// web/src/components/draft/DraftRoundResult.tsx
'use client';

import React, { useEffect } from 'react';
import { SubmitDraftRoundResponse } from '@/services/draft.service';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '@/utils/audio';

interface DraftRoundResultProps {
  result: SubmitDraftRoundResponse;
  onNextRound: () => void;
}

export default function DraftRoundResult({ result, onNextRound }: DraftRoundResultProps) {
  useEffect(() => {
    soundManager.playVictory();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#38BDF8'],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-8 px-6 bg-slate-900/90 backdrop-blur-md rounded-3xl border-2 border-emerald-500/50 shadow-2xl text-center"
    >
      <span className="text-5xl block mb-1">🎉</span>

      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
        ¡Ronda Superada!
      </span>

      <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
        Ronda {result.roundNumber} de 3 Completada
      </h2>

      {/* Tarjeta de Puntajes */}
      <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex justify-around items-center text-center">
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold block">Tu Puntaje</span>
          <span className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
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

      {/* Aviso de Recarga de Power-Ups */}
      <div className="w-full bg-slate-950/90 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-center gap-3">
        <span className="text-2xl">🔄</span>
        <div className="text-left">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            ¡Power-Ups Recargados!
          </h4>
          <p className="text-[11px] text-slate-400">
            Disponés nuevamente de tus 5 cartas completas para la siguiente ronda.
          </p>
        </div>
      </div>

      {/* Próxima Categoría */}
      {result.nextCategory && (
        <div className="text-center">
          <span className="text-xs text-slate-400 uppercase font-mono block mb-1">
            Próxima Categoría Sorpresa:
          </span>
          <div className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-2xl">{result.nextCategory.icon}</span>
            <span className="text-sm font-bold text-white">{result.nextCategory.name}</span>
          </div>
        </div>
      )}

      {/* Botón Siguiente Ronda */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNextRound}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-950/50 uppercase tracking-wider cursor-pointer"
      >
        Ir a la Ronda {result.roundNumber + 1} ➔
      </motion.button>
    </motion.div>
  );
}
