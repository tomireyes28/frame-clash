// web/src/components/game/GameHeader.tsx
import React from 'react';

interface GameHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
}

export default function GameHeader({ currentIndex, totalQuestions, timeLeft, score }: GameHeaderProps) {
  const seconds = (timeLeft / 1000).toFixed(2);
  const percentage = Math.max(0, Math.min(100, (timeLeft / 10000) * 100));

  let timerColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  let progressColor = 'bg-emerald-500';

  if (timeLeft < 3000) {
    timerColor = 'text-rose-400 border-rose-500/60 bg-rose-950/60 animate-pulse';
    progressColor = 'bg-rose-500';
  } else if (timeLeft < 6000) {
    timerColor = 'text-amber-400 border-amber-500/50 bg-amber-950/50';
    progressColor = 'bg-amber-500';
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-2 mb-6">
      <div className="flex justify-between items-center">
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
          Pregunta <span className="text-white font-bold">{currentIndex + 1}</span>/{totalQuestions}
        </div>

        {/* Timer de alta precisión */}
        <div className={`px-4 py-1.5 rounded-xl border font-mono text-xl font-black shadow-lg ${timerColor}`}>
          ⏱️ {seconds}s
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-emerald-400 font-mono">
          🏆 {score.toLocaleString('es-AR')}
        </div>
      </div>

      {/* Barra de Tiempo suave */}
      <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear rounded-full ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}