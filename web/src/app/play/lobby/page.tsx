// src/app/play/lobby/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { gameService, InventoryCard } from '@/services/game.service';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const MAX_SLOTS = 5;

// ============================================================================
// 🧱 SUB-COMPONENTE MODULAR: La Ranura de la Carta
// ============================================================================
const CardSlot = ({ card, index }: { card?: InventoryCard; index: number }) => {
  // Estado 1: Ranura Vacía
  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center w-full aspect-2/3 rounded-xl border-2 border-dashed border-gray-600 bg-[#09090b]/50 text-gray-500 hover:border-gray-400 transition-colors cursor-pointer">
        <span className="text-2xl mb-1">+</span>
        <span className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-center px-1">
          Ranura {index + 1}
        </span>
      </div>
    );
  }

  // Estado 2: Ranura Ocupada con una Carta
  return (
    <div className="relative w-full aspect-2/3 rounded-xl overflow-hidden border-2 border-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.3)] group cursor-help">
      <Image
        src={`${TMDB_IMAGE_BASE}${card.posterPath}`}
        alt={card.title}
        fill
        sizes="(max-width: 768px) 20vw, 15vw"
        className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />
      
      {/* Badge de Nivel */}
      <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/90 px-1.5 py-0.5 md:px-2 md:py-1 text-[8px] md:text-xs font-bold rounded-full border border-yellow-500 text-yellow-500">
        Nvl {card.level}
      </div>

      {/* Etiqueta del Poder (Abajo) */}
      <div className="absolute bottom-0 w-full bg-linear-to-t from-black via-black/80 to-transparent p-2 pt-6 text-center">
        <span className="text-[9px] md:text-xs font-black text-indigo-400 block truncate drop-shadow-md">
          {card.powerUpAction} {card.powerUpValue && `(${card.powerUpValue})`}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 🎮 COMPONENTE LÓGICO: Pantalla del Lobby
// ============================================================================
function LobbyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Si alguien entra a /lobby sin parámetros, asumimos ARCADE por defecto
  const mode = searchParams.get('mode') || 'ARCADE'; 

  const [equippedCards, setEquippedCards] = useState<InventoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Buscamos SOLO las cartas equipadas para este modo específico
    gameService.getEquippedCards(mode)
      .then(data => setEquippedCards(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [mode]);

  const handleStartGame = () => {
    // Acá lo mandamos a la pantalla de juego real pasando el modo
    router.push(`/play?mode=${mode}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f3a61] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-[#E50914] font-bold tracking-widest uppercase animate-pulse">Armando Mazo...</p>
      </div>
    );
  }

  // Truco Mágico: Creamos un array exacto de 5 elementos. 
  // Si tenemos 2 cartas, los primeros 2 índices tendrán datos, los otros 3 serán undefined.
  const slots = Array.from({ length: MAX_SLOTS }).map((_, index) => equippedCards[index]);

  return (
    <div className="min-h-screen bg-[#0f3a61] p-4 md:p-8 text-white flex flex-col items-center justify-between pb-10">
      
      {/* HEADER DINÁMICO */}
      <div className="text-center mt-6 mb-8">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
          Lobby <span className="text-[#E50914]">{mode}</span>
        </h1>
        <p className="text-gray-300 mt-2 text-sm md:text-base font-bold">
          {equippedCards.length} / 5 Cartas Equipadas
        </p>
      </div>

      {/* GRILLA DE LAS 5 RANURAS */}
      <div className="w-full max-w-4xl grid grid-cols-5 gap-2 md:gap-4 mb-10">
        {slots.map((card, index) => (
          <CardSlot key={card ? card.id : `empty-${index}`} card={card} index={index} />
        ))}
      </div>

      {/* ZONA DE ACCIÓN */}
      <div className="flex flex-col items-center w-full max-w-md">
        <button
          onClick={handleStartGame}
          className="group relative w-full py-4 bg-[#E50914] text-white font-black text-xl md:text-2xl uppercase tracking-widest rounded shadow-[0_0_20px_rgba(229,9,20,0.5)] hover:shadow-[0_0_40px_rgba(229,9,20,0.8)] hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10">¡Entrar al Coliseo!</span>
          {/* Brillo interior animado en el hover */}
          <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 rounded"></div>
        </button>
        <p className="mt-4 text-xs text-gray-400 text-center font-bold">
          Los usos permitidos por partida dependen del <span className="text-yellow-500">Nivel (Nvl)</span> de tu carta.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 🛡️ EXPORTACIÓN SEGURA (Punto de entrada de Next.js con Suspense)
// ============================================================================
export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f3a61]" />}>
      <LobbyContent />
    </Suspense>
  );
}