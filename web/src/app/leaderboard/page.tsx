// web/src/app/leaderboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { leaderboardService, LeaderboardResult } from '@/services/leaderboard.service';
import { motion } from 'framer-motion';
import Image from 'next/image';

// 📚 Vercel Best Practice: rendering-hoist-jsx
const TABS = [
  { key: 'SCORE', label: 'Récord Pts', icon: '🏆' },
  { key: 'ROGUELITE', label: 'Roguelike', icon: '🔥' },
  { key: 'DOMINATION', label: 'Dominio', icon: '⭐' },
  { key: 'COLLECTOR', label: 'Colección', icon: '🃏' },
];

const getRankBadge = (rank: number) => {
  if (rank === 1) return { icon: '👑', color: 'text-amber-400', border: 'border-amber-400 bg-amber-400/20' };
  if (rank === 2) return { icon: '🥈', color: 'text-slate-300', border: 'border-slate-300 bg-slate-300/20' };
  if (rank === 3) return { icon: '🥉', color: 'text-amber-600', border: 'border-amber-600 bg-amber-600/20' };
  return { icon: `#${rank}`, color: 'text-slate-400', border: 'border-slate-800 bg-slate-900' };
};

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

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      {/* HEADER */}
      <div className="w-full text-center mb-3">
        <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
          🏆 Competición Global
        </span>
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
          Salón de la Fama
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {leaderboardData?.description || 'Los mayores récords de Frame Clash.'}
        </p>
      </div>

      {/* SELECTOR DE RANKING (2X2 MÓVIL) */}
      <div className="w-full grid grid-cols-2 gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-md mb-3">
        {TABS.map((tab) => {
          const isActive = activeType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TU POSICIÓN PERSONAL */}
      {leaderboardData?.currentUser ? (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-400/80 p-3 rounded-2xl flex items-center justify-between shadow-md mb-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🌟</span>
            <div>
              <span className="text-[9px] text-amber-400 uppercase font-black tracking-wider block">
                Tu Posición Actual
              </span>
              <span className="text-xs font-bold text-white">
                Puesto #{leaderboardData.currentUser.rank}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-amber-400 font-mono block">
              {leaderboardData.currentUser.primaryMetric}
            </span>
            {leaderboardData.currentUser.secondaryMetric ? (
              <span className="text-[9px] text-slate-400 block font-medium">
                {leaderboardData.currentUser.secondaryMetric}
              </span>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {/* LISTADO DE JUGADORES */}
      <div className="w-full flex flex-col gap-1.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-slate-400 text-[10px] font-mono">Cargando ranking...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-950/50 border border-rose-600/50 p-4 rounded-2xl text-center text-xs text-rose-200">
            ⚠️ {error}
          </div>
        ) : !leaderboardData || leaderboardData.players.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-400">
            <span className="text-2xl block mb-1">👑</span>
            <p className="font-bold text-slate-300">Aún no hay puntuaciones en esta tabla.</p>
          </div>
        ) : (
          leaderboardData.players.map((player) => {
            const badge = getRankBadge(player.rank);

            return (
              <div
                key={player.userId}
                className={`p-2.5 rounded-2xl border flex items-center justify-between transition ${
                  player.isCurrentUser
                    ? 'bg-amber-950/40 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Ranking & Avatar & Nombre */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mono border shrink-0 ${badge.border} ${badge.color}`}
                  >
                    {badge.icon}
                  </div>

                  <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
                    {player.image ? (
                      <Image src={player.image} alt={player.name} fill sizes="32px" className="object-cover" />
                    ) : (
                      <span className="text-sm">🎬</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-white truncate max-w-[110px]">
                        {player.name}
                      </span>
                      {player.level ? (
                        <span className="text-[8px] bg-slate-800 text-amber-400 font-mono px-1 py-0.2 rounded font-bold">
                          ⭐{player.level}
                        </span>
                      ) : null}
                    </div>
                    {player.title ? (
                      <span className="text-[9px] text-slate-400 block truncate max-w-[110px]">
                        👑 {player.title}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Métricas */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-400 font-mono block">
                    {player.primaryMetric}
                  </span>
                  {player.secondaryMetric ? (
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {player.secondaryMetric}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}