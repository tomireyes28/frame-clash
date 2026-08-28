// web/src/components/game/GameCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { OFFICIAL_CATEGORIES } from '@/utils/categories';

export interface CardData {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  backdropPath?: string | null;
  rarity: string;
  atk?: number;
  def?: number;
  spd?: number;
  box?: number;
  crt?: number;
  level?: number;
  categories?: { id?: string; key: string }[];
  powerUpAction?: string | null;
  powerUpValue?: number | null;
}

interface GameCardProps {
  card: CardData;
  size?: 'sm' | 'md' | 'lg' | 'full';
  isFlippable?: boolean;
  onClick?: () => void;
}

const getCategoryLabel = (key: string) => {
  const cat = OFFICIAL_CATEGORIES.find(c => c.key === key);
  return cat ? `${cat.icon} ${cat.label}` : key.replace(/_/g, ' ');
};

export default function GameCard({ card, size = 'md', isFlippable = true, onClick }: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 5 Rarezas y Colores Oficiales
  const rarityStyles: Record<string, { border: string; shadow: string; badge: string; name: string }> = {
    COMMON: { border: 'border-zinc-400', shadow: 'shadow-zinc-500/20', badge: 'bg-zinc-600 text-zinc-100', name: 'Común' },
    UNCOMMON: { border: 'border-emerald-500', shadow: 'shadow-emerald-500/30', badge: 'bg-emerald-600 text-white', name: 'Inusual' },
    RARE: { border: 'border-sky-400', shadow: 'shadow-sky-400/40', badge: 'bg-sky-500 text-white', name: 'Rara' },
    EPIC: { border: 'border-purple-500', shadow: 'shadow-purple-500/50', badge: 'bg-purple-600 text-white', name: 'Épica' },
    LEGENDARY: { border: 'border-amber-400', shadow: 'shadow-amber-400/60', badge: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold', name: 'Legendaria' },
  };

  const currentStyle = rarityStyles[card.rarity] || rarityStyles.COMMON;

  const sizeClasses = {
    sm: 'w-24 md:w-32 aspect-[2/3]',
    md: 'w-36 md:w-48 aspect-[2/3]',
    lg: 'w-64 md:w-80 aspect-[2/3]',
    full: 'w-full aspect-[2/3]',
  };

  const handleCardClick = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative cursor-pointer transition-transform duration-300 transform hover:scale-105 ${sizeClasses[size]}`}
      style={{ perspective: '1000px' }}
    >
      <div
        className={`w-full h-full relative transition-transform duration-500 rounded-xl ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRENTE DE LA CARTA */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 bg-slate-900 shadow-xl flex flex-col justify-between p-2 [backface-visibility:hidden] ${currentStyle.border} ${currentStyle.shadow}`}
        >
          {/* Badge superior de rareza y año */}
          <div className="flex justify-between items-center z-10">
            <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-semibold ${currentStyle.badge}`}>
              {currentStyle.name}
            </span>
            <span className="text-[10px] md:text-xs text-zinc-300 font-mono bg-black/60 px-1.5 py-0.5 rounded">
              {card.year}
            </span>
          </div>

          {/* Póster de la Película */}
          {card.posterPath ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${card.posterPath}`}
                alt={card.title}
                fill
                className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                sizes="(max-width: 768px) 150px, 300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-zinc-400 text-xs">
              Sin Póster
            </div>
          )}

          {/* Pie de carta: Título y Stats */}
          <div className="z-10 bg-black/80 backdrop-blur-sm p-1.5 rounded-lg border border-white/10">
            <h3 className="text-xs md:text-sm font-bold truncate text-white text-center">
              {card.title}
            </h3>
            {card.atk !== undefined && (
              <div className="grid grid-cols-3 gap-1 text-[9px] md:text-[10px] mt-1 text-center font-mono">
                <span className="text-red-400">⚔️ {card.atk}</span>
                <span className="text-blue-400">🛡️ {card.def}</span>
                <span className="text-emerald-400">⚡ {card.spd}</span>
              </div>
            )}
          </div>
        </div>

        {/* DORSO DE LA CARTA (POWER-UPS & CATEGORÍAS) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl p-3 border-2 bg-slate-950 text-white flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] ${currentStyle.border} ${currentStyle.shadow}`}
        >
          <div>
            <div className="text-center border-b border-white/10 pb-1 mb-2">
              <h4 className="text-xs md:text-sm font-bold truncate">{card.title}</h4>
              <p className="text-[10px] text-zinc-400">Nivel {card.level || 1} / 3</p>
            </div>

            {/* Power-Up activo */}
            {card.powerUpAction && (
              <div className="bg-white/5 p-2 rounded-lg border border-white/10 my-2">
                <p className="text-[10px] font-semibold text-amber-300">⚡ Power-Up</p>
                <p className="text-xs mt-0.5">
                  {card.powerUpAction === 'REMOVE_OPTION'
                    ? `Elimina ${card.powerUpValue || 1} opción incorrecta`
                    : card.powerUpAction}
                </p>
              </div>
            )}

            {/* Categorías */}
            {card.categories && card.categories.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] text-zinc-400 mb-1">Categorías:</p>
                <div className="flex flex-wrap gap-1">
                  {card.categories.map((c, i) => (
                    <span key={i} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-zinc-200">
                      {getCategoryLabel(c.key)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-[9px] text-center text-zinc-400 italic">Click para voltear</p>
        </div>
      </div>
    </div>
  );
}