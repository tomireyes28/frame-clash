// src/app/play/lobby/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { gameService, InventoryCard } from '@/services/game.service';
import GameCard, { CardData } from '@/components/game/GameCard';

const MAX_SLOTS = 5;

const CardSlot = ({ card, index }: { card?: InventoryCard; index: number }) => {
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

  const gameCardData: CardData = {
    id: card.id,
    tmdbId: card.tmdbId,
    title: card.title,
    year: card.year,
    posterPath: card.posterPath,
    rarity: card.rarity,
    categories: card.categories || [],
    powerUpAction: card.powerUpAction,
    powerUpValue: card.powerUpValue,
  };

  return (
    <div className="relative w-full aspect-2/3 group">
      <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 z-30 bg-black px-2 py-1 text-[10px] md:text-xs font-black rounded-full border border-yellow-500 text-yellow-500 shadow-xl">
        Nvl {card.level}
      </div>
      <GameCard card={gameCardData} size="full" isFlippable={true} />
    </div>
  );
};

function LobbyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode') || 'ARCADE'; 

  const [equippedCards, setEquippedCards] = useState<InventoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    gameService.getEquippedCards(mode)
      .then(data => setEquippedCards(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [mode]);

  const handleStartGame = () => {
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

  const slots = Array.from({ length: MAX_SLOTS }).map((_, index) => equippedCards[index]);

  return (
    <div className="min-h-screen bg-[#0f3a61] p-4 md:p-8 text-white flex flex-col items-center justify-between pb-10">
      <div className="text-center mt-6 mb-8">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
          Lobby <span className="text-[#E50914]">{mode}</span>
        </h1>
        <p className="text-gray-300 mt-2 text-sm md:text-base font-bold">
          {equippedCards.length} / 5 Cartas Equipadas
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-5 gap-2 md:gap-4 mb-10">
        {slots.map((card, index) => (
          <CardSlot key={card ? card.id : `empty-${index}`} card={card} index={index} />
        ))}
      </div>

      <div className="flex flex-col items-center w-full max-w-md">
        <button
          onClick={handleStartGame}
          className="group relative w-full py-4 bg-[#E50914] text-white font-black text-xl md:text-2xl uppercase tracking-widest rounded shadow-[0_0_20px_rgba(229,9,20,0.5)] hover:shadow-[0_0_40px_rgba(229,9,20,0.8)] hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10">¡Entrar al Coliseo!</span>
          <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 rounded"></div>
        </button>
      </div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f3a61]" />}>
      <LobbyContent />
    </Suspense>
  );
}