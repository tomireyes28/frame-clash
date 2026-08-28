// web/src/components/game/GameResults.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { gameService, SubmitGameResponse } from '@/services/game.service';
import { soundManager } from '@/utils/audio';
import confetti from 'canvas-confetti';
import Link from 'next/link';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface GameResultsProps {
  score: number;
  categoryId?: string;
}

export default function GameResults({ score, categoryId = 'ACTION' }: GameResultsProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [finalResult, setFinalResult] = useState<SubmitGameResponse | null>(null);
  const resetGame = useGameStore((state) => state.resetGame);

  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const submitRoundData = async () => {
      setSubmitState('loading');

      try {
        const storeState = useGameStore.getState();
        const payload = {
          categoryId,
          claimedScore: score,
          auditLog: storeState.auditLog,
          usedPowerUps: storeState.usedPowerUps,
        };

        const result = await gameService.submitRound(payload);
        setSubmitState('success');
        setFinalResult(result);

        // Sonido de victoria y confeti
        soundManager.playVictory();

        if (result.stars && result.stars >= 1) {
          confetti({
            particleCount: result.stars === 3 ? 120 : 60,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      } catch (err: unknown) {
        console.error('Error al guardar partida:', err);
        setSubmitState('error');
      }
    };

    submitRoundData();
  }, [score, categoryId]);

  return (
    <div className="flex flex-col items-center mt-12 text-white gap-6 px-4 pb-20 w-full max-w-lg mx-auto">
      <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent uppercase tracking-wider text-center">
        ¡Ronda Finalizada!
      </h2>

      <div className="bg-slate-900/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-800 text-center w-full shadow-2xl">
        {/* Estrellas Obtenidas */}
        {finalResult?.stars !== undefined && (
          <div className="flex justify-center items-center gap-3 mb-4 text-3xl md:text-4xl animate-in zoom-in duration-500">
            <span className={finalResult.stars >= 1 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-110' : 'text-slate-700'}>
              ⭐
            </span>
            <span className={finalResult.stars >= 2 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-125' : 'text-slate-700'}>
              ⭐
            </span>
            <span className={finalResult.stars >= 3 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-110' : 'text-slate-700'}>
              ⭐
            </span>
          </div>
        )}

        <p className="text-slate-400 text-sm md:text-base mb-1 font-medium">Puntaje Final Oficial</p>
        <p className="text-4xl md:text-6xl font-black text-emerald-400 mb-6 font-mono">
          {(finalResult?.finalScore ?? score).toLocaleString('es-AR')}
        </p>

        {submitState === 'loading' && (
          <p className="text-amber-400 animate-pulse font-semibold text-base">Validando con el servidor...</p>
        )}

        {submitState === 'error' && (
          <div className="bg-rose-950/50 border border-rose-800 p-3 rounded-xl text-rose-300 text-sm">
            No se pudo sincronizar la partida con el servidor.
          </div>
        )}

        {submitState === 'success' && finalResult && (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-5 mt-2">
            {/* Recompensas de Monedas y XP */}
            <div className="w-full bg-slate-950/60 rounded-xl p-4 flex justify-around border border-slate-800 shadow-inner">
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-1">🪙</span>
                <span className="text-amber-400 font-extrabold text-2xl">+{finalResult.coinsEarned}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Monedas</span>
              </div>

              <div className="w-px bg-slate-800 my-1" />

              <div className="flex flex-col items-center">
                <span className="text-3xl mb-1">⚡</span>
                <span className="text-sky-400 font-extrabold text-2xl">+{finalResult.xpEarned}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Experiencia</span>
              </div>

              {finalResult.correctCount !== undefined && (
                <>
                  <div className="w-px bg-slate-800 my-1" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl mb-1">🎯</span>
                    <span className="text-emerald-400 font-extrabold text-2xl">{finalResult.correctCount}/10</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Aciertos</span>
                  </div>
                </>
              )}
            </div>

            {finalResult.isAdjusted && (
              <p className="text-xs text-amber-300/80 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-900/50">
                ⚠️ Puntaje recalculado por el servidor anti-cheat.
              </p>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => resetGame()}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition shadow-lg shadow-emerald-900/40"
          >
            🔄 Jugar Otra Partida
          </button>
          <Link
            href="/"
            onClick={() => resetGame()}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition border border-slate-700 text-center flex items-center justify-center"
          >
            🏠 Ir al Lobby
          </Link>
        </div>
      </div>
    </div>
  );
}