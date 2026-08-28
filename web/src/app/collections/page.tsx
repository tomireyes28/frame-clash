// web/src/app/collections/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { collectionsService, UserCollectionItem } from '@/services/collections.service';
import GameCard, { CardData } from '@/components/game/GameCard';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '@/utils/audio';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<UserCollectionItem[]>([]);
  const [selectedSet, setSelectedSet] = useState<UserCollectionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCollections = async () => {
    try {
      const data = await collectionsService.getUserCollections();
      setCollections(data);
      if (selectedSet) {
        const updated = data.find((c) => c.id === selectedSet.id);
        if (updated) setSelectedSet(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleClaimReward = async (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    setClaimingId(collectionId);
    setSuccessMessage(null);

    try {
      const res = await collectionsService.claimReward(collectionId);
      soundManager.playVictory();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#38BDF8', '#8B5CF6'],
      });
      setSuccessMessage(res.message);
      await loadCollections();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al reclamar recompensa.');
      }
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-slate-400 font-mono text-xs">Cargando Sets...</p>
      </div>
    );
  }

  const completedSetsCount = collections.filter((c) => c.isCompleted).length;

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      {/* HEADER */}
      <div className="w-full text-center mb-3">
        <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
          ✨ Colecciones Temáticas
        </span>
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
          Sets de Cine
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Completá sagas temáticas para desbloquear botines exclusivos.
        </p>
      </div>

      {/* BANNER DE ÉXITO */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-3 rounded-2xl text-center text-xs font-bold shadow-md flex items-center justify-between"
        >
          <span>🎉 {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-emerald-400">✕</button>
        </motion.div>
      )}

      {/* ESTADÍSTICAS MÓVILES */}
      <div className="w-full grid grid-cols-2 gap-2 mb-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl text-center shadow-md">
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-mono">Disponibles</span>
          <span className="text-sm font-black text-amber-400 font-mono block">
            {collections.length} Sets
          </span>
        </div>
        <div className="border-l border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Completados</span>
          <span className="text-sm font-black text-emerald-400 font-mono block">
            ✨ {completedSetsCount} / {collections.length}
          </span>
        </div>
      </div>

      {/* LISTA VERTICAL DE SETS */}
      <div className="w-full flex flex-col gap-3">
        {collections.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            <span className="text-3xl block mb-2">🎬</span>
            <p className="font-bold text-slate-300">Aún no hay colecciones publicadas.</p>
          </div>
        ) : (
          collections.map((set) => {
            const progressPercentage = Math.min(100, (set.ownedCardsCount / Math.max(1, set.totalCards)) * 100);

            let rewardLabel = `+${set.rewardValue} 🪙`;
            if (set.rewardType === 'STARDUST') rewardLabel = `+${set.rewardValue} ✨`;
            else if (set.rewardType === 'PACK') rewardLabel = `Sobre ${set.rewardValue} 📦`;

            return (
              <motion.div
                key={set.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedSet(set)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-md ${
                  set.isCompleted
                    ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-400/80 shadow-amber-950/20'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        {set.name}
                      </h3>
                      {set.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {set.description}
                        </p>
                      )}
                    </div>

                    <span className="bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 text-[10px] font-mono font-bold text-amber-400 shrink-0 ml-1">
                      {rewardLabel}
                    </span>
                  </div>

                  {/* Previsualización 4 miniaturas */}
                  <div className="grid grid-cols-4 gap-1.5 my-2">
                    {set.cards.slice(0, 4).map((card) => (
                      <div
                        key={card.id}
                        className={`aspect-[2/3] rounded-lg overflow-hidden relative border ${
                          card.isOwned
                            ? 'border-amber-400/80 shadow-sm'
                            : 'border-slate-800 bg-slate-950 opacity-40 grayscale'
                        }`}
                      >
                        {card.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${card.posterPath}`}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500 font-bold p-0.5">
                            {card.title}
                          </div>
                        )}
                        {!card.isOwned && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px]">
                            🔒
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progreso y Reclamo */}
                <div className="mt-1 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-400 mb-1">
                    <span>Progreso</span>
                    <span className={set.isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {set.ownedCardsCount}/{set.totalCards} ({Math.round(progressPercentage)}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-2">
                    <div
                      className={`h-full rounded-full ${
                        set.isCompleted ? 'bg-amber-400' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {set.isCompleted && !set.isClaimed && (
                    <button
                      disabled={claimingId === set.id}
                      onClick={(e) => handleClaimReward(e, set.id)}
                      className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer animate-pulse"
                    >
                      {claimingId === set.id ? 'Reclamando...' : `🎁 ¡Reclamar ${rewardLabel}!`}
                    </button>
                  )}

                  {set.isClaimed && (
                    <div className="w-full py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold text-center rounded-xl font-mono">
                      ✅ Recompensa Reclamada
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* MODAL DETALLADO */}
      <AnimatePresence>
        {selectedSet && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-4 shadow-2xl flex flex-col gap-3 relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedSet(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>

              <div className="text-center pr-4">
                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase">
                  Álbum Temático
                </span>
                <h2 className="text-base font-black text-white uppercase mt-1">
                  {selectedSet.name}
                </h2>
              </div>

              {/* GRILLA DE CARTAS EN MODAL (2 COLUMNAS) */}
              <div className="grid grid-cols-2 gap-2 my-1">
                {selectedSet.cards.map((card) => {
                  const cardData: CardData = {
                    id: card.id,
                    tmdbId: card.tmdbId,
                    title: card.title,
                    year: card.year,
                    posterPath: card.posterPath,
                    rarity: card.rarity,
                  };

                  return (
                    <div
                      key={card.id}
                      className={`relative aspect-[2/3] rounded-xl overflow-hidden ${
                        card.isOwned ? 'opacity-100 shadow-md' : 'opacity-40 grayscale border border-slate-800'
                      }`}
                    >
                      <GameCard card={cardData} size="full" isFlippable={card.isOwned} />
                      {!card.isOwned && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-1 text-center z-20">
                          <span className="text-lg">🔒</span>
                          <span className="text-[9px] font-bold text-slate-300 line-clamp-2">
                            {card.title}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedSet.isCompleted && !selectedSet.isClaimed && (
                <button
                  disabled={claimingId === selectedSet.id}
                  onClick={(e) => handleClaimReward(e, selectedSet.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                >
                  {claimingId === selectedSet.id ? 'Reclamando...' : '🎁 ¡Reclamar Recompensa!'}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
