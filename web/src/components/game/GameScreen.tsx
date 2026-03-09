// src/components/game/GameScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { gameService, SubmitGameResponse } from '@/services/game.service';
import GameCard, { CardData } from '@/components/game/GameCard';
import { motion, PanInfo } from 'framer-motion'; // 🔥 Importamos Framer Motion y PanInfo para la física

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
        
        const payload = {
          categoryId: '28', 
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

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white flex flex-col items-center pt-10 px-4 font-sans pb-32">
      {/* HEADER DE ESTADÍSTICAS */}
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

      {/* LA PREGUNTA */}
      <div className="w-full max-w-md bg-[#09090b] p-6 rounded-xl shadow-2xl border border-gray-800 mb-8 min-h-37.5 flex items-center justify-center text-center relative z-0">
        <h2 className="text-xl md:text-2xl font-bold">{currentQuestion.text}</h2>
      </div>

      {/* LAS OPCIONES */}
      <div className="w-full max-w-md grid grid-cols-1 gap-4 relative z-0">
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

      {/* 🔥 LA MANO DEL JUGADOR: Drag & Drop */}
      {activePowerUps.length > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 flex justify-center pointer-events-none z-50">
          <div className="flex gap-2 md:gap-4 items-end justify-center pointer-events-auto bg-black/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none px-4 pt-4 pb-2 rounded-t-2xl">
            {activePowerUps.map((pu) => {
              const cardData: CardData = {
                id: pu.id,
                tmdbId: pu.tmdbId,
                title: pu.title,
                year: pu.year,
                posterPath: pu.posterPath,
                rarity: pu.rarity,
                powerUpAction: pu.action,
                powerUpValue: pu.value,
              };

              // Si ya se respondió, deshabilitamos el arrastre
              const isDisabled = selectedOption !== null;

              return (
                <motion.div 
                  key={pu.id} 
                  // 🔥 FÍSICA DE FRAMER MOTION
                  drag={!isDisabled ? true : false} // Activamos el drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Efecto "banda elástica", siempre vuelve a su lugar
                  dragElastic={0.4} // Qué tan elástico se siente
                  onDragEnd={(event: any, info: PanInfo) => {
                    // Si el usuario arrastró la carta hacia arriba (Y negativo) más de 100 píxeles, dispara el poder
                    if (info.offset.y < -100) {
                      activatePowerUp(pu);
                    }
                  }}
                  whileDrag={{ scale: 1.1, zIndex: 100, rotate: -2 }} // Efecto al agarrarla
                  className={`relative ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-grab active:cursor-grabbing animate-in slide-in-from-bottom-10 hover:-translate-y-2 transition-transform duration-300'}`}
                >
                  {/* Tutorial visual súper sutil */}
                  {!isDisabled && (
                    <div className="absolute -top-6 left-0 right-0 text-center opacity-0 hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-400 pointer-events-none">
                      ⬆ Arrastrar
                    </div>
                  )}

                  <GameCard 
                    card={cardData} 
                    size="sm" 
                    isFlippable={false} 
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}