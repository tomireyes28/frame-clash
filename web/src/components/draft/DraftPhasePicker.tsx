// web/src/components/draft/DraftPhasePicker.tsx
'use client';

import React from 'react';
import { DraftCardOption } from '@/services/draft.service';
import GameCard, { CardData } from '@/components/game/GameCard';
import { motion, AnimatePresence } from 'framer-motion';

interface DraftPhasePickerProps {
  draftStep: number; // 1 a 5
  options: DraftCardOption[];
  draftedCards: DraftCardOption[];
  onPickCard: (cardId: string) => void;
  isLoading: boolean;
}

export default function DraftPhasePicker({
  draftStep,
  options,
  draftedCards,
  onPickCard,
  isLoading,
}: DraftPhasePickerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-4 px-4 pb-24">
      {/* HEADER DEL DRAFT */}
      <div className="text-center">
        <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Fase de Selección
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider mt-2">
          Elegí la Carta {draftStep} de 5
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Hacé clic en una de las 3 opciones para sumarla a tu mano de power-ups.
        </p>
      </div>

      {/* LAS 3 OPCIONES DE CARTA */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 my-2 place-items-center">
        <AnimatePresence mode="wait">
          {options.map((card, index) => {
            const cardData: CardData = {
              id: card.id,
              tmdbId: card.tmdbId,
              title: card.title,
              year: card.year,
              posterPath: card.posterPath,
              rarity: card.rarity,
              powerUpAction: card.powerUpAction,
              powerUpValue: card.powerUpValue,
            };

            return (
              <motion.div
                key={`${card.id}-${draftStep}-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (!isLoading) onPickCard(card.id);
                }}
                className="w-48 sm:w-full max-w-[200px] aspect-[2/3] cursor-pointer relative group flex flex-col items-center"
              >
                <GameCard card={cardData} size="full" isFlippable={true} />

                {/* Botón flotante al pasar el mouse */}
                <div className="w-full mt-2 py-1.5 bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider text-center rounded-xl shadow-lg transition-colors">
                  {isLoading ? 'Drafteando...' : 'Elegir Carta ➔'}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* BARRA INFERIOR CON LOS 5 SLOTS DRAFTEADOS */}
      <div className="w-full bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex flex-col items-center gap-3 shadow-xl mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Tu Mano de Power-Ups ({draftedCards.length}/5)
        </span>

        <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-lg">
          {Array.from({ length: 5 }).map((_, slotIndex) => {
            const card = draftedCards[slotIndex];

            if (card) {
              const cardData: CardData = {
                id: card.id,
                tmdbId: card.tmdbId,
                title: card.title,
                year: card.year,
                posterPath: card.posterPath,
                rarity: card.rarity,
                powerUpAction: card.powerUpAction,
                powerUpValue: card.powerUpValue,
              };

              return (
                <div key={card.id} className="w-full aspect-[2/3] relative rounded-xl overflow-hidden shadow-md">
                  <GameCard card={cardData} size="full" isFlippable={false} />
                </div>
              );
            }

            return (
              <div
                key={`empty-${slotIndex}`}
                className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 flex items-center justify-center text-slate-600 text-xs font-bold font-mono"
              >
                #{slotIndex + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
