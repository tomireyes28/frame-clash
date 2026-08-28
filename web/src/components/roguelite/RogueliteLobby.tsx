// web/src/components/roguelite/RogueliteLobby.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { rogueliteService, RogueliteProgressResponse } from '@/services/roguelite.service';
import { gameService, InventoryCard } from '@/services/game.service';
import GameCard, { CardData } from '@/components/game/GameCard';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface RogueliteLobbyProps {
  onStartRun: (equippedCardIds: string[]) => void;
  isLoading: boolean;
}

export default function RogueliteLobby({ onStartRun, isLoading }: RogueliteLobbyProps) {
  const [progress, setProgress] = useState<RogueliteProgressResponse | null>(null);
  const [inventory, setInventory] = useState<InventoryCard[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([rogueliteService.getProgress(), gameService.getInventory()])
      .then(([prog, inv]) => {
        setProgress(prog);
        setInventory(inv);
        // Pre-seleccionar hasta 3 cartas con power-up
        const powerUpCards = inv.filter((c) => c.powerUpAction).slice(0, 3);
        setSelectedCardIds(powerUpCards.map((c) => c.id));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingData(false));
  }, []);

  const toggleCardSelection = (cardId: string) => {
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== cardId));
    } else {
      if (selectedCardIds.length >= 3) {
        alert('Podés equipar un máximo de 3 cartas de Power-Up para la corrida.');
        return;
      }
      setSelectedCardIds([...selectedCardIds, cardId]);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 font-mono text-sm">Cargando Coliseo Roguelike...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-4">
      {/* TÍTULO Y DESCRIPCIÓN */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider mb-2">
          Modo Roguelike
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Tandas infinitas de trivia con <span className="text-amber-400 font-bold">puntaje mínimo creciente</span>.
          Elegí tu camino entre 3 categorías por ronda y acumulá monedas, experiencia y sobres legendarios.
        </p>
      </div>

      {/* ESTADÍSTICAS HISTÓRICAS */}
      <div className="w-full grid grid-cols-3 gap-3 md:gap-4 bg-slate-900/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-slate-800 shadow-xl text-center">
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl mb-1">🏆</span>
          <span className="text-xl md:text-3xl font-black text-amber-400 font-mono">
            Ronda {progress?.bestWave || 0}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Récord de Ronda
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-slate-800">
          <span className="text-2xl md:text-3xl mb-1">🔥</span>
          <span className="text-xl md:text-3xl font-black text-emerald-400 font-mono">
            {(progress?.bestScore || 0).toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Mejor Puntaje
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl mb-1">⚔️</span>
          <span className="text-xl md:text-3xl font-black text-sky-400 font-mono">
            {progress?.totalRuns || 0}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Corridas Jugadas
          </span>
        </div>
      </div>

      {/* SELECCIÓN DE POWER-UPS INICIALES */}
      <div className="w-full bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              ⚡ Seleccioná tus Power-Ups de Inicio
            </h3>
            <p className="text-xs text-slate-400">
              Elegí hasta 3 cartas con power-up de tu colección ({selectedCardIds.length}/3 equipadas)
            </p>
          </div>
          <Link
            href="/inventory"
            className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold"
          >
            Ver Álbum Completo
          </Link>
        </div>

        {inventory.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 text-center text-slate-400 text-xs">
            No tenés cartas en tu colección. ¡Podés jugar sin power-ups o comprar sobres en la tienda!
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-56 overflow-y-auto pr-1">
            {inventory.map((card) => {
              const isSelected = selectedCardIds.includes(card.id);
              const cardData: CardData = {
                id: card.id,
                tmdbId: card.tmdbId,
                title: card.title,
                year: card.year,
                posterPath: card.posterPath,
                rarity: card.rarity,
                level: card.level,
                powerUpAction: card.powerUpAction,
                powerUpValue: card.powerUpValue,
              };

              return (
                <div
                  key={card.id}
                  onClick={() => toggleCardSelection(card.id)}
                  className={`relative cursor-pointer rounded-xl p-1 transition-all ${
                    isSelected
                      ? 'ring-2 ring-amber-400 bg-amber-500/10 scale-102'
                      : 'opacity-70 hover:opacity-100 hover:bg-slate-800/60'
                  }`}
                >
                  <GameCard card={cardData} size="full" isFlippable={false} />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shadow-md z-30">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTÓN DE COMIENZO DE CORRIDA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStartRun(selectedCardIds)}
        disabled={isLoading}
        className="w-full max-w-md py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xl rounded-2xl shadow-2xl shadow-orange-950/60 transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50"
      >
        {isLoading ? 'Iniciando Corrida...' : '🔥 ¡Comenzar Corrida Infinita!'}
      </motion.button>
    </div>
  );
}
