// web/src/components/shop/PackOpeningModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard, { CardData } from '@/components/game/GameCard';
import { BuyPackResponse } from '@/services/shop.service';
import { soundManager } from '@/utils/audio';

interface PackOpeningModalProps {
  packResult: BuyPackResponse;
  packName: string;
  onClose: () => void;
}

const PACK_THEMES: Record<string, { gradient: string; glow: string; border: string; icon: string }> = {
  BRONZE: {
    gradient: 'from-amber-900 via-amber-800 to-stone-900',
    glow: 'rgba(180, 83, 9, 0.5)',
    border: 'border-amber-700',
    icon: '🥉',
  },
  SILVER: {
    gradient: 'from-slate-400 via-slate-600 to-slate-900',
    glow: 'rgba(148, 163, 184, 0.6)',
    border: 'border-slate-300',
    icon: '🥈',
  },
  GOLD: {
    gradient: 'from-yellow-400 via-amber-500 to-amber-900',
    glow: 'rgba(251, 191, 36, 0.8)',
    border: 'border-yellow-300',
    icon: '🥇',
  },
  PLATINUM: {
    gradient: 'from-sky-300 via-cyan-500 to-indigo-950',
    glow: 'rgba(56, 189, 248, 0.85)',
    border: 'border-sky-300',
    icon: '💎',
  },
  DIAMOND: {
    gradient: 'from-purple-400 via-pink-500 to-slate-950',
    glow: 'rgba(168, 85, 247, 0.9)',
    border: 'border-purple-300',
    icon: '👑',
  },
};

export default function PackOpeningModal({ packResult, packName, onClose }: PackOpeningModalProps) {
  const [phase, setPhase] = useState<'SEALED' | 'RIPPING' | 'REVEALING'>('SEALED');
  const [revealedCardIds, setRevealedCardIds] = useState<string[]>([]);

  const themeKey = packName.toUpperCase();
  const theme = PACK_THEMES[themeKey] || PACK_THEMES.GOLD;

  // Detectar la carta de mayor rareza en el sobre para el color de los rayos
  const hasLegendary = packResult.cards.some((c) => c.rarity === 'LEGENDARY');
  const hasEpic = packResult.cards.some((c) => c.rarity === 'EPIC');

  const handleRipPack = async () => {
    if (phase !== 'SEALED') return;
    setPhase('RIPPING');
    soundManager.playPackRip();

    setTimeout(async () => {
      setPhase('REVEALING');
      if (hasLegendary || hasEpic) {
        soundManager.playVictory();
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#38BDF8'],
        });
      }
    }, 900);
  };

  const handleRevealCard = (cardId: string) => {
    if (!revealedCardIds.includes(cardId)) {
      soundManager.playCorrect();
      setRevealedCardIds((prev) => [...prev, cardId]);
    }
  };

  const handleRevealAll = () => {
    soundManager.playVictory();
    setRevealedCardIds(packResult.cards.map((c) => c.id));
  };

  const allRevealed = revealedCardIds.length >= packResult.cards.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      {/* ========================================================= */}
      {/* FASE 1 & 2: SOBRE SELLADO / RASGADO                       */}
      {/* ========================================================= */}
      {phase === 'SEALED' || phase === 'RIPPING' ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center"
          >
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-slate-900 border border-amber-400/30 px-3 py-1 rounded-full mb-3 shadow-lg">
              ✨ ¡Nuevo Sobre de Colección!
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              Sobre {packName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tocá el sobre para abrirlo y revelar las 5 cartas
            </p>
          </motion.div>

          {/* SOBRE 3D INTERACTIVO */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRipPack}
            animate={
              phase === 'RIPPING'
                ? {
                    rotate: [0, -10, 10, -15, 15, 0],
                    scale: [1, 1.1, 1.2, 0.9, 0],
                    opacity: [1, 1, 1, 0.8, 0],
                    transition: { duration: 0.9 },
                  }
                : {
                    y: [0, -8, 0],
                    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                  }
            }
            className={`relative w-48 h-72 rounded-3xl p-5 border-2 shadow-2xl flex flex-col justify-between items-center cursor-pointer select-none overflow-hidden ${theme.border} bg-gradient-to-b ${theme.gradient}`}
            style={{
              boxShadow: `0 0 40px ${theme.glow}`,
            }}
          >
            {/* Brillo foil de aluminio */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-70 animate-pulse pointer-events-none" />

            <div className="text-center z-10">
              <span className="text-4xl block mb-1">{theme.icon}</span>
              <span className="text-xs font-black uppercase text-white tracking-widest drop-shadow-md">
                FRAME CLASH
              </span>
            </div>

            <div className="text-center z-10 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
                5 Cartas TMDB
              </span>
              <span className="text-[8px] font-mono text-slate-300 block">
                Garantía {themeKey}
              </span>
            </div>

            <div className="z-10 bg-white/20 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full border border-white/40 shadow-md animate-bounce">
              ⚡ TOCAR PARA ABRIR
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* ========================================================= */}
      {/* FASE 3: REVELACIÓN DE CARTAS (GACHA REVEAL)                */}
      {/* ========================================================= */}
      {phase === 'REVEALING' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md flex flex-col items-center gap-3 relative max-h-[90vh] overflow-y-auto pb-4"
        >
          <div className="text-center">
            <h3 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
              ¡Cartas Desbloqueadas!
            </h3>
            <p className="text-[11px] text-slate-400">
              {allRevealed ? '¡Todas las cartas fueron reveladas!' : 'Tocá cada carta para revelar su película'}
            </p>
          </div>

          {/* GRILLA DE CARTAS (2 Columnas Móvil) */}
          <div className="grid grid-cols-2 gap-2.5 w-full my-1">
            {packResult.cards.map((card, idx) => {
              const isFlipped = revealedCardIds.includes(card.id);
              const cardData: CardData = {
                id: card.id,
                title: card.title,
                posterPath: card.posterPath,
                rarity: card.rarity,
              };

              return (
                <motion.div
                  key={card.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleRevealCard(card.id)}
                  className="relative aspect-[2/3] cursor-pointer"
                >
                  {isFlipped ? (
                    <motion.div
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      <GameCard card={cardData} size="full" isFlippable={true} />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-lg flex flex-col items-center justify-center text-center p-2 hover:border-amber-400 transition animate-pulse">
                      <span className="text-3xl mb-1">🎬</span>
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">
                        Tocar para Revelar
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="w-full flex flex-col gap-2 mt-2">
            {!allRevealed ? (
              <button
                onClick={handleRevealAll}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-400/40 transition cursor-pointer"
              >
                ✨ Revelar Todas
              </button>
            ) : null}

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
            >
              ✅ Continuar al Álbum
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
