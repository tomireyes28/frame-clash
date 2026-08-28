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

  return (
    <div className="w-full flex flex-col items-center gap-3.5 py-1 px-2 pb-8">
      {/* HEADER COMPACTO */}
      <div className="text-center">
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
          Modo Dominio
        </h1>
        <p className="text-[11px] text-slate-400">
          31 Campañas de 10 Fases. Dominá el cine y ganá estrellas ⭐.
        </p>
      </div>

      {/* ESTADÍSTICAS MÓVILES COMPACTAS */}
      <div className="w-full grid grid-cols-2 gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl text-center shadow-lg">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Estrellas</span>
          <span className="text-base font-black text-amber-400 font-mono">
            ⭐ {totalStarsEarned} / 930
          </span>
        </div>

        <div className="flex flex-col items-center border-l border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Dominadas</span>
          <span className="text-base font-black text-emerald-400 font-mono">
            👑 {totalMastered} / 31
          </span>
        </div>
      </div>

      {/* PESTAÑAS DE FILTRO TÁCTILES DESLIZABLES */}
      <div className="w-full flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedTab === 'all'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Todas (31)
        </button>
        <button
          onClick={() => setSelectedTab('genre')}
          className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedTab === 'genre'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🎭 Géneros (14)
        </button>
        <button
          onClick={() => setSelectedTab('decade')}
          className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedTab === 'decade'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          ⏳ Décadas (6)
        </button>
        <button
          onClick={() => setSelectedTab('theme')}
          className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedTab === 'theme'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🌟 Temáticas (11)
        </button>
      </div>

      {/* GRILLA DE 2 COLUMNAS PARA CELULAR */}
      <div className="w-full grid grid-cols-2 gap-2.5">
        {filteredCategories.map((cat) => {
          const progressPercent = Math.min(100, (cat.totalStars / 30) * 100);

          return (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              key={cat.categoryId}
              onClick={() => onSelectCategory(cat)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-md relative overflow-hidden ${
                cat.isMastered
                  ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-400 shadow-amber-950/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-400/60'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{cat.icon}</span>
                {cat.isMastered && (
                  <span className="text-sm" title="¡Dominio Absoluto!">
                    👑
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs font-black text-white leading-tight truncate">
                  {cat.name}
                </h3>
                <span className="text-[9px] text-slate-400 font-mono block mb-2">
                  {cat.completedNodes}/10 Fases
                </span>

                {/* Barra de Progreso de Estrellas */}
                <div className="w-full flex items-center justify-between text-[9px] font-mono text-amber-400 font-bold mb-1">
                  <span>⭐ {cat.totalStars}</span>
                  <span className="text-slate-500">/30</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cat.isMastered
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
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
