// web/src/components/domination/DominationMap.tsx
'use client';

import React from 'react';
import { CategoryDominationMap, DominationNodeInfo } from '@/services/domination.service';
import { motion } from 'framer-motion';

interface DominationMapProps {
  categoryMap: CategoryDominationMap;
  onSelectNode: (node: DominationNodeInfo) => void;
  onBack: () => void;
}

export default function DominationMap({ categoryMap, onSelectNode, onBack }: DominationMapProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-4 px-4 pb-24">
      {/* HEADER DE CATEGORÍA */}
      <div className="w-full flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
        >
          ← Elegir Otra Categoría
        </button>

        <div className="flex items-center gap-3 text-center">
          <span className="text-3xl md:text-4xl">{categoryMap.categoryIcon}</span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2 justify-center">
              {categoryMap.categoryName}
              {categoryMap.isMastered && <span title="¡Dominio Absoluto!">👑</span>}
            </h2>
            <span className="text-xs font-mono font-bold text-amber-400">
              ⭐ {categoryMap.totalStars} / {categoryMap.maxStars} Estrellas
            </span>
          </div>
        </div>

        <div className="hidden sm:block w-24 text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
            Progreso
          </span>
          <span className="text-sm font-black text-emerald-400 font-mono">
            {Math.round((categoryMap.totalStars / categoryMap.maxStars) * 100)}%
          </span>
        </div>
      </div>

      {/* MAPA DE LOS 10 NODOS */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mt-2">
        {categoryMap.nodes.map((node) => {
          const isCompleted = node.status === 'COMPLETED';
          const isUnlocked = node.status === 'UNLOCKED';
          const isLocked = node.status === 'LOCKED';
          const isBoss = node.isBossNode;

          let cardStyle = 'bg-slate-900/50 border-slate-800/80 opacity-50 cursor-not-allowed';
          if (isCompleted) {
            cardStyle = 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-400/80 shadow-lg shadow-amber-950/30 hover:scale-103 cursor-pointer';
          } else if (isUnlocked) {
            cardStyle = 'bg-gradient-to-br from-sky-950/60 to-slate-900 border-sky-400 shadow-xl shadow-sky-950/40 hover:scale-105 ring-2 ring-sky-400/40 cursor-pointer animate-pulse';
          }

          return (
            <motion.div
              whileHover={isLocked ? {} : { scale: 1.04, y: -4 }}
              whileTap={isLocked ? {} : { scale: 0.96 }}
              key={node.nodeNumber}
              onClick={() => {
                if (!isLocked) onSelectNode(node);
              }}
              className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-between text-center min-h-[165px] transition-all duration-300 ${cardStyle}`}
            >
              {/* Badge de Boss o Número */}
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                  {isBoss ? '👑 BOSS' : `Fase ${node.nodeNumber}`}
                </span>

                {isLocked && <span className="text-xs">🔒</span>}
              </div>

              {/* Contenido Central */}
              <div className="my-2 flex flex-col items-center">
                {isBoss ? (
                  <span className="text-4xl mb-1">👑</span>
                ) : isCompleted ? (
                  <span className="text-3xl mb-1">🏆</span>
                ) : isUnlocked ? (
                  <span className="text-3xl mb-1 text-sky-400">⚔️</span>
                ) : (
                  <span className="text-3xl mb-1 opacity-40">🎬</span>
                )}

                <span className="text-xs font-bold text-slate-200 line-clamp-1 mt-0.5">
                  {node.title}
                </span>
              </div>

              {/* Estrellas o Requisitos */}
              <div className="w-full">
                {isCompleted ? (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-1 text-sm text-amber-400">
                      {'★'.repeat(node.stars)}
                      {'☆'.repeat(3 - node.stars)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">
                      {node.bestScore.toLocaleString('es-AR')} pts
                    </span>
                  </div>
                ) : isUnlocked ? (
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-400/40 block">
                    ¡JUGAR!
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Requiere Fase {node.nodeNumber - 1}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
