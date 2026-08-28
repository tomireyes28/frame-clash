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
    <main className="min-h-screen bg-slate-950 text-white">
      {status === 'idle' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 max-w-4xl mx-auto pb-20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent tracking-wider uppercase mb-2">
              Trivia Clásica
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">
              Elegí una de las 31 categorías oficiales y competí por las 3 estrellas ⭐⭐⭐
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="w-full max-w-md mb-6 bg-rose-950/60 border border-rose-600 text-rose-200 px-4 py-3 rounded-xl text-center text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Selector de Tipo de Categoría (Tabs) */}
          <div className="flex gap-2 mb-6 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSelectedTab('genre')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                selectedTab === 'genre'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎭 Géneros (14)
            </button>
            <button
              onClick={() => setSelectedTab('decade')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                selectedTab === 'decade'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⏳ Décadas (6)
            </button>
            <button
              onClick={() => setSelectedTab('theme')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                selectedTab === 'theme'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌟 Temáticas (11)
            </button>
          </div>

          {/* Grilla de Categorías */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8 max-h-[420px] overflow-y-auto pr-1">
            {categoriesByType.map((cat: CategoryInfo) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-102'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-2xl md:text-3xl">{cat.icon}</span>
                  <span className="text-xs md:text-sm font-bold text-slate-200 line-clamp-1">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botón de Jugar */}
          <div className="w-full max-w-md flex flex-col gap-3">
            <button
              onClick={() => handleStartGame()}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-orange-950/50 transition-all hover:scale-102 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {isLoading ? 'Cargando Ronda...' : '▶ ¡Jugar Ronda (10 Preguntas)!'}
            </button>

            <Link
              href="/"
              className="text-center text-xs text-slate-400 hover:text-white py-2"
            >
              ← Volver al Menú Principal
            </Link>
          </div>
        </div>
      )}

      {(status === 'playing' || status === 'finished') && (
        <GameScreen />
      )}
    </main>
  );
}