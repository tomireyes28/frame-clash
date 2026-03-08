// src/components/game/GameScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { gameService, SubmitGameResponse } from '@/services/game.service';

export default function GameScreen() {
  const { questions, currentIndex, status, score, activePowerUps } = useGameStore();
  const currentQuestion = questions[currentIndex];
  
  const { timeLeft, selectedOption, isCorrect, hiddenOptions, handleOptionClick, activatePowerUp } = useGameEngine(currentQuestion);

  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [finalResult, setFinalResult] = useState<SubmitGameResponse | null>(null); 

  useEffect(() => {
    if (status === 'finished' && submitState === 'idle') {
      const submitTimer = setTimeout(() => {
        setSubmitState('loading');
        
        // 🧹 Limpiamos el payload: Chau userId hardcodeado
        const payload = {
          categoryId: '28', // (Nota: Si esto también estaba hardcodeado, a futuro lo podés leer del store)
          claimedScore: score,
          auditLog: useGameStore.getState().auditLog, 
          usedPowerUps: useGameStore.getState().usedPowerUps, 
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
            <div className="text-red-500">
              <p className="font-bold text-xl">Error al guardar la partida. 🚨</p>
            </div>
          )}
          
          {submitState === 'success' && finalResult && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-6 mt-4">
              <p className="text-green-500 font-bold text-xl">¡Partida guardada oficialmente! ✅</p>
              
              {/* ========================================= */}
              {/* 💰 NUEVO: BLOQUE VISUAL DE RECOMPENSAS */}
              {/* ========================================= */}
              <div className="w-full bg-black/40 rounded-xl p-4 flex justify-around border border-gray-700 shadow-inner">
                {/* Monedas */}
                <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2s' }}>
                  <span className="text-4xl drop-shadow-lg mb-1">🪙</span>
                  <span className="text-yellow-400 font-black text-3xl">+{finalResult.coinsEarned}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Monedas</span>
                </div>
                
                {/* Experiencia */}
                <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.2s' }}>
                  <span className="text-4xl drop-shadow-lg mb-1">⚡</span>
                  <span className="text-blue-400 font-black text-3xl">+{finalResult.xpEarned}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Exp</span>
                </div>
              </div>
              {/* ========================================= */}

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
          if (hiddenOptions.includes(option)) {
            return <div key={idx} className="w-full py-4 px-6 invisible" />;
          }

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

      {activePowerUps.length > 0 && (
        <div className="w-full max-w-md mt-10 p-4 bg-black/30 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400 font-bold mb-3 uppercase tracking-wider text-center">Cartas de Poder</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {activePowerUps.map(pu => (
              <button
                key={pu.id}
                onClick={() => activatePowerUp(pu)}
                disabled={selectedOption !== null} 
                className={`bg-linear-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg border-2 border-purple-400 transition-all active:scale-95 ${selectedOption !== null ? 'opacity-50 grayscale cursor-not-allowed' : 'animate-pulse'}`}
              >
                ✨ {pu.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}