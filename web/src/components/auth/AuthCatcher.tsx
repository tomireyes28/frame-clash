'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

export function AuthCatcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Buscamos el "?token=..." en la URL
    const token = searchParams.get('token');

    if (token) {
      // 2. Lo guardamos en una cookie súper segura por 7 días
      Cookies.set('frameclash_token', token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax' 
      });

      // 3. Limpiamos la URL sin recargar la página (pasamos de /?token=123 a /)
      router.replace('/');
      
      // Opcional: Acá podrías disparar una función de tu useGameStore para avisar que ya está logueado
    }
  }, [searchParams, router]);

  return null; 
}