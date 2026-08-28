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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 font-mono text-xs">Cargando Roguelike...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-3.5 py-1 px-2 pb-6">
      {/* HEADER */}
      <div className="text-center">
        <span className="bg-orange-950/80 text-orange-400 border border-orange-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
          🔥 Modo Supervivencia Infinita
        </span>
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
          Modo Roguelike
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Tandas infinitas con <strong className="text-amber-400">puntaje mínimo creciente</strong>.
        </p>
      </div>

      {/* ESTADÍSTICAS MÓVILES COMPACTAS */}
      <div className="w-full grid grid-cols-3 gap-1.5 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl text-center shadow-lg">
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Récord</span>
          <span className="text-sm font-black text-amber-400 font-mono">
            Onda {progress?.bestWave || 0}
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Mejor Score</span>
          <span className="text-sm font-black text-emerald-400 font-mono">
            {(progress?.bestScore || 0).toLocaleString('es-AR')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Corridas</span>
          <span className="text-sm font-black text-sky-400 font-mono">
            {progress?.totalRuns || 0}
          </span>
        </div>
      </div>

      {/* VITRINA DE POWER-UPS MÓVIL */}
      <div className="w-full bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>⚡</span>
              <span>Power-Ups ({selectedCardIds.length}/3)</span>
            </h3>
            <span className="text-[9px] text-slate-400 block">Tocá hasta 3 cartas</span>
          </div>
          <Link
            href="/inventory"
            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline"
          >
            Ver Álbum ➔
          </Link>
        </div>

        {inventory.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-center text-slate-400 text-xs">
            No tenés cartas en tu colección. ¡Podés jugar sin power-ups o comprar sobres en la tienda!
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
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
                  className={`relative cursor-pointer rounded-xl p-0.5 transition-all ${
                    isSelected
                      ? 'ring-2 ring-amber-400 bg-amber-500/20 scale-102 shadow-md shadow-amber-950/40'
                      : 'opacity-65 hover:opacity-100 hover:bg-slate-800/60'
                  }`}
                >
                  <GameCard card={cardData} size="full" isFlippable={false} />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black text-[9px] shadow-md z-30">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTÓN 3D "JUICY" */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onStartRun(selectedCardIds)}
        disabled={isLoading}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_5px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer disabled:opacity-50 mt-1"
      >
        {isLoading ? 'Iniciando Corrida...' : '🔥 ¡COMENZAR CORRIDA INFINITA!'}
      </motion.button>
    </div>
  );
}
