// web/src/components/game/GameHeader.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { soundManager } from '@/utils/audio';

interface GameHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
}

export default function GameHeader({ currentIndex, totalQuestions, timeLeft, score }: GameHeaderProps) {
  const seconds = (timeLeft / 1000).toFixed(1);
  const percentage = Math.max(0, Math.min(100, (timeLeft / 10000) * 100));
  const lastSecondRef = useRef<number>(Math.ceil(timeLeft / 1000));

  // 🔊 Audio de tensión en cuenta regresiva (Latidos y ticks en los últimos 3 segundos)
  useEffect(() => {
    const currentSec = Math.ceil(timeLeft / 1000);
    if (currentSec !== lastSecondRef.current && timeLeft > 0) {
      lastSecondRef.current = currentSec;
      if (timeLeft <= 3500) {
        soundManager.playTick(true); // Heartbeat sub-bass
      } else if (timeLeft <= 6000) {
        soundManager.playTick(false);
      }
    }
  }, [timeLeft]);

  let timerColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60 shadow-emerald-950/40';
  let progressColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';

  if (timeLeft < 3000) {
    timerColor = 'text-rose-400 border-rose-500/80 bg-rose-950/80 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]';
    progressColor = 'bg-gradient-to-r from-rose-600 to-red-500';
  } else if (timeLeft < 6000) {
    timerColor = 'text-amber-400 border-amber-500/50 bg-amber-950/60 shadow-amber-950/40';
    progressColor = 'bg-gradient-to-r from-amber-500 to-orange-500';
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-1.5 mb-3">
      <div className="flex justify-between items-center">
        {/* Nro de Pregunta */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 shadow-md">
          Pregunta <span className="text-amber-400 font-mono font-black">{currentIndex + 1}</span>/{totalQuestions}
        </div>

        {/* Reloj Neón */}
        <div className={`px-3 py-1 rounded-xl border font-mono text-base font-black shadow-md ${timerColor}`}>
          ⏱️ {seconds}s
        </div>

        {/* Puntaje */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-xs font-black text-amber-400 font-mono shadow-md">
          🏆 {score.toLocaleString('es-AR')}
        </div>
      </div>

      {/* Barra de Tensión de Tiempo */}
      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
        <div
          className={`h-full transition-all duration-100 ease-linear rounded-full ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}