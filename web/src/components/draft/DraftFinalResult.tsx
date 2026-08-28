// web/src/components/draft/DraftFinalResult.tsx
'use client';

import React, { useEffect } from 'react';
import { SubmitDraftRoundResponse } from '@/services/draft.service';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '@/utils/audio';
import Link from 'next/link';

interface DraftFinalResultProps {
  result: SubmitDraftRoundResponse;
  onRetry: () => void;
}

export default function DraftFinalResult({ result, onRetry }: DraftFinalResultProps) {
  const isChampion = result.prizeTier === 3;
  const isTier2 = result.prizeTier === 2;
  const isTier1 = result.prizeTier === 1;

  useEffect(() => {
    if (isChampion || isTier2) {
      soundManager.playVictory();
      confetti({
        particleCount: isChampion ? 150 : 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EAB308', '#38BDF8', '#8B5CF6'],
      });
    } else {
      soundManager.playWrong();
    }
  }, [isChampion, isTier2]);

  let tierBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  let tierTitle = 'Fin del Draft';
  let tierIcon = '💀';

  if (isChampion) {
    tierBadge = 'bg-amber-400/20 text-yellow-300 border-amber-400/60 shadow-lg shadow-amber-400/20';
    tierTitle = '¡CAMPEÓN DEL DRAFT!';
    tierIcon = '👑';
  } else if (isTier2) {
    tierBadge = 'bg-slate-300/20 text-slate-200 border-slate-400/40';
    tierTitle = 'Premio Nivel 2 Alcanzado';
    tierIcon = '🥈';
  } else if (isTier1) {
    tierBadge = 'bg-amber-800/30 text-amber-400 border-amber-700/40';
    tierTitle = 'Premio Nivel 1 Alcanzado';
    tierIcon = '🥉';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-8 px-6 bg-slate-900/95 backdrop-blur-md rounded-3xl border-2 shadow-2xl text-center ${
        isChampion ? 'border-amber-400/80 shadow-amber-950/50' : 'border-slate-700'
      }`}
    >
      <span className="text-5xl md:text-6xl block">{tierIcon}</span>

      <span className={`text-xs font-mono font-black px-4 py-1 rounded-full uppercase tracking-wider border ${tierBadge}`}>
        {isChampion ? '3 de 3 Rondas Superadas' : `Ronda ${result.roundNumber} de 3`}
      </span>

      <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
        {tierTitle}
      </h2>

      {/* Tarjeta de Recompensas Acreditadas */}
      <div className="w-full bg-slate-950/90 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
        <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
          💰 Recompensas Acreditadas a tu Cuenta
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="text-2xl">🪙</span>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-medium">Monedas</span>
              <span className="text-sm font-black text-amber-400 font-mono">
                +{result.rewards.coins}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-medium">Experiencia</span>
              <span className="text-sm font-black text-sky-400 font-mono">
                +{result.rewards.xp} XP
              </span>
            </div>
          </div>
        </div>

        {result.rewards.stardust > 0 && (
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-center gap-2">
            <span className="text-lg">✨</span>
            <span className="text-xs font-black text-purple-300 font-mono">
              +{result.rewards.stardust} Polvo Estelar
            </span>
          </div>
        )}

        {result.rewards.packId && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-2.5 rounded-xl border border-amber-400/40 flex items-center justify-center gap-2">
            <span className="text-xl">📦</span>
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              ¡Sobre de {result.rewards.packId === 'SILVER' ? 'Plata' : 'Bronce'} Desbloqueado!
            </span>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="w-full flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-base rounded-2xl shadow-xl uppercase tracking-wider cursor-pointer"
        >
          🔄 Jugar Otra Partida de Draft
        </motion.button>

        <Link
          href="/"
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-center text-xs rounded-xl border border-slate-700 transition"
        >
          ← Volver al Menú Principal
        </Link>
      </div>
    </motion.div>
  );
}
