// web/src/components/game/PlayerHand.tsx
'use client';

import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { PowerUp } from '@/store/useGameStore';
import GameCard, { CardData } from '@/components/game/GameCard';
import { soundManager } from '@/utils/audio';

interface PlayerHandProps {
  powerUps: PowerUp[];
  selectedOption: string | null;
  onActivate: (powerUp: PowerUp) => void;
}

export default function PlayerHand({ powerUps, selectedOption, onActivate }: PlayerHandProps) {
  if (powerUps.length === 0) return null;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, pu: PowerUp) => {
    if (info.offset.y < -60) {
      soundManager.playPowerUpLaser();
      onActivate(pu);
    }
  };

  const handleTap = (pu: PowerUp) => {
    if (selectedOption !== null) return;
    soundManager.playPowerUpLaser();
    onActivate(pu);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 flex justify-center pointer-events-none z-50">
      <div className="max-w-md w-full flex flex-col items-center pointer-events-auto px-3 pb-1">
        <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest bg-slate-950/90 border border-amber-400/40 px-2.5 py-0.5 rounded-full mb-1 shadow-md animate-pulse">
          ⚡ Mano de Cartas (Tocá o Arrastrá ⬆)
        </span>

        <div className="flex gap-2 items-end justify-center">
          {powerUps.map((pu) => {
            const cardData: CardData = {
              id: pu.id,
              tmdbId: pu.tmdbId,
              title: pu.title,
              year: pu.year,
              posterPath: pu.posterPath,
              rarity: pu.rarity as CardData['rarity'],
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
                onDragEnd={(e, info) => handleDragEnd(e, info, pu)}
                onClick={() => handleTap(pu)}
                whileHover={!isDisabled ? { y: -8, scale: 1.05 } : {}}
                whileDrag={{ scale: 1.15, zIndex: 100, rotate: -2 }}
                className={`relative select-none ${
                  isDisabled
                    ? 'opacity-40 grayscale cursor-not-allowed'
                    : 'cursor-grab active:cursor-grabbing hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] rounded-2xl transition-all'
                }`}
              >
                <div className="w-20 sm:w-24 aspect-[2/3]">
                  <GameCard card={cardData} size="full" isFlippable={false} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}