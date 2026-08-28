// web/src/app/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import Cookies from 'js-cookie';
import { AuthCatcher } from '@/components/auth/AuthCatcher';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '@/utils/audio';
import { inventoryService, InventoryCard } from '@/services/inventory.service';
import { profileService, UserProfileData } from '@/services/profile.service';
import GameCard, { CardData } from '@/components/game/GameCard';

// Carta por defecto para el showcase en caso de no tener inventario
const DEFAULT_HERO_CARD: CardData = {
  id: 'demo-godfather',
  tmdbId: 238,
  title: 'El Padrino',
  year: 1972,
  posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  rarity: 'LEGENDARY',
  level: 1,
  powerUpAction: 'ELIMINATE_50_50',
  powerUpValue: 2,
};

export default function Home() {
  const [isLogged, setIsLogged] = useState(false);
  const [activeTab, setActiveTab] = useState<'MULTIPLAYER' | 'CAMPAIGN'>('MULTIPLAYER');
  const [heroCard, setHeroCard] = useState<CardData>(DEFAULT_HERO_CARD);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = setTimeout(() => {
      const token = Cookies.get('frameclash_token');
      if (token) {
        setIsLogged(true);

        // Cargar carta líder destacada del inventario
        inventoryService
          .getInventory()
          .then((cards) => {
            if (cards.length > 0) {
              // Elegir la carta de mayor nivel o legendaria
              const sorted = [...cards].sort((a, b) => (b.level || 1) - (a.level || 1));
              const top = sorted[0];
              setHeroCard({
                id: top.id,
                tmdbId: top.tmdbId,
                title: top.title,
                year: top.year,
                posterPath: top.posterPath,
                rarity: top.rarity,
                level: top.level || 1,
                powerUpAction: top.powerUpAction,
                powerUpValue: top.powerUpValue,
              });
            }
          })
          .catch(() => {});

        // Cargar perfil para nivel y stats
        profileService
          .getProfile()
          .then((data) => setProfile(data))
          .catch(() => {});
      }
    }, 0);

    return () => clearTimeout(checkSession);
  }, []);

  const handleLogin = () => {
    soundManager.playButtonClick();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleNav = (url: string) => {
    soundManager.playButtonClick();
    router.push(url);
  };

  const handleTabChange = (tab: 'MULTIPLAYER' | 'CAMPAIGN') => {
    soundManager.playButtonClick();
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col w-full p-3 gap-3.5 pb-6 font-sans relative">
      <Suspense fallback={null}>
        <AuthCatcher />
      </Suspense>

      {/* 🌟 LOGO & BRAND HEADER */}
      <div className="text-center pt-1 relative">
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-md"
        >
          FRAME CLASH
        </motion.h1>
        <p className="text-[9px] font-mono text-amber-300/80 font-bold uppercase tracking-widest">
          🎬 Trivia de Cine & Cartas TCG
        </p>
      </div>

      {!isLogged ? (
        <div className="bg-slate-900/90 border-2 border-slate-800 p-6 rounded-3xl text-center flex flex-col gap-4 shadow-2xl my-auto">
          <span className="text-5xl block animate-bounce">🎬</span>
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            ¡Bienvenido a la Arena!
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Iniciá sesión para coleccionar cartas con fotogramas reales, subir de nivel tu mazo y competir en los rankings mundiales.
          </p>
          <button
            onClick={handleLogin}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_5px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            Iniciar Sesión con Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* ========================================================= */}
          {/* 1. ESCENARIO CENTRAL: CARTA LÍDER DEL MAZO (3D SHOWCASE) */}
          {/* ========================================================= */}
          <div className="relative rounded-3xl p-3.5 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border-2 border-amber-400/40 shadow-xl flex items-center justify-between overflow-hidden group">
            {/* Resplandor de fondo del escenario */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col justify-between z-10 max-w-[55%]">
              <div>
                <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full inline-block mb-1.5">
                  ⭐ Tu Carta Líder
                </span>
                <h3 className="text-sm font-black text-white uppercase tracking-wide truncate">
                  {heroCard.title}
                </h3>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Año {heroCard.year || 2024} • Nivel {heroCard.level || 1}
                </span>
              </div>

              <div className="mt-2.5">
                <button
                  onClick={() => handleNav('/inventory')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[9px] font-black uppercase rounded-lg transition cursor-pointer"
                >
                  Cambiar Mazo ➔
                </button>
              </div>
            </div>

            {/* Carta 3D flotante */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              onClick={() => handleNav('/inventory')}
              className="w-24 aspect-[2/3] shrink-0 cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.4)] rounded-xl"
            >
              <GameCard card={heroCard} size="full" isFlippable={false} />
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* 2. BOTÓN GIGANTE ARCADE: ¡A LA BATALLA! (Battle Royale)  */}
          {/* ========================================================= */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNav('/play/battle-royale')}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-none transition flex items-center justify-between cursor-pointer border-2 border-yellow-200/60"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⚔️</span>
              <div className="text-left">
                <span className="block leading-none">¡A LA BATALLA!</span>
                <span className="text-[9px] text-slate-900/80 font-bold font-mono">
                  BATTLE ROYALE (10 JUGADORES)
                </span>
              </div>
            </div>
            <span className="text-base font-black">➔</span>
          </motion.button>

          {/* ========================================================= */}
          {/* 3. SELECTOR DE ARENAS / PESTAÑAS DINÁMICAS (TABS)         */}
          {/* ========================================================= */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleTabChange('MULTIPLAYER')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'MULTIPLAYER'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚔️</span>
              <span>Multijugador (PvP)</span>
            </button>

            <button
              onClick={() => handleTabChange('CAMPAIGN')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'CAMPAIGN'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏆</span>
              <span>Campañas & Solo</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* 4. CONTENIDO DE MODOS POR PESTAÑA                         */}
          {/* ========================================================= */}
          <AnimatePresence mode="wait">
            {activeTab === 'MULTIPLAYER' ? (
              <motion.div
                key="tab-multiplayer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-2"
              >
                {/* COLISEO 1V1 EN VIVO */}
                <div
                  onClick={() => handleNav('/play/pvp-live')}
                  className="p-3 rounded-2xl bg-gradient-to-b from-red-950/80 to-slate-900 border-2 border-red-500/60 shadow-lg cursor-pointer flex flex-col justify-between hover:border-red-400 transition"
                >
                  <div>
                    <span className="text-[8px] font-black text-red-400 uppercase tracking-widest block mb-0.5">
                      ⚡ DIRECTO
                    </span>
                    <h4 className="text-xs font-black text-white">Coliseo 1v1</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                      Duelo simultáneo en tiempo real.
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-red-400 mt-2">
                    Luchar ➔
                  </span>
                </div>

                {/* LIGA DE DUELOS ELO */}
                <div
                  onClick={() => handleNav('/play/pvp-async')}
                  className="p-3 rounded-2xl bg-gradient-to-b from-rose-950/80 to-slate-900 border-2 border-rose-500/60 shadow-lg cursor-pointer flex flex-col justify-between hover:border-rose-400 transition"
                >
                  <div>
                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest block mb-0.5">
                      🏆 RANKING ELO
                    </span>
                    <h4 className="text-xs font-black text-white">Liga ELO</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                      Desafíos asíncronos y ranking.
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-rose-400 mt-2">
                    Desafiar ➔
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tab-campaign"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-2"
              >
                {/* MODO DOMINIO */}
                <div
                  onClick={() => handleNav('/play/domination')}
                  className="p-2.5 rounded-2xl bg-gradient-to-b from-amber-950/70 to-slate-900 border border-amber-500/50 shadow-md cursor-pointer hover:border-amber-400 transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-lg block mb-0.5">👑</span>
                    <h4 className="text-xs font-black text-white">Dominio</h4>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      31 Campañas con estrellas ⭐
                    </p>
                  </div>
                  <span className="text-[9px] text-amber-400 font-bold mt-1">
                    Jugar ➔
                  </span>
                </div>

                {/* ROGUELIKE INFINITO */}
                <div
                  onClick={() => handleNav('/play/roguelite')}
                  className="p-2.5 rounded-2xl bg-gradient-to-b from-orange-950/70 to-slate-900 border border-orange-500/50 shadow-md cursor-pointer hover:border-orange-400 transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-lg block mb-0.5">🔥</span>
                    <h4 className="text-xs font-black text-white">Roguelike</h4>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      Rondas crecientes & cofre
                    </p>
                  </div>
                  <span className="text-[9px] text-orange-400 font-bold mt-1">
                    Supervivencia ➔
                  </span>
                </div>

                {/* MODO DRAFT */}
                <div
                  onClick={() => handleNav('/play/draft')}
                  className="p-2.5 rounded-2xl bg-gradient-to-b from-purple-950/70 to-slate-900 border border-purple-500/50 shadow-md cursor-pointer hover:border-purple-400 transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-lg block mb-0.5">🎲</span>
                    <h4 className="text-xs font-black text-white">Modo Draft</h4>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      3 Rondas con recarga
                    </p>
                  </div>
                  <span className="text-[9px] text-purple-400 font-bold mt-1">
                    Elegir ➔
                  </span>
                </div>

                {/* TRIVIA RÁPIDA */}
                <div
                  onClick={() => handleNav('/play')}
                  className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md cursor-pointer hover:border-slate-600 transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-lg block mb-0.5">🎮</span>
                    <h4 className="text-xs font-bold text-slate-200">Trivia Directa</h4>
                    <p className="text-[9px] text-slate-500 leading-tight">
                      10 preguntas clásicas
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold mt-1">
                    Rápida ➔
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================= */}
          {/* 5. ACCESOS RÁPIDOS: SETS Y ÁLBUM                         */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <button
              onClick={() => handleNav('/collections')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-400/60 rounded-2xl text-left transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span className="text-lg">✨</span>
              <div className="truncate">
                <span className="text-[10px] font-bold text-white block truncate">
                  Sets de Películas
                </span>
                <span className="text-[8px] text-slate-400 block font-mono">
                  Colecciones temáticas
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNav('/inventory')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-400/60 rounded-2xl text-left transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span className="text-lg">🃏</span>
              <div className="truncate">
                <span className="text-[10px] font-bold text-white block truncate">
                  Álbum de Cartas
                </span>
                <span className="text-[8px] text-slate-400 block font-mono">
                  Ver inventario 3D
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}