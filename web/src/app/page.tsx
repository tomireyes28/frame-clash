// web/src/app/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import Cookies from 'js-cookie';
import { AuthCatcher } from '@/components/auth/AuthCatcher';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="flex flex-col w-full p-3 md:p-4 gap-4 pb-6">
      <Suspense fallback={null}>
        <AuthCatcher />
      </Suspense>

      {/* HEADER LOGO */}
      <div className="text-center pt-2">
        <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-xl">
          FRAME CLASH
        </h1>
        <p className="text-[11px] text-slate-400 font-medium">
          Trivia de Cine & Cartas Coleccionables
        </p>
      </div>

      {!isLogged ? (
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center flex flex-col gap-4 shadow-xl my-auto">
          <span className="text-4xl block">🎬</span>
          <h2 className="text-lg font-black text-white">¡Bienvenido a la Arena!</h2>
          <p className="text-xs text-slate-400">
            Iniciá sesión para coleccionar cartas, equipar power-ups y competir en los rankings globales.
          </p>
          <button
            onClick={handleLogin}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_5px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            Iniciar Sesión con Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {/* ========================================================= */}
          {/* 1. HERO BANNER: BATTLE ROYALE (10 JUGADORES)             */}
          {/* ========================================================= */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/play/battle-royale')}
            className="relative rounded-3xl p-4.5 bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-950/40 cursor-pointer overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-2">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                👑 MODO DESTACADO
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                10 Jugadores
              </span>
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wide group-hover:text-amber-300 transition">
              Battle Royale
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-tight mb-3">
              5 Rondas de supervivencia. Los 2 peores puntajes quedan eliminados.
            </p>

            <button className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_0_#b45309] group-active:translate-y-1 group-active:shadow-none transition">
              ⚔️ ¡ENTRAR A LA ARENA!
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
              onClick={() => router.push('/play/pvp-live')}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-red-950/60 to-slate-900 border border-red-500/60 shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">
                  ⚡ EN DIRECTO
                </span>
                <h4 className="text-sm font-black text-white leading-tight">
                  Coliseo 1v1
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Duelo en tiempo real simultáneo.
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
              onClick={() => router.push('/play/pvp-async')}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-rose-950/60 to-slate-900 border border-rose-500/60 shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-1">
                  🏆 RANKING ELO
                </span>
                <h4 className="text-sm font-black text-white leading-tight">
                  Liga de Duelos
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Desafíos por turnos y puntos ELO.
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
          <div className="flex flex-col gap-2.5">
            {/* MODO DRAFT */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/play/draft')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/50 shadow-md cursor-pointer flex items-center justify-between"
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
              onClick={() => router.push('/play/domination')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/50 shadow-md cursor-pointer flex items-center justify-between"
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
              onClick={() => router.push('/play/roguelite')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/60 to-slate-900 border border-orange-500/50 shadow-md cursor-pointer flex items-center justify-between"
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
              onClick={() => router.push('/play')}
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
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => router.push('/collections')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
            >
              <span className="text-lg">✨</span>
              <div>
                <span className="text-[10px] font-bold text-white block">Sets de Películas</span>
                <span className="text-[8px] text-slate-400">Colecciones temáticas</span>
              </div>
            </button>

            <button
              onClick={() => router.push('/inventory')}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
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