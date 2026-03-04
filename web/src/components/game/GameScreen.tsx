// src/components/game/GameScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { gameService, SubmitGameResponse } from '@/services/game.service';

export default function GameScreen() {
  const { questions, currentIndex, status, score } = useGameStore();
  const currentQuestion = questions[currentIndex];
  
  const { timeLeft, selectedOption, isCorrect, handleOptionClick } = useGameEngine(currentQuestion);

  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  // ¡Adiós al any!
  const [finalResult, setFinalResult] = useState<SubmitGameResponse | null>(null); 

  useEffect(() => {
    if (status === 'finished' && submitState === 'idle') {
      // Usamos el mismo truco asíncrono para no enojar a React
      const submitTimer = setTimeout(() => {
        setSubmitState('loading');
        
        const payload = {
          userId: 'cmm8bj5pr0000n49toufqk6gd',
          categoryId: '28',
          claimedScore: score,
          auditLog: useGameStore.getState().auditLog, 
        };

        gameService.submitRound(payload)
          .then((result) => {
            setSubmitState('success');
            setFinalResult(result);
          })
          .catch((err) => {
            console.error('Error al guardar partida:', err);
            setSubmitState('error');
          });
      }, 0);

      return () => clearTimeout(submitTimer);
    }
  }, [status, submitState, score]);

  if (status === 'idle') {
    return <div className="text-white text-center mt-20 font-bold text-2xl">Esperando iniciar partida...</div>;
  }

  if (status === 'finished') {
    return (
      <div className="flex flex-col items-center mt-20 text-white gap-6 px-4">
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
            <p className="text-red-500 font-bold text-xl">Error al guardar la partida. 🚨</p>
          )}
          
          {submitState === 'success' && finalResult && (
            <div className="animate-in fade-in zoom-in duration-500">
              <p className="text-green-500 font-bold text-2xl mb-2">¡Partida guardada oficialmente! ✅</p>
              {finalResult.isAdjusted && (
                <p className="text-orange-400 text-sm mt-2">
                  (El Juez ajustó tu puntaje por desincronización)
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white flex flex-col items-center pt-10 px-4 font-sans">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <div className="bg-black/40 px-4 py-2 rounded-lg font-bold">
          Pregunta {currentIndex + 1}/10
        </div>
        <div className="text-[#E50914] text-2xl font-bold">
          {(timeLeft / 1000).toFixed(1)}s
        </div>
        <div className="bg-black/40 px-4 py-2 rounded-lg font-bold text-green-400">
          Pts: {score}
        </div>
      </div>

      <div className="w-full max-w-md bg-[#09090b] p-6 rounded-xl shadow-2xl border border-gray-800 mb-8 min-h-37.5 flex items-center justify-center text-center">
        <h2 className="text-xl md:text-2xl font-bold">{currentQuestion.text}</h2>
      </div>

      <div className="w-full max-w-md grid grid-cols-1 gap-4">
        {currentQuestion.options.map((option, idx) => {
          let bgColor = 'bg-blue-800 hover:bg-blue-700';
          
          if (selectedOption === option) {
            bgColor = isCorrect ? 'bg-green-600' : 'bg-red-600';
          } else if (selectedOption !== null) {
             bgColor = 'bg-gray-700 opacity-50 cursor-not-allowed'; 
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={selectedOption !== null}
              className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-200 shadow-md ${bgColor}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}