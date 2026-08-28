// web/src/components/game/QuestionBoard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/store/useGameStore';
import { soundManager } from '@/utils/audio';

interface QuestionBoardProps {
  question: Question;
  hiddenOptions: string[];
  selectedOption: string | null;
  isCorrect: boolean | null;
  onOptionClick: (option: string) => void;
  streak?: number;
}

export default function QuestionBoard({
  question,
  hiddenOptions,
  selectedOption,
  isCorrect,
  onOptionClick,
  streak = 0,
}: QuestionBoardProps) {
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (selectedOption !== null) return;
    soundManager.playButtonClick();
    onOptionClick(option);

    // Si es correcta, activamos el popup flotante
    // (Nota: el resultado real se define al instante en el hook useGameEngine)
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-3 relative">
      {/* 🎬 1. PANTALLA DE CINE IMAX (PROYECTOR & FOTOGRAMA) */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-2xl shadow-slate-950/80 flex flex-col items-center justify-center p-3.5 text-center group">
        {/* Glow de proyector de cine */}
        <div className="absolute -top-10 inset-x-0 h-20 bg-gradient-to-b from-amber-400/20 via-orange-500/10 to-transparent blur-xl pointer-events-none" />

        {/* Badge de Racha de Aciertos */}
        {streak > 1 ? (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute top-2 right-2 z-20 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-orange-300/60 flex items-center gap-1 animate-bounce"
          >
            <span>🔥</span>
            <span>Racha x{streak}</span>
          </motion.div>
        ) : null}

        {/* Fotograma / Poster de la Película */}
        {question.imageUrl ? (
          <div className="relative w-full h-44 mb-3 rounded-2xl overflow-hidden border border-white/15 shadow-inner">
            <Image
              src={question.imageUrl}
              alt="Fotograma de Película"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-103"
              sizes="(max-width: 768px) 100vw, 440px"
              priority
            />
            {/* Viñeta cinematográfica */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute bottom-1.5 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-mono font-bold text-amber-400 border border-slate-800">
              🎞️ FOTOGRAMA
            </div>
          </div>
        ) : null}

        {/* Texto de la Pregunta */}
        <h2 className="text-sm md:text-base font-black text-white leading-snug drop-shadow-md z-10 px-1">
          {question.text}
        </h2>
      </div>

      {/* 🚀 TEXTO FLOTANTE DE PUNTOS (+PUNTOS) */}
      <AnimatePresence>
        {selectedOption && isCorrect ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-1/2 z-30 pointer-events-none text-emerald-400 font-black text-xl font-mono drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]"
          >
            +1,000 PTS ⭐
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 🕹️ 2. BOTONES ARCADE TÁCTILES 3D CON RELIEVE */}
      <div className="w-full grid grid-cols-1 gap-2.5">
        {question.options.map((option, idx) => {
          if (hiddenOptions.includes(option)) {
            return (
              <div
                key={idx}
                className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-slate-800/40 bg-slate-950/30 flex items-center justify-center text-slate-600 text-xs font-mono"
              >
                ⚡ Opción Eliminada
              </div>
            );
          }

          let buttonTheme =
            'bg-gradient-to-r from-slate-900 to-slate-800 text-slate-100 border border-slate-700 shadow-[0_4px_0_#1e293b] active:translate-y-1 active:shadow-none hover:border-amber-400/60';

          if (selectedOption === option) {
            if (isCorrect) {
              buttonTheme =
                'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-2 border-emerald-300 shadow-[0_4px_0_#065f46] shadow-emerald-950 ring-2 ring-emerald-400/80 animate-pulse';
            } else {
              buttonTheme =
                'bg-gradient-to-r from-rose-600 to-red-700 text-white border-2 border-rose-300 shadow-[0_4px_0_#881337] shadow-rose-950 ring-2 ring-rose-400/80';
            }
          } else if (selectedOption !== null) {
            buttonTheme =
              'bg-slate-950/40 border-slate-900 text-slate-600 shadow-none cursor-not-allowed opacity-50';
          }

          return (
            <motion.button
              key={idx}
              whileTap={selectedOption === null ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option)}
              disabled={selectedOption !== null}
              className={`w-full py-3 px-4 rounded-2xl text-xs md:text-sm font-black text-left flex items-center justify-between transition-all duration-150 cursor-pointer ${buttonTheme}`}
            >
              <span className="truncate pr-2">{option}</span>
              <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono text-slate-400 shrink-0 border border-white/10">
                {String.fromCharCode(65 + idx)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}