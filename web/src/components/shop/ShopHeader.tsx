// web/src/components/shop/ShopHeader.tsx
'use client';

import React from 'react';

export default function ShopHeader() {
  return (
    <div className="w-full text-center mb-3">
      <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
        🛒 Tienda de Sobres
      </span>
      <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
        La Bóveda de Cartas
      </h1>
      <p className="text-[11px] text-slate-400 mt-0.5">
        Abrí sobres para desbloquear películas, subir de nivel y obtener polvo estelar ✨.
      </p>
    </div>
  );
}