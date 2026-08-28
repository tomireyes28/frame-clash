// web/src/app/collections/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { collectionsService, UserCollectionItem, SetCardItem } from '@/services/collections.service';
import GameCard, { CardData } from '@/components/game/GameCard';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '@/utils/audio';
import Link from 'next/link';

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 font-mono text-sm">Cargando Álbumes y Sets...</p>
      </div>
    );
  }

  const completedSetsCount = collections.filter((c) => c.isCompleted).length;
  const claimedSetsCount = collections.filter((c) => c.isClaimed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent">
            Sets & Colecciones
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Completá sagas y álbumes temáticos para desbloquear recompensas exclusivas.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/shop"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition"
          >
            🛒 Comprar Sobres
          </Link>
          <Link
            href="/inventory"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            🃏 Mi Álbum General
          </Link>
        </div>
      </div>

      {/* BANNER DE ÉXITO */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-6 bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-4 rounded-2xl text-center text-sm font-bold shadow-xl flex items-center justify-between"
        >
          <span>🎉 {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </motion.div>
      )}

      {/* ESTADÍSTICAS GLOBALES */}
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-3 mb-8 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center shadow-xl">
        <div>
          <span className="text-xl md:text-2xl block mb-0.5">📚</span>
          <span className="text-lg md:text-2xl font-black text-amber-400 font-mono">
            {collections.length}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold block mt-0.5">
            Sets Disponibles
          </span>
        </div>

        <div className="border-x border-slate-800">
          <span className="text-xl md:text-2xl block mb-0.5">✨</span>
          <span className="text-lg md:text-2xl font-black text-emerald-400 font-mono">
            {completedSetsCount} / {collections.length}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold block mt-0.5">
            Sets Completados
          </span>
        </div>

        <div>
          <span className="text-xl md:text-2xl block mb-0.5">🎁</span>
          <span className="text-lg md:text-2xl font-black text-sky-400 font-mono">
            {claimedSetsCount}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold block mt-0.5">
            Premios Reclamados
          </span>
        </div>
      </div>

      {/* LISTADO DE SETS */}
      <div className="max-w-6xl mx-auto">
        {collections.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <span className="text-5xl block mb-3">🎬</span>
            <h3 className="text-lg font-bold text-slate-300">Aún no hay colecciones publicadas.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              El administrador puede curar y crear nuevos sets temáticos desde el panel de gestión.
            </p>
            <Link
              href="/admin/collections"
              className="inline-block mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              ⚙️ Ir al Panel de Creación de Sets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((set) => {
              const progressPercentage = Math.min(100, (set.ownedCardsCount / Math.max(1, set.totalCards)) * 100);

              let rewardLabel = `+${set.rewardValue} Monedas 🪙`;
              if (set.rewardType === 'STARDUST') rewardLabel = `+${set.rewardValue} Polvo Estelar ✨`;
              else if (set.rewardType === 'PACK') rewardLabel = `Sobre ${set.rewardValue} 📦`;

              return (
                <motion.div
                  key={set.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedSet(set)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
                    set.isCompleted
                      ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-400/80 shadow-amber-950/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header del Set */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider">
                          {set.name}
                        </h3>
                        {set.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                            {set.description}
                          </p>
                        )}
                      </div>

                      <span className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-xs font-mono font-bold text-amber-400 shrink-0 ml-2">
                        {rewardLabel}
                      </span>
                    </div>

                    {/* Previsualización de Cartas del Set */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 my-4">
                      {set.cards.map((card) => {
                        return (
                          <div
                            key={card.id}
                            className={`aspect-[2/3] rounded-xl overflow-hidden relative border ${
                              card.isOwned
                                ? 'border-amber-400/80 shadow-md'
                                : 'border-slate-800 bg-slate-950/80 opacity-40 grayscale'
                            }`}
                          >
                            {card.posterPath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${card.posterPath}`}
                                alt={card.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-center p-1 text-slate-500 font-bold">
                                {card.title}
                              </div>
                            )}

                            {!card.isOwned && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs">
                                🔒
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Barra de Progreso y Botón de Reclamo */}
                  <div className="mt-2 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 font-mono">
                      <span>Progreso del Set</span>
                      <span className={set.isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                        {set.ownedCardsCount} / {set.totalCards} ({Math.round(progressPercentage)}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          set.isCompleted
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md shadow-amber-400/50'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    {set.isCompleted && !set.isClaimed && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={claimingId === set.id}
                        onClick={(e) => handleClaimReward(e, set.id)}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/50 transition-all cursor-pointer animate-pulse"
                      >
                        {claimingId === set.id ? 'Reclamando...' : `🎁 ¡Reclamar ${rewardLabel}!`}
                      </motion.button>
                    )}

                    {set.isClaimed && (
                      <div className="w-full py-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center rounded-xl font-mono">
                        ✅ Recompensa Reclamada
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETALLADO DEL SET */}
      <AnimatePresence>
        {selectedSet && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border-2 border-slate-700 w-full max-w-3xl rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedSet(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
              >
                ✕
              </button>

              <div className="text-center pr-6">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider">
                  Álbum Temático
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mt-2">
                  {selectedSet.name}
                </h2>
                {selectedSet.description && (
                  <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                    {selectedSet.description}
                  </p>
                )}
              </div>

              {/* GRILLA DE CARTAS EN GRANDE */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-2">
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
                      className={`relative aspect-[2/3] rounded-2xl overflow-hidden ${
                        card.isOwned ? 'opacity-100 shadow-xl' : 'opacity-35 grayscale border-2 border-slate-800'
                      }`}
                    >
                      <GameCard card={cardData} size="full" isFlippable={card.isOwned} />
                      {!card.isOwned && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-2 text-center z-20">
                          <span className="text-2xl mb-1">🔒</span>
                          <span className="text-[10px] font-bold text-slate-300 line-clamp-2">
                            {card.title}
                          </span>
                          <span className="text-[9px] text-amber-400 font-mono mt-1">
                            ¡Búscala en sobres!
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
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
                >
                  {claimingId === selectedSet.id ? 'Reclamando...' : '🎁 ¡Reclamar Recompensa de Set!'}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
