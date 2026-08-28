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
      {/* Componente que atrapa el token de la URL envuelto en Suspense */}
      <Suspense fallback={null}>
        <AuthCatcher />
      </Suspense>

      <div className="text-center max-w-lg">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent mb-2 tracking-wider drop-shadow-2xl">
          FRAME CLASH
        </h1>
        <p className="text-lg md:text-xl mb-8 text-slate-400 font-light">
          La trivia definitiva de cine & cartas coleccionables
        </p>

        {isLogged ? (
          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 flex flex-col gap-4 shadow-2xl">
            <p className="text-emerald-400 font-bold">✅ Sesión iniciada y sincronizada</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/play')}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all hover:scale-102"
              >
                🎮 Jugar Trivia Clásica
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-950/40 transition-all hover:scale-102"
              >
                🛒 Tienda de Sobres
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 underline hover:text-white mt-2"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-orange-950/50 hover:scale-105 transition-all"
          >
            Iniciar sesión con Google
          </button>
        )}
      </div>
    </main>
  );
}