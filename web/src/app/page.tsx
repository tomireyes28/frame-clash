// web/src/app/page.tsx
'use client'; // Le decimos a Next.js que este componente corre en el navegador

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // 1. Buscamos si la URL trae el "?token=..."
    const token = searchParams.get('token');
    
    if (token) {
      // 2. Lo guardamos en el almacenamiento del navegador
      localStorage.setItem('frameclash_token', token);
      
      // 3. ¡Magia de Next.js! Limpiamos la URL sin recargar la página
      router.replace('/');
    }

    // Comprobamos si ya estamos logueados para cambiar la interfaz
    if (localStorage.getItem('frameclash_token')) {
      setIsLogged(true);
    }
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0f3a61] text-white">
      <div className="text-center">
        <h1 className="text-6xl font-black text-[#E50914] mb-2 tracking-wider drop-shadow-lg">
          FRAME CLASH
        </h1>
        <p className="text-xl mb-8 font-light">La trivia definitiva de cine</p>
        
        {isLogged ? (
          <div className="bg-[#09090b] p-6 rounded-lg border border-gray-700">
            <p className="text-green-400 font-bold mb-4">✅ Sesión iniciada y segura</p>
            <button 
              onClick={() => {
                localStorage.removeItem('frameclash_token');
                setIsLogged(false);
              }}
              className="text-sm text-gray-400 underline hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button 
            onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
            className="px-8 py-4 bg-[#E50914] text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            Iniciar sesión con Google
          </button>
        )}
      </div>
    </main>
  );
}