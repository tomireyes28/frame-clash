// web/src/components/game/GameCard.tsx
'use client';

import React, { useState, useRef } from 'react';
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
  enableTilt?: boolean;
  onClick?: () => void;
}

const getCategoryLabel = (key: string) => {
  const cat = OFFICIAL_CATEGORIES.find((c) => c.key === key);
  return cat ? `${cat.icon} ${cat.label}` : key.replace(/_/g, ' ');
};

export default function GameCard({
  card,
  size = 'md',
  isFlippable = true,
  enableTilt = true,
  onClick,
}: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // 5 Rarezas Oficiales
  const rarityConfig: Record<
    string,
    {
      border: string;
      glow: string;
      badge: string;
      name: string;
      holoType: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
    }
  > = {
    COMMON: {
      border: 'border-zinc-500/80',
      glow: 'shadow-zinc-500/10',
      badge: 'bg-zinc-700 text-zinc-200 border-zinc-500',
      name: 'Común',
      holoType: 'common',
    },
    UNCOMMON: {
      border: 'border-emerald-500/90',
      glow: 'shadow-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-500',
      name: 'Inusual',
      holoType: 'uncommon',
    },
    RARE: {
      border: 'border-sky-400',
      glow: 'shadow-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.4)]',
      badge: 'bg-sky-950 text-sky-300 border-sky-400',
      name: 'Rara',
      holoType: 'rare',
    },
    EPIC: {
      border: 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]',
      glow: 'shadow-purple-500/50',
      badge: 'bg-purple-950 text-purple-200 border-purple-400',
      name: 'Épica',
      holoType: 'epic',
    },
    LEGENDARY: {
      border: 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] ring-1 ring-amber-300/60',
      glow: 'shadow-amber-400/60',
      badge: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black border-amber-300',
      name: 'Legendaria',
      holoType: 'legendary',
    },
  };

  const currentRarity = rarityConfig[card.rarity] || rarityConfig.COMMON;

  const sizeClasses = {
    sm: 'w-24 md:w-32 aspect-[2/3]',
    md: 'w-36 md:w-48 aspect-[2/3]',
    lg: 'w-64 md:w-80 aspect-[2/3]',
    full: 'w-full aspect-[2/3]',
  };

  // Cálculo de Tilt 3D y brillo dinámico con el cursor
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12; // Máximo 12 grados
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.75 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
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
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none cursor-pointer transition-transform duration-200 ease-out transform-gpu ${sizeClasses[size]}`}
      style={{
        perspective: '1200px',
      }}
    >
      <div
        className={`w-full h-full relative transition-transform duration-500 rounded-2xl ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped
            ? 'rotateY(180deg)'
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* ========================================================= */}
        {/* 🌟 1. FRENTE DE LA CARTA (3D + SHADER HOLOGRÁFICO)        */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden border-2 bg-slate-950 shadow-2xl flex flex-col justify-between p-2.5 [backface-visibility:hidden] ${currentRarity.border} ${currentRarity.glow}`}
        >
          {/* SHADER HOLOGRÁFICO (LEGENDARIA) */}
          {currentRarity.holoType === 'legendary' && (
            <div
              className="absolute inset-0 pointer-events-none z-20 mix-blend-color-dodge transition-opacity duration-300 opacity-60"
              style={{
                background: `linear-gradient(${115 + rotateY * 2}deg, transparent 20%, rgba(251,191,36,0.4) 40%, rgba(244,63,94,0.3) 50%, rgba(56,189,248,0.4) 60%, transparent 80%)`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${glarePos.x}% ${glarePos.y}%`,
              }}
            />
          )}

          {/* SHADER CÓSMICO (ÉPICA) */}
          {currentRarity.holoType === 'epic' && (
            <div
              className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-300 opacity-45"
              style={{
                background: `linear-gradient(${135 + rotateX * 2}deg, rgba(168,85,247,0.35) 0%, rgba(56,189,248,0.3) 50%, rgba(236,72,153,0.35) 100%)`,
                backgroundPosition: `${glarePos.x}% ${glarePos.y}%`,
              }}
            />
          )}

          {/* DESTELLO DE LUZ INTERACTIVO (GLARE SHIMMER) */}
          <div
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-200"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 35%, transparent 65%)`,
            }}
          />

          {/* HEADER DE CARTA: RAREZA Y AÑO */}
          <div className="flex justify-between items-center z-10">
            <span
              className={`text-[9px] md:text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border shadow-md ${currentRarity.badge}`}
            >
              {currentRarity.name}
            </span>
            <span className="text-[9px] md:text-[10px] text-slate-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 backdrop-blur-sm">
              {card.year}
            </span>
          </div>

          {/* PÓSTER DE LA PELÍCULA */}
          {card.posterPath ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${card.posterPath}`}
                alt={card.title}
                fill
                className="object-cover opacity-85 transition-opacity duration-300"
                sizes="(max-width: 768px) 160px, 320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-xs font-bold">
              Sin Póster
            </div>
          )}

          {/* PIE DE CARTA: TÍTULO Y POWER-UP */}
          <div className="z-10 bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-slate-800/80 shadow-lg">
            <h3 className="text-xs md:text-sm font-black truncate text-white text-center tracking-wide">
              {card.title}
            </h3>

            {card.powerUpAction && (
              <div className="mt-1 text-[9px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded px-1.5 py-0.5 text-center truncate">
                ⚡ {card.powerUpAction.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🔄 2. DORSO DE LA CARTA (POWER-UPS, NIVEL Y CATEGORÍAS)   */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl p-3 border-2 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] ${currentRarity.border} ${currentRarity.glow}`}
        >
          <div>
            <div className="text-center border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                Ficha Técnica
              </span>
              <h4 className="text-xs md:text-sm font-black truncate text-white mt-0.5">
                {card.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Nivel {card.level || 1} / 3
              </p>
            </div>

            {/* Habilidad de Power-Up */}
            {card.powerUpAction ? (
              <div className="bg-slate-950/80 p-2 rounded-xl border border-amber-500/30 my-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span>⚡ Habilidad Activa:</span>
                </p>
                <p className="text-[11px] font-medium text-slate-200 mt-0.5 leading-tight">
                  {card.powerUpAction === 'REMOVE_OPTION'
                    ? `Elimina ${card.powerUpValue || 2} opciones incorrectas`
                    : card.powerUpAction === 'EXTRA_CHANCE'
                    ? 'Segunda oportunidad si fallás la pregunta'
                    : card.powerUpAction === 'REVEAL_ANSWER'
                    ? 'Revela la respuesta correcta'
                    : card.powerUpAction === 'MULTIPLY_SCORE'
                    ? 'Multiplica x2 los puntos de la pregunta'
                    : card.powerUpAction === 'MULTIPLY_TIME'
                    ? 'Congela el tiempo por 3 segundos'
                    : card.powerUpAction}
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 my-2 text-center">
                <span className="text-[10px] text-slate-500 font-medium">
                  Carta estándar sin habilidad activa
                </span>
              </div>
            )}

            {/* Categorías asignadas */}
            {card.categories && card.categories.length > 0 && (
              <div className="mt-1.5">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Categorías:
                </p>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {card.categories.map((c, i) => (
                    <span
                      key={i}
                      className="text-[8px] bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-medium truncate"
                    >
                      {getCategoryLabel(c.key)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-[8px] text-center text-slate-500 font-mono italic">
            Click para volver al frente
          </p>
        </div>
      </div>
    </div>
  );
}