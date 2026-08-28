// web/src/components/domination/DominationNodeModal.tsx
'use client';

import React, { useState } from 'react';
import { DominationNodeInfo } from '@/services/domination.service';
import { InventoryCard } from '@/services/game.service';
import GameCard, { CardData } from '@/components/game/GameCard';
import { motion, AnimatePresence } from 'framer-motion';

interface DominationNodeModalProps {
  node: DominationNodeInfo;
  categoryName: string;
  inventory: InventoryCard[];
  onStartNode: (nodeNumber: number, equippedCardIds: string[]) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function DominationNodeModal({
  node,
  categoryName,
  inventory,
  onStartNode,
  onClose,
  isLoading,
}: DominationNodeModalProps) {
  // Regla: Máximo 2 power-ups por ronda en Modo Dominio
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(() => {
    return inventory
      .filter((c) => c.powerUpAction)
      .slice(0, 2)
      .map((c) => c.id);
  });

  const toggleCard = (cardId: string) => {
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== cardId));
    } else {
      if (selectedCardIds.length >= 2) {
        alert('En el Modo Dominio podés equipar un máximo de 2 cartas de Power-Up.');
        return;
      }
      setSelectedCardIds([...selectedCardIds, cardId]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto"
        >
          {/* BOTÓN CERRAR */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
          >
            ✕
          </button>

          {/* HEADER */}
          <div className="text-center pr-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/30">
              {categoryName}
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide mt-2">
              {node.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Respondé 10 preguntas y alcanzá al menos 1 estrella para superar la fase.
            </p>
          </div>

          {/* TABLA DE OBJETIVOS DE ESTRELLAS */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
              🎯 Objetivos de Puntaje:
            </h4>

            <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-slate-900">
              <span className="text-amber-400">⭐ 1 Estrella (Superar Fase)</span>
              <span className="font-mono text-slate-200">{node.thresholds.oneStar.toLocaleString('es-AR')} pts</span>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-slate-900">
              <span className="text-amber-400">⭐⭐ 2 Estrellas</span>
              <span className="font-mono text-slate-200">{node.thresholds.twoStars.toLocaleString('es-AR')} pts</span>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold py-1">
              <span className="text-amber-400">⭐⭐⭐ 3 Estrellas (Maestría)</span>
              <span className="font-mono text-slate-200">{node.thresholds.threeStars.toLocaleString('es-AR')} pts</span>
            </div>
          </div>

          {/* SELECTOR DE POWER-UPS (MÁXIMO 2) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-200">
                ⚡ Equipar Power-Ups ({selectedCardIds.length}/2)
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Máximo 2 por fase</span>
            </div>

            {inventory.length === 0 ? (
              <div className="bg-slate-950 p-3 rounded-xl text-center text-xs text-slate-400 border border-slate-800">
                No tenés cartas en tu inventario. Podés jugar sin power-ups.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                {inventory.map((card) => {
                  const isSelected = selectedCardIds.includes(card.id);
                  const cardData: CardData = {
                    id: card.id,
                    tmdbId: card.tmdbId,
                    title: card.title,
                    year: card.year,
                    posterPath: card.posterPath,
                    rarity: card.rarity,
                    level: card.level,
                    powerUpAction: card.powerUpAction,
                    powerUpValue: card.powerUpValue,
                  };

                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleCard(card.id)}
                      className={`relative cursor-pointer rounded-xl p-0.5 transition-all ${
                        isSelected
                          ? 'ring-2 ring-amber-400 bg-amber-500/20 scale-102'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <GameCard card={cardData} size="full" isFlippable={false} />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] shadow-md z-30">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOTÓN DE INICIO */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartNode(node.nodeNumber, selectedCardIds)}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-orange-950/50 uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Cargando Fase...' : `▶ ¡Comenzar Fase ${node.nodeNumber}!`}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
