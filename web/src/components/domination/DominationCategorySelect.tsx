// web/src/components/domination/DominationCategorySelect.tsx
'use client';

import React, { useState } from 'react';
import { CategoryOverview } from '@/services/domination.service';
import { motion } from 'framer-motion';

interface DominationCategorySelectProps {
  categories: CategoryOverview[];
  onSelectCategory: (category: CategoryOverview) => void;
  isLoading: boolean;
}

export default function DominationCategorySelect({
  categories,
  onSelectCategory,
  isLoading,
}: DominationCategorySelectProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'genre' | 'decade' | 'theme'>('all');

  const filteredCategories = categories.filter((c) => {
    if (selectedTab === 'all') return true;
    return c.type === selectedTab;
  });

  const totalMastered = categories.filter((c) => c.isMastered).length;
  const totalStarsEarned = categories.reduce((sum, c) => sum + c.totalStars, 0);
  const totalPossibleStars = categories.length * 30;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 py-4 px-4 pb-20">
      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider mb-2">
          Modo Dominio
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Conquistá los <span className="text-amber-400 font-bold">10 Nodos de Maestría</span> en cada una de las 31 categorías de cine. Desbloqueá nodos paso a paso y obtené la corona de Dominio Absoluto 👑.
        </p>
      </div>

      {/* ESTADÍSTICAS GLOBALES */}
      <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center shadow-xl">
        <div className="flex flex-col items-center">
          <span className="text-xl md:text-2xl mb-0.5">⭐</span>
          <span className="text-lg md:text-2xl font-black text-amber-400 font-mono">
            {totalStarsEarned} / {totalPossibleStars}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold">
            Estrellas Totales
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-slate-800">
          <span className="text-xl md:text-2xl mb-0.5">👑</span>
          <span className="text-lg md:text-2xl font-black text-emerald-400 font-mono">
            {totalMastered} / {categories.length}
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold">
            Categorías Dominadas
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 flex flex-col items-center">
          <span className="text-xl md:text-2xl mb-0.5">⚔️</span>
          <span className="text-lg md:text-2xl font-black text-sky-400 font-mono">
            {Math.round((totalStarsEarned / (totalPossibleStars || 1)) * 100)}%
          </span>
          <span className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold">
            Progreso Mundial
          </span>
        </div>
      </div>

      {/* PESTAÑAS DE FILTRO */}
      <div className="flex gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Todas (31)
        </button>
        <button
          onClick={() => setSelectedTab('genre')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'genre' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🎭 Géneros (14)
        </button>
        <button
          onClick={() => setSelectedTab('decade')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'decade' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          ⏳ Décadas (6)
        </button>
        <button
          onClick={() => setSelectedTab('theme')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'theme' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🌟 Temáticas (11)
        </button>
      </div>

      {/* GRILLA DE CATEGORÍAS */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
        {filteredCategories.map((cat) => {
          const progressPercent = Math.min(100, (cat.totalStars / 30) * 100);

          return (
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              key={cat.categoryId}
              onClick={() => onSelectCategory(cat)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] shadow-lg ${
                cat.isMastered
                  ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-400/80 shadow-amber-950/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-400/60'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white line-clamp-1">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {cat.completedNodes}/10 Fases
                    </span>
                  </div>
                </div>

                {cat.isMastered && (
                  <span className="text-lg" title="¡Dominio Absoluto!">
                    👑
                  </span>
                )}
              </div>

              {/* Barra de Estrellas */}
              <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1 font-mono">
                  <span>Progreso</span>
                  <span className="text-amber-400 font-bold">
                    ⭐ {cat.totalStars}/30
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.isMastered
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md shadow-amber-400/50'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
