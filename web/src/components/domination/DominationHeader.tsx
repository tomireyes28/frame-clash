// web/src/components/domination/DominationHeader.tsx
import React from 'react';
import { NodeThresholds } from '@/services/domination.service';

interface DominationHeaderProps {
  categoryName: string;
  nodeNumber: number;
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
  thresholds: NodeThresholds;
}

export default function DominationHeader({
  categoryName,
  nodeNumber,
  currentIndex,
  totalQuestions,
  timeLeft,
  score,
  thresholds,
}: DominationHeaderProps) {
  const seconds = (timeLeft / 1000).toFixed(2);
  const timePercentage = Math.max(0, Math.min(100, (timeLeft / 10000) * 100));

  const hasStar1 = score >= thresholds.oneStar;
  const hasStar2 = score >= thresholds.twoStars;
  const hasStar3 = score >= thresholds.threeStars;

  const scorePercentage = Math.min(100, (score / Math.max(1, thresholds.threeStars)) * 100);

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
      {/* Barra Superior */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black uppercase">
            Fase {nodeNumber}
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

      {/* Barra de Tiempo */}
      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear rounded-full ${progressTimeColor}`}
          style={{ width: `${timePercentage}%` }}
        />
      </div>

      {/* Seguidor de Estrellas en Vivo */}
      <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex flex-col gap-2 shadow-md">
        <div className="flex justify-between items-center text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className={`text-base transition-all ${hasStar1 ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'opacity-25 grayscale'}`}>
              ⭐
            </span>
            <span className={`text-base transition-all ${hasStar2 ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'opacity-25 grayscale'}`}>
              ⭐
            </span>
            <span className={`text-base transition-all ${hasStar3 ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'opacity-25 grayscale'}`}>
              ⭐
            </span>
          </div>

          <span className="font-mono font-bold text-amber-400 text-sm">
            {score.toLocaleString('es-AR')} pts
          </span>
        </div>

        {/* Barra de Progreso hacia las 3 Estrellas */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-300 rounded-full"
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
