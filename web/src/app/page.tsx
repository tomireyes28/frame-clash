'use client';

import { useEffect, useState } from 'react';
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
    // 2. Usamos variables de entorno para que funcione en local y en producción
    // Asegurate de crear un archivo .env.local en el frontend con NEXT_PUBLIC_API_URL=http://localhost:3000
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleLogout = () => {
    Cookies.remove('frameclash_token');
    setIsLogged(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0f3a61] text-white">
      {/* Componente fantasma que atrapa el token de la URL */}
      <AuthCatcher /> 

      <div className="text-center">
        <h1 className="text-6xl font-black text-[#E50914] mb-2 tracking-wider drop-shadow-lg">
          FRAME CLASH
        </h1>
        <p className="text-xl mb-8 font-light">La trivia definitiva de cine</p>
        
        {isLogged ? (
          <div className="bg-[#09090b] p-6 rounded-lg border border-gray-700 flex flex-col gap-4">
            <p className="text-green-400 font-bold">✅ Sesión iniciada y segura</p>
            <button 
              onClick={() => router.push('/play')}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
            >
              Entrar al Coliseo
            </button>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-400 underline hover:text-white mt-2"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-8 py-4 bg-[#E50914] text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            Iniciar sesión con Google
          </button>
        )}
      </div>
    </main>
  );
}