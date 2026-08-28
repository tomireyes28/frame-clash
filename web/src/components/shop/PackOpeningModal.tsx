// web/src/components/shop/PackOpeningModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard, { CardData } from '@/components/game/GameCard';
import { BuyPackResponse, PackCard } from '@/services/shop.service';
import { soundManager } from '@/utils/audio';

interface PackOpeningModalProps {
  packResult: BuyPackResponse;
  packName: string;
  onClose: () => void;
}

const PACK_THEMES: Record<string, { gradient: string; glow: string; border: string; icon: string }> = {
  BRONZE: {
    gradient: 'from-amber-900 via-amber-800 to-stone-900',
    glow: 'rgba(180, 83, 9, 0.6)',
    border: 'border-amber-700',
    icon: '🥉',
  },
  SILVER: {
    gradient: 'from-slate-400 via-slate-600 to-slate-900',
    glow: 'rgba(148, 163, 184, 0.7)',
    border: 'border-slate-300',
    icon: '🥈',
  },
  GOLD: {
    gradient: 'from-yellow-400 via-amber-500 to-amber-900',
    glow: 'rgba(251, 191, 36, 0.85)',
    border: 'border-yellow-300',
    icon: '🥇',
  },
  PLATINUM: {
    gradient: 'from-sky-300 via-cyan-500 to-indigo-950',
    glow: 'rgba(56, 189, 248, 0.9)',
    border: 'border-sky-300',
    icon: '💎',
  },
  DIAMOND: {
    gradient: 'from-purple-400 via-pink-500 to-slate-950',
    glow: 'rgba(168, 85, 247, 0.95)',
    border: 'border-purple-300',
    icon: '👑',
  },
};

const RARITY_BACK_THEMES: Record<string, { border: string; glow: string; badge: string; icon: string; name: string; bg: string }> = {
  COMMON: {
    border: 'border-slate-600',
    glow: 'shadow-slate-700/40',
    badge: 'bg-slate-700 text-slate-200 border-slate-500',
    icon: '🎬',
    name: 'Común',
    bg: 'from-slate-800 via-slate-900 to-black',
  },
  UNCOMMON: {
    border: 'border-emerald-400',
    glow: 'shadow-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.3)]',
    badge: 'bg-emerald-600 text-white border-emerald-400',
    icon: '✨',
    name: 'Inusual',
    bg: 'from-emerald-950 via-slate-900 to-black',
  },
  RARE: {
    border: 'border-cyan-400',
    glow: 'shadow-cyan-500/60 shadow-[0_0_25px_rgba(56,189,248,0.4)]',
    badge: 'bg-cyan-500 text-slate-950 font-black border-cyan-300',
    icon: '💎',
    name: 'Rara',
    bg: 'from-cyan-950 via-slate-900 to-black',
  },
  EPIC: {
    border: 'border-purple-400',
    glow: 'shadow-purple-500/70 shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    badge: 'bg-purple-600 text-white font-black border-purple-300',
    icon: '💜',
    name: 'Épica',
    bg: 'from-purple-950 via-slate-900 to-black',
  },
  LEGENDARY: {
    border: 'border-amber-300',
    glow: 'shadow-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.6)] animate-pulse',
    badge: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 text-slate-950 font-black border-amber-200',
    icon: '👑',
    name: 'Legendaria',
    bg: 'from-amber-950 via-yellow-950/60 to-black',
  },
};

export default function PackOpeningModal({ packResult, packName, onClose }: PackOpeningModalProps) {
  const [phase, setPhase] = useState<'SEALED' | 'RIPPING' | 'STACK_REVEAL' | 'SUMMARY'>('SEALED');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCurrentFlipped, setIsCurrentFlipped] = useState(false);

  const themeKey = packName.toUpperCase();
  const theme = PACK_THEMES[themeKey] || PACK_THEMES.GOLD;

  const currentCard: PackCard | undefined = packResult.cards[currentCardIndex];
  const rarityTheme = currentCard
    ? RARITY_BACK_THEMES[currentCard.rarity] || RARITY_BACK_THEMES.COMMON
    : RARITY_BACK_THEMES.COMMON;

  const handleRipPack = async () => {
    if (phase !== 'SEALED') return;
    setPhase('RIPPING');
    soundManager.playPackRip();

    setTimeout(() => {
      setPhase('STACK_REVEAL');
      setCurrentCardIndex(0);
      setIsCurrentFlipped(false);
    }, 850);
  };

  const handleFlipCurrentCard = async () => {
    if (isCurrentFlipped || !currentCard) return;

    setIsCurrentFlipped(true);

    if (currentCard.rarity === 'LEGENDARY' || currentCard.rarity === 'EPIC') {
      soundManager.playVictory();
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: currentCard.rarity === 'LEGENDARY'
          ? ['#F59E0B', '#FBBF24', '#FCD34D', '#EF4444']
          : ['#A855F7', '#C084FC', '#38BDF8'],
      });
    } else {
      soundManager.playCorrect();
    }
  };

  const handleNextCard = () => {
    soundManager.playButtonClick();
    if (currentCardIndex + 1 < packResult.cards.length) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsCurrentFlipped(false);
    } else {
      soundManager.playVictory();
      setPhase('SUMMARY');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      {/* 🌟 LUZ AMBIENTAL DEL PROYECTOR */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* FASE 1 & 2: SOBRE SELLADO / RASGADO (RIPPING)             */}
      {/* ========================================================= */}
      {phase === 'SEALED' || phase === 'RIPPING' ? (
        <div className="my-auto flex flex-col items-center gap-6 text-center w-full max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center"
          >
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-slate-900 border border-amber-400/30 px-3 py-1 rounded-full mb-3 shadow-lg">
              ✨ Sobre de Colección
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              Sobre {packName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tocá el sobre para rasgarlo y descubrir las cartas
            </p>
          </motion.div>

          {/* SOBRE FOIL 3D */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRipPack}
            animate={
              phase === 'RIPPING'
                ? {
                    rotate: [0, -10, 10, -15, 15, 0],
                    scale: [1, 1.15, 1.25, 0.9, 0],
                    opacity: [1, 1, 1, 0.8, 0],
                    transition: { duration: 0.85 },
                  }
                : {
                    y: [0, -8, 0],
                    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                  }
            }
            className={`relative w-48 h-72 rounded-3xl p-5 border-2 shadow-2xl flex flex-col justify-between items-center cursor-pointer overflow-hidden ${theme.border} bg-gradient-to-b ${theme.gradient}`}
            style={{
              boxShadow: `0 0 50px ${theme.glow}`,
            }}
          >
            {/* Brillo foil de aluminio */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-80 animate-pulse pointer-events-none" />

            <div className="text-center z-10">
              <span className="text-4xl block mb-1">{theme.icon}</span>
              <span className="text-xs font-black uppercase text-white tracking-widest drop-shadow-md">
                FRAME CLASH
              </span>
            </div>

            <div className="text-center z-10 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 shadow-inner">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
                5 Cartas TMDB
              </span>
              <span className="text-[8px] font-mono text-slate-300 block">
                Garantía {themeKey}
              </span>
            </div>

            <div className="z-10 bg-white/20 text-white text-[9px] font-black uppercase px-3.5 py-1 rounded-full border border-white/40 shadow-lg animate-bounce">
              ⚡ TOCAR PARA ABRIR
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* ========================================================= */}
      {/* FASE 3: MAZO APILADO 1 A 1 (CARD STACK REVEAL)           */}
      {/* ========================================================= */}
      {phase === 'STACK_REVEAL' && currentCard ? (
        <div className="w-full max-w-sm h-full flex flex-col justify-between items-center py-2">
          {/* CABECERA: CONTADOR Y PROGRESO */}
          <div className="w-full flex flex-col items-center gap-1.5">
            <div className="flex justify-between items-center w-full px-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                Carta {currentCardIndex + 1} de {packResult.cards.length}
              </span>
              <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-md ${rarityTheme.badge}`}>
                {rarityTheme.name}
              </span>
            </div>

            {/* Barra de progreso de cartas */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                style={{ width: `${((currentCardIndex + (isCurrentFlipped ? 1 : 0)) / packResult.cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* ESCENARIO DEL MAZO APILADO (CARD STACK) */}
          <div className="relative w-64 aspect-[2/3] my-auto flex items-center justify-center">
            {/* Sombras de cartas debajo en el mazo (efecto de profundidad) */}
            {currentCardIndex + 2 < packResult.cards.length ? (
              <div className="absolute inset-0 rounded-2xl bg-slate-900 border-2 border-slate-800 opacity-40 scale-90 translate-y-4 rotate-3 pointer-events-none" />
            ) : null}
            {currentCardIndex + 1 < packResult.cards.length ? (
              <div className="absolute inset-0 rounded-2xl bg-slate-900 border-2 border-slate-700 opacity-70 scale-95 translate-y-2 -rotate-2 pointer-events-none" />
            ) : null}

            {/* CARTA ACTIVA */}
            <motion.div
              key={currentCard.id || currentCardIndex}
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              onClick={handleFlipCurrentCard}
              className="w-full h-full cursor-pointer relative"
              style={{ perspective: 1000 }}
            >
              <AnimatePresence mode="wait">
                {!isCurrentFlipped ? (
                  /* ========================================= */
                  /* DORSO DE LA CARTA (COLOR SEGÚN RAREZA)    */
                  /* ========================================= */
                  <motion.div
                    key="card-back"
                    initial={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.25 }}
                    className={`w-full h-full rounded-2xl border-2 p-4 flex flex-col justify-between items-center text-center relative overflow-hidden bg-gradient-to-b ${rarityTheme.bg} ${rarityTheme.border} ${rarityTheme.glow}`}
                  >
                    {/* Glow holográfico del dorso */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse pointer-events-none" />

                    <div className="z-10">
                      <span className="text-3xl block mb-1">{rarityTheme.icon}</span>
                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest block">
                        FRAME CLASH
                      </span>
                    </div>

                    <div className="z-10 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 shadow-inner">
                      <span className="text-[11px] font-black uppercase text-white tracking-wider block">
                        ¡Carta {rarityTheme.name}!
                      </span>
                      <span className="text-[9px] text-amber-300 font-mono block mt-0.5 animate-pulse">
                        Tocá para Revelar
                      </span>
                    </div>

                    <div className="z-10 text-[9px] font-mono text-slate-400">
                      ¿Qué película será? 🎬
                    </div>
                  </motion.div>
                ) : (
                  /* ========================================= */
                  /* FRENTE DE LA CARTA REVELADA (PELÍCULA)    */
                  /* ========================================= */
                  <motion.div
                    key="card-front"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <GameCard
                      card={{
                        id: currentCard.id,
                        title: currentCard.title,
                        posterPath: currentCard.posterPath,
                        rarity: currentCard.rarity,
                      }}
                      size="full"
                      isFlippable={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* BOTÓN INFERIOR DE NAVEGACIÓN */}
          <div className="w-full pt-2">
            {!isCurrentFlipped ? (
              <button
                onClick={handleFlipCurrentCard}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer border border-yellow-200"
              >
                ✨ Voltear Carta
              </button>
            ) : (
              <button
                onClick={handleNextCard}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-none transition cursor-pointer border border-emerald-300"
              >
                {currentCardIndex + 1 < packResult.cards.length ? 'Siguiente Carta ➔' : 'Ver Resumen ➔'}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* ========================================================= */}
      {/* FASE 4: RESUMEN FINAL DE LAS 5 CARTAS (SUMMARY GALLERY)   */}
      {/* ========================================================= */}
      {phase === 'SUMMARY' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm h-full flex flex-col justify-between items-center py-2"
        >
          <div className="text-center pt-2">
            <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-0.5 rounded-full inline-block mb-1">
              🎉 ¡Sobre Completado!
            </span>
            <h3 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent uppercase tracking-wider">
              Tus 5 Cartas
            </h3>
          </div>

          {/* GRILLA DE CARTAS FINAL COMPACTA */}
          <div className="grid grid-cols-3 gap-2 w-full my-auto px-1">
            {packResult.cards.map((card, idx) => (
              <motion.div
                key={card.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-slate-700"
              >
                <GameCard
                  card={{
                    id: card.id,
                    title: card.title,
                    posterPath: card.posterPath,
                    rarity: card.rarity,
                  }}
                  size="full"
                  isFlippable={false}
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            ✅ Guardar en mi Álbum
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}
