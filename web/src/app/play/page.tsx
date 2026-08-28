// web/src/app/play/page.tsx
'use client';

import { useState } from 'react';
import GameScreen from '@/components/game/GameScreen';
import { useGameStore } from '@/store/useGameStore';
import { gameService } from '@/services/game.service';
import { OFFICIAL_CATEGORIES, CategoryInfo } from '@/utils/categories';
import Link from 'next/link';

export default function PlayPage() {
  const { status, startGame } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ACTION');
  const [selectedTab, setSelectedTab] = useState<'genre' | 'decade' | 'theme'>('genre');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoriesByType = OFFICIAL_CATEGORIES.filter((c) => c.type === selectedTab);

  const handleStartGame = async (categoryKey?: string) => {
    const catToPlay = categoryKey || selectedCategory;
    setIsLoading(true);
    setError(null);

    try {
      const { questions, powerUps } = await gameService.startRound(catToPlay);
      if (!questions || questions.length === 0) {
        throw new Error(`No hay preguntas disponibles aún para la categoría seleccionada.`);
      }
      startGame(questions, powerUps);
    } catch (err: unknown) {
      console.error('Error al iniciar partida:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Hubo un error al iniciar la partida.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {status === 'idle' && (
        <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
          {/* Header */}
          <div className="text-center mb-3">
            <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
              🎮 Partida Rápida
            </span>
            <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent tracking-wider uppercase">
              Trivia Clásica
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              10 Preguntas determinísticas por categoría oficial ⭐⭐⭐
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="w-full mb-3 bg-rose-950/60 border border-rose-600 text-rose-200 px-3 py-2 rounded-xl text-center text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Selector de Tipo de Categoría (Pills) */}
          <div className="w-full flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-2.5">
            <button
              onClick={() => setSelectedTab('genre')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedTab === 'genre'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              🎭 Géneros (14)
            </button>
            <button
              onClick={() => setSelectedTab('decade')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedTab === 'decade'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              ⏳ Décadas (6)
            </button>
            <button
              onClick={() => setSelectedTab('theme')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedTab === 'theme'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              🌟 Temáticas (11)
            </button>
          </div>

          {/* Grilla de Categorías 2 Columnas */}
          <div className="w-full grid grid-cols-2 gap-2 mb-3 max-h-72 overflow-y-auto pr-1">
            {categoriesByType.map((cat: CategoryInfo) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/20 border-amber-400 ring-1 ring-amber-400/50 shadow-md scale-102'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botón de Jugar 3D */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => handleStartGame()}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_5px_0_#9a3412] active:translate-y-1 active:shadow-none transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Cargando Ronda...' : '▶ ¡JUGAR (10 PREGUNTAS)!'}
            </button>
          </div>
        </div>
      )}

      {(status === 'playing' || status === 'finished') && (
        <div className="w-full p-2">
          <GameScreen />
        </div>
      )}
    </div>
  );
}