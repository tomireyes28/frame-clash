// web/src/app/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { profileService, UserProfileData, AchievementItem } from '@/services/profile.service';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 font-mono text-sm">Cargando Perfil Cinéfilo...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <p className="text-rose-400 font-bold text-lg mb-4">🚨 {error || 'Error al cargar el perfil'}</p>
        <Link href="/" className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">
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
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* ========================================================= */}
        {/* 1. HERO HEADER: AVATAR, NIVEL, TÍTULO Y ECONOMÍA          */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-2 border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-2xl relative overflow-hidden"
        >
          {/* Avatar con halo dorado */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl border-4 border-amber-400/80 overflow-hidden bg-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.25)] shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'Avatar'}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <span className="text-5xl">🎬</span>
            )}
            <div className="absolute bottom-0 w-full z-10 bg-amber-400 text-slate-950 text-center text-[10px] font-black uppercase tracking-widest py-0.5">
              NVL {user.level}
            </div>
          </div>

          {/* Info y Billetera */}
          <div className="flex-1 w-full text-center md:text-left flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white drop-shadow-md">
                  {user.name || 'Cinéfilo Anónimo'}
                </h1>
                
                {/* Selector de Título Desbloqueado */}
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="text-xs text-slate-400 font-medium">Título:</span>
                  <select
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                    className="bg-amber-400/10 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-xl cursor-pointer focus:outline-none"
                  >
                    {user.unlockedTitles.map((t) => (
                      <option key={t} value={t} className="bg-slate-900 text-white">
                        👑 {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billetera */}
              <div className="flex items-center justify-center md:justify-end gap-3 shrink-0">
                <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 shadow-md">
                  <span className="text-base">🪙</span>
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {user.coins.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 shadow-md">
                  <span className="text-base">✨</span>
                  <span className="text-xs font-black text-purple-300 font-mono">
                    {user.stardust.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Experiencia */}
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 font-mono">
                <span>Progreso hacia Nivel {user.level + 1}</span>
                <span className="text-sky-400 font-bold">
                  {user.currentLevelProgress} / {user.xpForNextLevel} XP ({Math.round(progressPercentage)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* 2. PESTAÑAS DE NAVEGACIÓN                                 */}
        {/* ========================================================= */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('STATS')}
            className={`pb-3 px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              activeTab === 'STATS'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('ACHIEVEMENTS')}
            className={`pb-3 px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'ACHIEVEMENTS'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏅 Logros & Insignias</span>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {unlockedAchievementsCount}/{achievements.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-3 px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              activeTab === 'HISTORY'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚔️ Historial Reciente
          </button>
        </div>

        {/* ========================================================= */}
        {/* 3. PESTAÑA: ESTADÍSTICAS POR MODO                         */}
        {/* ========================================================= */}
        {activeTab === 'STATS' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Grilla Superior */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center shadow-lg">
                <span className="text-2xl block mb-1">🎮</span>
                <p className="text-2xl md:text-3xl font-black text-white font-mono">{stats.totalGames}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Partidas Jugadas</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center shadow-lg">
                <span className="text-2xl block mb-1">🏆</span>
                <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                  {stats.highestScore.toLocaleString('es-AR')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Récord de Puntos</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center shadow-lg">
                <span className="text-2xl block mb-1">📈</span>
                <p className="text-2xl md:text-3xl font-black text-sky-400 font-mono">
                  {stats.averageScore.toLocaleString('es-AR')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Promedio por Partida</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center shadow-lg">
                <span className="text-2xl block mb-1">🃏</span>
                <p className="text-2xl md:text-3xl font-black text-amber-400 font-mono">{stats.uniqueCardsCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Cartas Únicas</p>
              </div>
            </div>

            {/* Desglose por Modos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Roguelike */}
              <div className="bg-slate-900/70 border border-orange-500/30 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🔥</span>
                    <h3 className="text-sm font-black uppercase text-orange-400 tracking-wider">
                      Modo Roguelike
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Onda Máxima:</span>
                      <span className="font-bold text-white font-mono">Onda {stats.rogueliteMaxWave}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Puntaje Récord:</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {stats.rogueliteHighScore.toLocaleString('es-AR')} pts
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/play/roguelite"
                  className="mt-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-xs font-bold text-center rounded-xl border border-orange-500/40 transition"
                >
                  Jugar Roguelike ➔
                </Link>
              </div>

              {/* Dominio */}
              <div className="bg-slate-900/70 border border-amber-500/30 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">👑</span>
                    <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider">
                      Modo Dominio
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estrellas Totales:</span>
                      <span className="font-bold text-amber-400 font-mono">⭐ {stats.totalDominationStars} / 930</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Categorías Dominadas:</span>
                      <span className="font-bold text-yellow-300 font-mono">👑 {stats.masteredCategoriesCount} / 31</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/play/domination"
                  className="mt-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold text-center rounded-xl border border-amber-500/40 transition"
                >
                  Jugar Dominio ➔
                </Link>
              </div>

              {/* Draft & Colección */}
              <div className="bg-slate-900/70 border border-purple-500/30 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎲</span>
                    <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider">
                      Draft & Sets
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Torneos Draft Ganados:</span>
                      <span className="font-bold text-purple-300 font-mono">{stats.draftWinsCount} 🏆</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sets Completados:</span>
                      <span className="font-bold text-white font-mono">{stats.completedSetsCount} 📚</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cartas Legendarias:</span>
                      <span className="font-bold text-amber-400 font-mono">{stats.legendaryCardsCount} 💎</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/play/draft"
                  className="mt-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold text-center rounded-xl border border-purple-500/40 transition"
                >
                  Jugar Draft ➔
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 4. PESTAÑA: LOGROS & MEDALLAS                             */}
        {/* ========================================================= */}
        {activeTab === 'ACHIEVEMENTS' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Filtros de Categoría */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: 'Todos' },
                { key: 'GAMES', label: 'Partidas' },
                { key: 'COLLECTION', label: 'Colección' },
                { key: 'ROGUELITE', label: 'Roguelike' },
                { key: 'DOMINATION', label: 'Dominio' },
                { key: 'DRAFT', label: 'Draft' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setAchievementFilter(f.key)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    achievementFilter === f.key
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grilla de Logros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((ach) => {
                const progressPct = Math.min(100, (ach.currentProgress / ach.maxProgress) * 100);

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-lg ${
                      ach.isUnlocked
                        ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-400/70 shadow-amber-950/20'
                        : 'bg-slate-900/60 border-slate-800 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                            ach.isUnlocked
                              ? 'bg-amber-400/20 border-amber-400/50 shadow-md shadow-amber-400/30'
                              : 'bg-slate-950 border-slate-800 grayscale'
                          }`}
                        >
                          {ach.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider truncate">
                              {ach.title}
                            </h4>
                            {ach.isUnlocked ? (
                              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono shrink-0">
                                ✅ Desbloqueado
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 shrink-0">
                                🔒 En Progreso
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {ach.description}
                          </p>
                        </div>
                      </div>

                      {/* Progreso */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1 font-mono">
                          <span>Progreso:</span>
                          <span className={ach.isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {ach.currentProgress} / {ach.maxProgress}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              ach.isUnlocked ? 'bg-amber-400' : 'bg-slate-700'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recompensas */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500 uppercase font-semibold">Recompensa:</span>
                      <div className="flex items-center gap-2">
                        {ach.rewardCoins > 0 && (
                          <span className="text-amber-400 font-bold">+{ach.rewardCoins} 🪙</span>
                        )}
                        {ach.rewardStardust > 0 && (
                          <span className="text-purple-300 font-bold">+{ach.rewardStardust} ✨</span>
                        )}
                        {ach.unlockedTitle && (
                          <span className="text-sky-300 font-bold">👑 {ach.unlockedTitle}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 5. PESTAÑA: HISTORIAL RECIENTE                            */}
        {/* ========================================================= */}
        {activeTab === 'HISTORY' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl"
          >
            <h2 className="text-base font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">
              Últimas Partidas en el Coliseo
            </h2>

            {recentActivity.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-8">
                Aún no has disputado partidas registradas.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentActivity.map((session, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎬</span>
                      <div>
                        <p className="font-bold text-xs text-slate-200">Partida Finalizada</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(session.createdAt).toLocaleDateString('es-AR')} •{' '}
                          {new Date(session.createdAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="font-black text-base text-emerald-400 font-mono">
                      {session.score.toLocaleString('es-AR')} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}