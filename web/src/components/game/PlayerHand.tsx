// src/components/game/PlayerHand.tsx
import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { PowerUp } from '@/store/useGameStore';
import GameCard, { CardData } from '@/components/game/GameCard';

interface PlayerHandProps {
  powerUps: PowerUp[];
  selectedOption: string | null;
  onActivate: (powerUp: PowerUp) => void;
}

export default function PlayerHand({ powerUps, selectedOption, onActivate }: PlayerHandProps) {
  if (powerUps.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 flex justify-center pointer-events-none z-50">
      <div className="flex gap-2 md:gap-4 items-end justify-center pointer-events-auto bg-black/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none px-4 pt-4 pb-2 rounded-t-2xl">
        {powerUps.map((pu) => {
          // Mapeamos tu PowerUp real a la CardData de tu GameCard
          const cardData: CardData = {
            id: pu.id,
            tmdbId: pu.tmdbId, 
            title: pu.title,
            year: pu.year,
            posterPath: pu.posterPath, 
            rarity: pu.rarity as CardData['rarity'], // Forzamos el tipado por si CardData espera literales específicos
            powerUpAction: pu.action,
            powerUpValue: pu.value,
          };

          const isDisabled = selectedOption !== null;

          return (
            <motion.div 
              key={pu.id} 
              drag={!isDisabled} 
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} 
              dragElastic={0.4} 
              onDragEnd={(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                if (info.offset.y < -100) {
                  onActivate(pu);
                }
              }}
              whileDrag={{ scale: 1.1, zIndex: 100, rotate: -2 }} 
              className={`relative ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-grab active:cursor-grabbing animate-in slide-in-from-bottom-10 hover:-translate-y-2 transition-transform duration-300'}`}
            >
              {!isDisabled && (
                <div className="absolute -top-6 left-0 right-0 text-center opacity-0 hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-400 pointer-events-none">
                  ⬆ Arrastrar
                </div>
              )}
              <GameCard 
                card={cardData} 
                size="sm" 
                isFlippable={false} 
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}