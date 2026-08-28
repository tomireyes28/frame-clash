// web/src/app/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import Cookies from 'js-cookie';
import { AuthCatcher } from '@/components/auth/AuthCatcher';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { soundManager } from '@/utils/audio';

export default function Home() {
  const [isLogged, setIsLogged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = setTimeout(() => {
      const token = Cookies.get('frameclash_token');
      if (token) {
        setIsLogged(true);
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

  return (
    <div className="flex flex-col w-full p-3 md:p-4 gap-3.5 pb-8 relative overflow-hidden">
      <Suspense fallback={null}>
        <AuthCatcher />
      </Suspense>

      {/* 🌟 CINEMATIC BACKGROUND GLOW */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-amber-500/15 via-orange-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* HEADER LOGO */}
      <div className="text-center pt-1 relative z-10">
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-xl"
        >
          FRAME CLASH
        </motion.h1>
        <p className="text-[10px] font-mono text-amber-300/80 font-bold uppercase tracking-widest mt-0.5">
          🎬 Trivia de Cine & Cartas TCG
        </p>
      </div>

      {!isLogged ? (
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center flex flex-col gap-4 shadow-xl my-auto relative z-10">
          <span className="text-4xl block animate-bounce">🎬</span>
          <h2 className="text-lg font-black text-white">¡Bienvenido a la Arena!</h2>
          <p className="text-xs text-slate-400">
            Iniciá sesión para coleccionar cartas con fotogramas, equipar power-ups y competir en los rankings globales.
          </p>
          <button
            onClick={handleLogin}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_5px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            Iniciar Sesión con Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 relative z-10">
          {/* ========================================================= */}
          {/* 1. HERO BANNER: BATTLE ROYALE (10 JUGADORES)             */}
          {/* ========================================================= */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNav('/play/battle-royale')}
            className="relative rounded-3xl p-4.5 bg-gradient-to-r from-amber-950/90 via-orange-950/70 to-slate-900 border-2 border-amber-400 shadow-2xl shadow-amber-950/60 cursor-pointer overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex justify-between items-start mb-2">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                👑 MODO DESTACADO
              </span>
              <span className="text-xs font-mono font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-lg border border-amber-400/30">
                10 Jugadores
              </span>
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wide group-hover:text-amber-300 transition">
              Battle Royale
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-tight mb-3">
              5 Rondas de supervivencia. Los 2 peores puntajes de cada ronda quedan eliminados.
            </p>

            <button className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_0_#b45309] group-active:translate-y-1 group-active:shadow-none transition flex items-center justify-center gap-1.5">
              <span>⚔️</span>
              <span>¡ENTRAR A LA ARENA!</span>
            </button>
          </motion.div>

          {/* ========================================================= */}
          {/* 2. GRID 2 COLUMNAS: MULTIJUGADOR 1V1                     */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* COLISEO EN VIVO */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNav('/play/pvp-live')}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-red-950/80 to-slate-900 border-2 border-red-500/60 shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">
                  ⚡ EN DIRECTO
                </span>
                <h4 className="text-sm font-black text-white leading-tight">
                  Coliseo 1v1
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Duelo sincrónico en tiempo real.
                </p>
              </div>
              <span className="text-[10px] font-bold text-red-400 mt-3 flex items-center gap-1">
                Batirse a Duelo ➔
              </span>
            </motion.div>

            {/* DUELOS ASÍNCRONOS ELO */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNav('/play/pvp-async')}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-rose-950/80 to-slate-900 border-2 border-rose-500/60 shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-1">
                  🏆 RANKING ELO
                </span>
                <h4 className="text-sm font-black text-white leading-tight">
                  Liga de Duelos
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Desafíos por turnos y puntos de ranking.
                </p>
              </div>
              <span className="text-[10px] font-bold text-rose-400 mt-3 flex items-center gap-1">
                Ver Desafíos ➔
              </span>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* 3. MODOS SINGLE PLAYER (DRAFT, DOMINIO, ROGUELIKE)       */}
          {/* ========================================================= */}
          <div className="flex flex-col gap-2">
            {/* MODO DRAFT */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNav('/play/draft')}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/70 to-slate-900 border border-purple-500/50 shadow-md cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎲</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Modo Draft (3 Rondas)
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    5 Power-ups con recarga del 100% cada ronda.
                  </p>
                </div>
              </div>
              <span className="text-xs text-purple-400 font-bold">➔</span>
            </motion.div>

            {/* MODO DOMINIO */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNav('/play/domination')}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-500/50 shadow-md cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👑</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Modo Dominio
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    31 Campañas de 10 Fases con estrellas ⭐.
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-bold">➔</span>
            </motion.div>

            {/* MODO ROGUELIKE */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNav('/play/roguelite')}
              className="p-3 rounded-2xl bg-gradient-to-r from-orange-950/70 to-slate-900 border border-orange-500/50 shadow-md cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Roguelike Infinito
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Rondas crecientes con cofre acumulativo.
                  </p>
                </div>
              </div>
              <span className="text-xs text-orange-400 font-bold">➔</span>
            </motion.div>

            {/* TRIVIA CLÁSICA */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNav('/play')}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🎮</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Trivia Clásica Rápida
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Partida de 10 preguntas directa por categorías.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-bold">➔</span>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* 4. ACCESOS RÁPIDOS A SETS Y ÁLBUM                        */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <button
              onClick={() => handleNav('/collections')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl text-left transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span className="text-lg">✨</span>
              <div>
                <span className="text-[10px] font-bold text-white block">Sets de Películas</span>
                <span className="text-[8px] text-slate-400">Colecciones temáticas</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('/inventory')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl text-left transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span className="text-lg">🃏</span>
              <div>
                <span className="text-[10px] font-bold text-white block">Álbum de Cartas</span>
                <span className="text-[8px] text-slate-400">Ver inventario 3D</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}