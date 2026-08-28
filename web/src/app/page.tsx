'use client';

import { useEffect, useState, Suspense } from 'react';
import Cookies from 'js-cookie';
import { AuthCatcher } from '@/components/auth/AuthCatcher';
import { useRouter } from 'next/navigation';

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

  const handleLogout = () => {
    Cookies.remove('frameclash_token');
    setIsLogged(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white px-4">
      <Suspense fallback={null}>
        <AuthCatcher />
      </Suspense>

      <div className="text-center max-w-md w-full">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent mb-2 tracking-wider drop-shadow-2xl">
          FRAME CLASH
        </h1>
        <p className="text-sm md:text-base mb-8 text-slate-400 font-light">
          La trivia definitiva de cine & cartas coleccionables
        </p>

        {isLogged ? (
          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col gap-3 shadow-2xl">
            <p className="text-emerald-400 font-bold text-xs">✅ Sesión iniciada y sincronizada</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/play/pvp-live')}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 hover:from-red-500 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
              >
                ⚡ Coliseo PvP en Vivo (WebSockets)
              </button>
              <button
                onClick={() => router.push('/play/pvp-async')}
                className="w-full py-3 bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
              >
                ⚔️ Liga de Duelos 1v1 (PvP ELO)
              </button>
              <button
                onClick={() => router.push('/play/draft')}
                className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/50 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
              >
                🎲 Modo Draft (3 Rondas + 5 Power-Ups)
              </button>
              <button
                onClick={() => router.push('/play/domination')}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/50 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
              >
                👑 Modo Dominio (31 Campañas)
              </button>
              <button
                onClick={() => router.push('/play/roguelite')}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
              >
                🔥 Modo Roguelike (Infinito)
              </button>
              <button
                onClick={() => router.push('/play')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-102 cursor-pointer"
              >
                🎮 Trivia Clásica Rápida
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-102 cursor-pointer"
              >
                🛒 Tienda de Sobres (5 Tiers)
              </button>
              <button
                onClick={() => router.push('/inventory')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-102 cursor-pointer"
              >
                🃏 Álbum de Colección
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 underline hover:text-white mt-1"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-orange-950/50 hover:scale-105 transition-all cursor-pointer"
          >
            Iniciar sesión con Google
          </button>
        )}
      </div>
    </main>
  );
}