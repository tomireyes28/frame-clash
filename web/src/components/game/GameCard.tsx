// web/src/components/game/GameCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { OFFICIAL_CATEGORIES } from '@/utils/categories'; // 👈 1. Importamos el diccionario oficial

export interface CardData {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  rarity: string;
  categories?: { id?: string; key: string }[];
  powerUpAction?: string | null; // 🔥 Agregamos | null
  powerUpValue?: number | null;  // 🔥 Agregamos | null
}

interface GameCardProps {
  card: CardData;
  size?: 'sm' | 'md' | 'lg' | 'full'; 
  isFlippable?: boolean;     
  onClick?: () => void;      
}

// 👈 2. Función traductora de categorías
const getCategoryLabel = (key: string) => {
  const cat = OFFICIAL_CATEGORIES.find(c => c.key === key);
  return cat ? cat.label : key.replace(/_/g, ' '); 
};

export default function GameCard({ card, size = 'md', isFlippable = true, onClick }: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const rarityStyles: Record<string, { border: string; shadow: string; badge: string }> = {
    COMMON: { border: 'border-gray-500', shadow: 'shadow-gray-500/20', badge: 'bg-gray-600 text-white' },
    UNCOMMON: { border: 'border-green-500', shadow: 'shadow-green-500/30', badge: 'bg-green-600 text-white' },
    RARE: { border: 'border-blue-500', shadow: 'shadow-blue-500/40', badge: 'bg-blue-600 text-white' },
    EPIC: { border: 'border-purple-500', shadow: 'shadow-purple-500/50', badge: 'bg-purple-600 text-white' },
    LEGENDARY: { border: 'border-yellow-400', shadow: 'shadow-yellow-400/60', badge: 'bg-yellow-500 text-black' },
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
      className={`relative cursor-pointer group perspective-[1000px] ${sizeClasses[size]}`}
      onClick={handleCardClick}
    >
      <div 
        className={`relative w-full h-full rounded-xl transition-all duration-500 transform-3d shadow-lg hover:shadow-2xl ${currentStyle.shadow} ${isFlipped ? 'transform-[rotateY(180deg)]' : ''}`}
      >
        
        {/* ========================================== */}
        {/* 🎭 FRENTE DE LA CARTA */}
        {/* ========================================== */}
        <div className={`absolute inset-0 w-full h-full rounded-xl border-2 ${currentStyle.border} bg-[#09090b] overflow-hidden backface-hidden`}>
          
          <div className="absolute top-2 right-2 z-20">
            <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest px-2 py-1 rounded shadow-md ${currentStyle.badge}`}>
              {card.rarity}
            </span>
          </div>

          <div className="relative w-full h-full">
            {card.posterPath ? (
              <Image 
                src={`https://image.tmdb.org/t/p/w500${card.posterPath}`} 
                alt={card.title} 
                fill 
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold p-4 text-center">
                {card.title}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/90 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* ========================================== */}
        {/* 🛡️ DORSO DE LA CARTA */}
        {/* ========================================== */}
        <div className={`absolute inset-0 w-full h-full rounded-xl border-2 ${currentStyle.border} bg-gray-900 p-4 flex flex-col backface-hidden transform-[rotateY(180deg)]`}>
          
          <div className="text-center mb-4 border-b border-gray-700 pb-2">
            <h3 className="font-black text-white text-sm md:text-lg leading-tight line-clamp-2">{card.title}</h3>
            <p className="text-gray-400 text-xs font-bold mt-1">{card.year}</p>
          </div>

          <div className="flex-1">
            <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-widest mb-2">Categorías</p>
            <div className="flex flex-wrap gap-1">
              {card.categories?.map((cat) => (
                <span key={cat.key} className="text-[9px] md:text-[10px] bg-gray-800 border border-gray-600 text-gray-300 px-1.5 py-0.5 rounded">
                  {getCategoryLabel(cat.key)} {/* 👈 3. Usamos la función acá */}
                </span>
              ))}
              {(!card.categories || card.categories.length === 0) && (
                <span className="text-xs text-gray-600 italic">Sin asignar</span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-700">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Poder Especial</p>
            <div className="bg-black/50 rounded p-2 border border-gray-800 flex items-center justify-center min-h-10">
               {card.powerUpAction ? (
                 <span className="text-[10px] font-bold text-indigo-400 text-center uppercase">
                   {card.powerUpAction} {card.powerUpValue && `(${card.powerUpValue})`}
                 </span>
               ) : (
                 <span className="text-xs text-gray-600 italic">Sin poder...</span>
               )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}