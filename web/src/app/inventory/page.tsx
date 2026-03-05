// src/app/inventory/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { gameService, InventoryCard } from '@/services/game.service';
import Image from 'next/image';

// URL base de TMDB para armar las imágenes de los pósters
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export default function InventoryPage() {
  const [cards, setCards] = useState<InventoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargamos la colección apenas entra a la página
    gameService.getInventory()
      .then((data) => {
        setCards(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Diccionario de colores según la rareza de la carta
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'bg-yellow-500 text-black shadow-yellow-500/50';
      case 'EPIC': return 'bg-purple-600 text-white shadow-purple-600/50';
      case 'RARE': return 'bg-blue-500 text-white shadow-blue-500/50';
      case 'UNCOMMON': return 'bg-green-500 text-white shadow-green-500/50';
      default: return 'bg-gray-400 text-black shadow-gray-400/50'; // COMMON
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f3a61] flex items-center justify-center">
        <p className="text-[#E50914] text-2xl font-bold animate-pulse">Cargando colección...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f3a61] p-6 text-white font-sans pb-20">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-lg" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
          Mi <span className="text-[#E50914]">Colección</span>
        </h1>
        <p className="text-gray-300 mt-2 font-bold">Cartas obtenidas: {cards.length}</p>
      </div>

      {/* GRILLA DE CARTAS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cards.map((card) => {
          const isEquippedInArcade = card.equippedModes.includes('ARCADE');

          return (
            <div 
              key={card.id} 
              className={`bg-[#09090b] rounded-xl overflow-hidden border-2 flex flex-col transition-all hover:scale-105 hover:z-10 shadow-xl ${isEquippedInArcade ? 'border-[#E50914]' : 'border-gray-800'}`}
            >
             {/* PÓSTER OPTIMIZADO */}
                <div className="relative aspect-2/3 w-full bg-gray-900">
                  {card.posterPath ? (
                    <Image 
                      src={`${TMDB_IMAGE_BASE}${card.posterPath}`} 
                      alt={card.title}
                      fill // Se adapta al contenedor relative que tiene aspect-[2/3]
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      className="object-cover opacity-90"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600">Sin Imagen</div>
                  )}
                
                {/* BADGE DE RAREZA */}
                <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-black uppercase rounded shadow-lg ${getRarityColor(card.rarity)}`}>
                  {card.rarity}
                </div>

                {/* CANTIDAD (DUPLICADAS) */}
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-xs font-bold rounded-full border border-gray-600">
                  x{card.quantity}
                </div>
              </div>

              {/* INFO DE LA CARTA */}
              <div className="p-4 flex flex-col grow">
                <h3 className="font-bold text-sm md:text-base leading-tight mb-1 line-clamp-2">{card.title} ({card.year})</h3>
                
                {/* PODER */}
                <div className="mt-2 mb-4 text-xs text-gray-400 bg-gray-900 p-2 rounded border border-gray-800">
                  {card.powerUpAction ? (
                    <span className="text-indigo-400 font-bold flex items-center gap-1">
                      ✨ {card.powerUpAction} {card.powerUpValue && `(${card.powerUpValue})`}
                    </span>
                  ) : (
                    <span>Sin habilidad activa</span>
                  )}
                </div>

                {/* BOTÓN INVENTARIO (Meta-juego) */}
                <button 
                  className={`mt-auto w-full py-2 font-bold uppercase tracking-wider text-sm rounded transition-colors border ${
                    card.quantity > 1 
                      ? 'bg-linear-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 border-yellow-400' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-700'
                  }`}
                >
                  {card.quantity > 1 ? '🌟 Mejorar Nivel' : '🔍 Inspeccionar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}