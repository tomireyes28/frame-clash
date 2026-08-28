// web/src/app/leaderboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { leaderboardService, LeaderboardResult, LeaderboardPlayer } from '@/services/leaderboard.service';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const TABS = [
  { key: 'SCORE', label: '🏆 Récord Pts', icon: '🏆' },
  { key: 'ROGUELITE', label: '🔥 Roguelike', icon: '🔥' },
  { key: 'DOMINATION', label: '⭐ Dominio', icon: '⭐' },
  { key: 'COLLECTOR', label: '🃏 Colección', icon: '🃏' },
];

export default function LeaderboardPage() {
  const [activeType, setActiveType] = useState<string>('SCORE');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (type: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getLeaderboard(type);
      setLeaderboardData(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeType);
  }, [activeType]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '👑', color: 'text-amber-400', border: 'border-amber-400 bg-amber-400/20 shadow-amber-400/30' };
    if (rank === 2) return { icon: '🥈', color: 'text-slate-300', border: 'border-slate-300 bg-slate-300/20' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600', border: 'border-amber-600 bg-amber-600/20' };
    return { icon: `#${rank}`, color: 'text-slate-400', border: 'border-slate-800 bg-slate-900' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* ========================================================= */}
        {/* 1. ENCABEZADO Y TÍTULO                                    */}
        {/* ========================================================= */}
        <div className="text-center">
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider">
            Competición Global
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent mt-2">
            Salón de la Fama
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-lg mx-auto">
            {leaderboardData?.description || 'Los mayores récords cinematográficos de Frame Clash.'}
          </p>
        </div>

        {/* ========================================================= */}
        {/* 2. SELECTOR DE CATEGORÍAS DE RANKING                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          {TABS.map((tab) => {
            const isActive = activeType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveType(tab.key)}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-102'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 3. TU POSICIÓN PERSONAL EN EL RANKING                     */}
        {/* ========================================================= */}
        {leaderboardData?.currentUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400/80 p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-amber-950/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🌟</span>
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                  Tu Posición Actual
                </span>
                <span className="text-sm font-bold text-white">
                  Puesto #{leaderboardData.currentUser.rank}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm md:text-base font-black text-amber-400 font-mono block">
                {leaderboardData.currentUser.primaryMetric}
              </span>
              {leaderboardData.currentUser.secondaryMetric && (
                <span className="text-[10px] text-slate-400 block font-medium">
                  {leaderboardData.currentUser.secondaryMetric}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 4. LISTADO DE JUGADORES (TOP 50)                          */}
        {/* ========================================================= */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-xs font-mono">Calculando clasificaciones...</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-rose-400 text-xs">
            {error}
          </div>
        ) : leaderboardData?.players.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            <span className="text-4xl block mb-2">🎬</span>
            <p className="text-sm font-bold text-slate-300">Aún no hay registros en esta categoría.</p>
            <p className="text-xs text-slate-500 mt-1">¡Jugá una partida para inaugurar el podio!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {leaderboardData?.players.map((player, index) => {
                const rankStyle = getRankBadge(player.rank);
                const isTop3 = player.rank <= 3;

                return (
                  <motion.div
                    key={player.userId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex items-center justify-between shadow-lg ${
                      player.isCurrentUser
                        ? 'bg-amber-950/20 border-amber-400 ring-1 ring-amber-400/40'
                        : isTop3
                        ? 'bg-slate-900/90 border-slate-700'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* IZQUIERDA: PUESTO + AVATAR + NOMBRE */}
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      {/* Badge de Puesto */}
                      <div
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-sm md:text-base shrink-0 border ${rankStyle.border} ${rankStyle.color}`}
                      >
                        {rankStyle.icon}
                      </div>

                      {/* Avatar */}
                      <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                        {player.image ? (
                          <Image
                            src={player.image}
                            alt={player.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-lg flex items-center justify-center w-full h-full">👤</span>
                        )}
                      </div>

                      {/* Nombre y Nivel */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs md:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[220px]">
                            {player.name}
                          </h4>
                          {player.isCurrentUser && (
                            <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded font-mono">
                              TÚ
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-400/90 font-mono block">
                          Nivel {player.level}
                        </span>
                      </div>
                    </div>

                    {/* DERECHA: MÉTRICAS */}
                    <div className="text-right shrink-0 pl-2">
                      <span className="text-xs md:text-sm font-black text-amber-400 font-mono block">
                        {player.primaryMetric}
                      </span>
                      {player.secondaryMetric && (
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {player.secondaryMetric}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}