// web/src/components/domination/DominationResultModal.tsx
'use client';

import React, { useEffect } from 'react';
import { SubmitNodeResponse } from '@/services/domination.service';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '@/utils/audio';

interface DominationResultModalProps {
  result: SubmitNodeResponse;
  categoryName: string;
  onNextNode?: () => void;
  onRetry: () => void;
  onBackToMap: () => void;
}

export default function DominationResultModal({
  result,
  categoryName,
  onNextNode,
  onRetry,
  onBackToMap,
}: DominationResultModalProps) {
  useEffect(() => {
    if (result.passed) {
      soundManager.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EAB308', '#38BDF8', '#10B981'],
      });
    } else {
      soundManager.playWrong();
    }
  }, [result.passed]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-6 px-4 bg-slate-900/95 backdrop-blur-md rounded-3xl border-2 border-slate-700 shadow-2xl"
    >
      {/* HEADER */}
      <div className="text-center">
        <span className="text-4xl md:text-5xl block mb-2">
          {result.rewards.masteryBonus ? '👑' : result.passed ? '🎉' : '💀'}
        </span>

        <span className={`text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border ${
          result.passed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        }`}>
          {result.passed ? '¡Fase Superada!' : 'Fase No Superada'}
        </span>

        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mt-3">
          {categoryName} — Fase {result.nodeNumber}
        </h2>
      </div>

      {/* ESTRELLAS ANIMADAS */}
      <div className="flex justify-center gap-3 my-1">
        {[1, 2, 3].map((starIndex) => {
          const isEarned = starIndex <= result.stars;
          return (
            <motion.span
              key={starIndex}
              initial={{ scale: 0, rotate: -30 }}
              animate={isEarned ? { scale: [0, 1.3, 1], rotate: 0 } : { scale: 1 }}
              transition={{ delay: 0.2 + starIndex * 0.2, type: 'spring' }}
              className={`text-4xl md:text-5xl ${
                isEarned
                  ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                  : 'text-slate-700 grayscale opacity-40'
              }`}
            >
              ★
            </motion.span>
          );
        })}
      </div>

      {/* PUNTAJE */}
      <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
        <span className="text-xs text-slate-400 uppercase font-semibold block">Puntaje Final</span>
        <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
          {result.score.toLocaleString('es-AR')} pts
        </span>
      </div>

      {/* RECOMPENSAS */}
      {result.passed && (result.rewards.coins > 0 || result.rewards.xp > 0 || result.rewards.masteryBonus) && (
        <div className="w-full bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-amber-500/30">
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2.5">
            🎁 Recompensas Obtenidas
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            {result.rewards.coins > 0 && (
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  +{result.rewards.coins} Monedas
                </span>
              </div>
            )}

            {result.rewards.xp > 0 && (
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <span className="text-sm font-black text-sky-400 font-mono">
                  +{result.rewards.xp} XP
                </span>
              </div>
            )}
          </div>

          {result.rewards.masteryBonus && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-center">
              <span className="text-xl">👑</span>
              <span className="text-xs font-black text-yellow-300">
                ¡DOMINIO ABSOLUTO! +50 Polvo Estelar ✨
              </span>
            </div>
          )}
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="w-full flex flex-col gap-2.5">
        {result.unlockedNextNode && onNextNode && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextNode}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-xl shadow-lg uppercase tracking-wider cursor-pointer"
          >
            Siguiente Fase ({result.nodeNumber + 1}) →
          </motion.button>
        )}

        <button
          onClick={onRetry}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition cursor-pointer"
        >
          🔄 Reintentar Fase ({result.nodeNumber})
        </button>

        <button
          onClick={onBackToMap}
          className="w-full py-2.5 text-xs text-slate-400 hover:text-white underline cursor-pointer"
        >
          ← Volver al Mapa de Nodos
        </button>
      </div>
    </motion.div>
  );
}
