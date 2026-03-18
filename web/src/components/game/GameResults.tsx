// src/components/game/GameResults.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { gameService, SubmitGameResponse } from '@/services/game.service';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface GameResultsProps {
  score: number;
}

export default function GameResults({ score }: GameResultsProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [finalResult, setFinalResult] = useState<SubmitGameResponse | null>(null);
  
  // 🔥 Patrón Senior: useRef evita que el Strict Mode dispare el endpoint 2 veces
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const submitRoundData = async () => {
      setSubmitState('loading');
      
      try {
        const storeState = useGameStore.getState();
        const payload = {
          categoryId: '28', 
          claimedScore: score,
          auditLog: storeState.auditLog, 
          usedPowerUps: storeState.usedPowerUps, 
        };

        const result = await gameService.submitRound(payload);
        setSubmitState('success');
        setFinalResult(result);
      } catch (err: unknown) {
        console.error('Error al guardar partida:', err);
        setSubmitState('error');
      }
    };

    submitRoundData();
  }, [score]);

  return (
    <div className="flex flex-col items-center mt-20 text-white gap-6 px-4 pb-20">
      <h2 className="text-4xl md:text-5xl font-bold text-[#E50914] uppercase tracking-wider text-center">
        ¡Ronda Terminada!
      </h2>
      
      <div className="bg-[#09090b] p-8 rounded-xl border border-gray-800 text-center w-full max-w-md shadow-2xl">
        <p className="text-gray-400 text-lg mb-2">Puntaje acumulado</p>
        <p className="text-5xl md:text-6xl font-bold text-green-400 mb-6">{score}</p>
        
        {submitState === 'loading' && (
          <p className="text-yellow-400 animate-pulse font-bold text-xl">Enviando auditoría al Juez...</p>
        )}
        
        {submitState === 'error' && (
          <div className="text-red-500">
            <p className="font-bold text-xl">Error al guardar la partida. 🚨</p>
          </div>
        )}
        
        {submitState === 'success' && finalResult && (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-6 mt-4">
            <p className="text-green-500 font-bold text-xl">¡Partida guardada oficialmente! ✅</p>
            
            <div className="w-full bg-black/40 rounded-xl p-4 flex justify-around border border-gray-700 shadow-inner">
              <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2s' }}>
                <span className="text-4xl drop-shadow-lg mb-1">🪙</span>
                <span className="text-yellow-400 font-black text-3xl">+{finalResult.coinsEarned}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Monedas</span>
              </div>
              
              <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.2s' }}>
                <span className="text-4xl drop-shadow-lg mb-1">⚡</span>
                <span className="text-blue-400 font-black text-3xl">+{finalResult.xpEarned}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Exp</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}