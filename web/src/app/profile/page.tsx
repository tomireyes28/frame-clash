// web/src/app/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { profileService, UserProfileData } from '@/services/profile.service';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type ProfileTab = 'STATS' | 'ACHIEVEMENTS' | 'HISTORY';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('STATS');
  const [selectedTitle, setSelectedTitle] = useState<string>('Cinéfilo');
  const [achievementFilter, setAchievementFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfileData(data);
        setSelectedTitle(data.user.defaultTitle || 'Cinéfilo');
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-slate-400 font-mono text-xs">Cargando Perfil...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4">
        <p className="text-rose-400 font-bold text-xs mb-3">🚨 {error || 'Error al cargar perfil'}</p>
        <Link href="/" className="px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const { user, stats, achievements, recentActivity } = profileData;
  const progressPercentage = Math.min(100, (user.currentLevelProgress / user.xpForNextLevel) * 100);
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  const filteredAchievements = achievements.filter((a) => {
    if (achievementFilter === 'ALL') return true;
    return a.category === achievementFilter;
  });

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      {/* 1. HERO HEADER COMPACTO */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-2xl border-2 border-amber-400 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 shadow-md">
            {user.image ? (
              <Image src={user.image} alt={user.name || 'Avatar'} fill sizes="56px" className="object-cover" />
            ) : (
              <span className="text-2xl">🎬</span>
            )}
            <div className="absolute bottom-0 w-full bg-amber-400 text-slate-950 text-center text-[8px] font-black uppercase py-0.2">
              NVL {user.level}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black text-white truncate uppercase">
              {user.name || 'Cinéfilo'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400">Título:</span>
              <select
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer focus:outline-none"
              >
                {user.unlockedTitles.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    👑 {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Barra de XP */}
        <div>
          <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-400 mb-1">
            <span>Progreso a Nivel {user.level + 1}</span>
            <span className="text-sky-400 font-bold">
              {user.currentLevelProgress} / {user.xpForNextLevel} XP
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. PESTAÑAS DE NAVEGACIÓN */}
      <div className="w-full flex border-b border-slate-800 gap-1 mb-3">
        <button
          onClick={() => setActiveTab('STATS')}
          className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer border-b-2 ${
            activeTab === 'STATS'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 Stats
        </button>
        <button
          onClick={() => setActiveTab('ACHIEVEMENTS')}
          className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center justify-center gap-1 ${
            activeTab === 'ACHIEVEMENTS'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🏅 Logros</span>
          <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded-full font-mono">
            {unlockedAchievementsCount}/{achievements.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer border-b-2 ${
            activeTab === 'HISTORY'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚔️ Historial
        </button>
      </div>

      {/* 3. PESTAÑA: ESTADÍSTICAS */}
      {activeTab === 'STATS' && (
        <div className="w-full flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-center shadow-md">
              <span className="text-lg">🎮</span>
              <p className="text-lg font-black text-white font-mono">{stats.totalGames}</p>
              <p className="text-[9px] text-slate-400 uppercase font-semibold">Partidas</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-center shadow-md">
              <span className="text-lg">🏆</span>
              <p className="text-lg font-black text-emerald-400 font-mono">
                {stats.highestScore.toLocaleString('es-AR')}
              </p>
              <p className="text-[9px] text-slate-400 uppercase font-semibold">Récord Pts</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-center shadow-md">
              <span className="text-lg">📈</span>
              <p className="text-lg font-black text-sky-400 font-mono">
                {stats.averageScore.toLocaleString('es-AR')}
              </p>
              <p className="text-[9px] text-slate-400 uppercase font-semibold">Promedio</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-center shadow-md">
              <span className="text-lg">🃏</span>
              <p className="text-lg font-black text-amber-400 font-mono">{stats.uniqueCardsCount}</p>
              <p className="text-[9px] text-slate-400 uppercase font-semibold">Cartas</p>
            </div>
          </div>

          {/* Desglose por Modos */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2 shadow-md">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Desglose de Modos
            </h3>
            <div className="flex justify-between text-xs py-1 border-b border-slate-800/80">
              <span className="text-slate-400">🔥 Roguelike Max:</span>
              <span className="font-bold text-white font-mono">Onda {stats.rogueliteMaxWave}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-800/80">
              <span className="text-slate-400">👑 Dominio Estrellas:</span>
              <span className="font-bold text-amber-400 font-mono">⭐ {stats.totalDominationStars} / 930</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-800/80">
              <span className="text-slate-400">👑 Categorías Dominadas:</span>
              <span className="font-bold text-yellow-300 font-mono">{stats.masteredCategoriesCount} / 31</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-400">🎲 Victorias Draft:</span>
              <span className="font-bold text-purple-300 font-mono">{stats.draftWinsCount} 🏆</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: LOGROS */}
      {activeTab === 'ACHIEVEMENTS' && (
        <div className="w-full flex flex-col gap-2.5">
          {/* Filtros */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { key: 'ALL', label: 'Todos' },
              { key: 'GAMES', label: 'Partidas' },
              { key: 'COLLECTION', label: 'Colección' },
              { key: 'ROGUELITE', label: 'Roguelike' },
              { key: 'DOMINATION', label: 'Dominio' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setAchievementFilter(f.key)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  achievementFilter === f.key
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lista de Logros */}
          <div className="flex flex-col gap-2">
            {filteredAchievements.map((ach) => {
              const progressPct = Math.min(100, (ach.currentProgress / ach.maxProgress) * 100);

              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border transition shadow-sm ${
                    ach.isUnlocked
                      ? 'bg-gradient-to-r from-amber-950/30 to-slate-900 border-amber-400/60'
                      : 'bg-slate-900/80 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl">{ach.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white truncate">
                          {ach.title}
                        </h4>
                        {ach.isUnlocked && (
                          <span className="text-[9px] font-black text-emerald-400 font-mono">
                            ✅ Desbloqueado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        {ach.description}
                      </p>

                      <div className="w-full mt-2">
                        <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                          <span>Progreso</span>
                          <span className={ach.isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {ach.currentProgress}/{ach.maxProgress}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${ach.isUnlocked ? 'bg-amber-400' : 'bg-slate-700'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PESTAÑA: HISTORIAL */}
      {activeTab === 'HISTORY' && (
        <div className="w-full flex flex-col gap-2">
          {recentActivity.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-8">
              Aún no has jugado partidas registradas.
            </p>
          ) : (
            recentActivity.map((session, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-slate-900/90 p-3 rounded-2xl border border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎬</span>
                  <div>
                    <p className="font-bold text-xs text-slate-200">Partida Finalizada</p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      {new Date(session.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
                <div className="font-black text-sm text-emerald-400 font-mono">
                  {session.score.toLocaleString('es-AR')} pts
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}