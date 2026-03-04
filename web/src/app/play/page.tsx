// src/app/play/page.tsx
'use client';

import { useState } from 'react';
import GameScreen from '@/components/game/GameScreen';
import { useGameStore } from '@/store/useGameStore';
import { gameService } from '@/services/game.service'; // <-- Importamos tu servicio limpio

export default function PlayPage() {
  const { status, startGame } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      // 1. Llamamos al servicio (Categoría 28 = Acción)
      const questions = await gameService.startRound('28');
      
      // 2. Le pasamos las preguntas a Zustand
      startGame(questions);
    } catch (error) {
      console.error("Error al iniciar partida:", error);
      alert("Hubo un error al iniciar el juego.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f3a61]">
      {status === 'idle' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-5xl font-bold text-white mb-8 tracking-widest uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
            Frame <span className="text-[#E50914]">Clash</span>
          </h1>
          
          <button 
            onClick={handleStartGame}
            disabled={isLoading}
            className="bg-[#E50914] hover:bg-red-700 text-white font-bold py-4 px-12 rounded-full text-2xl transition-transform active:scale-95 shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'CARGANDO...' : 'JUGAR PARTIDA RÁPIDA'}
          </button>
        </div>
      )}

      {(status === 'playing' || status === 'finished') && (
        <GameScreen />
      )}
    </main>
  );
}