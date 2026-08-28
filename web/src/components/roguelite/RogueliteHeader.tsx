// web/src/components/roguelite/RogueliteHeader.tsx
import React from 'react';

interface RogueliteHeaderProps {
  wave: number;
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
  targetScore: number;
  categoryName: string;
}

export default function RogueliteHeader({
  wave,
  currentIndex,
  totalQuestions,
  timeLeft,
  score,
  targetScore,
  categoryName,
}: RogueliteHeaderProps) {
  const seconds = (timeLeft / 1000).toFixed(2);
  const timePercentage = Math.max(0, Math.min(100, (timeLeft / 10000) * 100));
  const scorePercentage = Math.min(100, (score / Math.max(1, targetScore)) * 100);
  const hasMetTarget = score >= targetScore;

  let timerColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  let progressTimeColor = 'bg-emerald-500';

  if (timeLeft < 3000) {
    timerColor = 'text-rose-400 border-rose-500/60 bg-rose-950/60 animate-pulse';
    progressTimeColor = 'bg-rose-500';
  } else if (timeLeft < 6000) {
    timerColor = 'text-amber-400 border-amber-500/50 bg-amber-950/50';
    progressTimeColor = 'bg-amber-500';
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-3 mb-6">
      {/* Barra superior con Ronda, Categoría y Timer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black uppercase">
            Ronda {wave}
          </span>
          <span className="text-slate-300 text-xs font-semibold truncate max-w-[130px]">
            {categoryName}
          </span>
        </div>

        <div className={`px-3.5 py-1 rounded-xl border font-mono text-base md:text-lg font-black shadow-lg ${timerColor}`}>
          ⏱️ {seconds}s
        </div>

        <div className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 font-mono">
          {currentIndex + 1}/{totalQuestions}
        </div>
      </div>

      {/* Barra de Tiempo suave */}
      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear rounded-full ${progressTimeColor}`}
          style={{ width: `${timePercentage}%` }}
        />
      </div>

      {/* Barra de Supervivencia: Puntaje vs Objetivo */}
      <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5 shadow-md">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1">
            🎯 Objetivo de Ronda:
          </span>
          <span className={`font-mono font-bold ${hasMetTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
            {score.toLocaleString('es-AR')} / {targetScore.toLocaleString('es-AR')} pts
            {hasMetTarget && ' ✅'}
          </span>
        </div>

        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              hasMetTarget
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
