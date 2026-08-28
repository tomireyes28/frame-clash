// web/src/components/admin/MovieModal.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TmdbMovie } from '@/services/tmdb.service';
import { OFFICIAL_CATEGORIES } from '@/utils/categories';

interface MovieModalProps {
  movie: TmdbMovie;
  onClose: () => void;
  onSave: (
    movie: TmdbMovie,
    rarity: string,
    categories: string[],
    powerUpAction?: string,
    powerUpValue?: number,
  ) => void;
}

const RARITIES = [
  { key: 'COMMON', label: 'Común', color: 'border-zinc-500 text-zinc-300 bg-zinc-800/40' },
  { key: 'UNCOMMON', label: 'Inusual', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40' },
  { key: 'RARE', label: 'Rara', color: 'border-sky-500 text-sky-300 bg-sky-950/40' },
  { key: 'EPIC', label: 'Épica', color: 'border-purple-500 text-purple-300 bg-purple-950/40' },
  { key: 'LEGENDARY', label: 'Legendaria', color: 'border-amber-400 text-amber-300 bg-amber-950/40' },
];

const POWER_UP_ACTIONS = [
  { key: '', label: 'Sin Power-Up (Carta Estándar)' },
  { key: 'REMOVE_OPTION', label: '✂️ Eliminar 2 Opciones (50/50)' },
  { key: 'EXTRA_CHANCE', label: '🛡️ Escudo / Segunda Oportunidad' },
  { key: 'REVEAL_ANSWER', label: '👁️ Revelar Respuesta Correcta' },
  { key: 'MULTIPLY_SCORE', label: '⚡ Multiplicador de Puntos (x2)' },
  { key: 'MULTIPLY_TIME', label: '⏱️ Congelar / Extender Tiempo' },
];

export default function MovieModal({ movie, onClose, onSave }: MovieModalProps) {
  const [rarity, setRarity] = useState('COMMON');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [powerUpAction, setPowerUpAction] = useState('');
  const [powerUpValue, setPowerUpValue] = useState<number>(2);

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  const handleSave = () => {
    if (selectedCategories.length === 0) {
      alert('⚠️ Debes seleccionar al menos 1 categoría oficial.');
      return;
    }
    onSave(
      movie,
      rarity,
      selectedCategories,
      powerUpAction ? powerUpAction : undefined,
      powerUpAction ? powerUpValue : undefined,
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative max-h-[90vh]">
        {/* Poster */}
        <div className="w-full md:w-1/3 bg-slate-950 relative hidden md:block border-r border-slate-800">
          {movie.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              Sin póster
            </div>
          )}
        </div>

        {/* Controles de Forja */}
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
          >
            ✕
          </button>

          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Forja de Cartas
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mt-1">
            {movie.title}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 font-mono mb-4">
            Año: {movie.release_date?.substring(0, 4) || 'N/A'} • TMDB ID: {movie.id}
          </p>

          {/* 1. SELECCIÓN DE RAREZA */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Rareza Oficial:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {RARITIES.map((r) => {
                const isSelected = rarity === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRarity(r.key)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-md font-black'
                        : `${r.color} hover:brightness-125`
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. POWER-UP OPCIONAL */}
          <div className="mb-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              Habilidad / Power-Up de la Carta:
            </label>
            <select
              value={powerUpAction}
              onChange={(e) => setPowerUpAction(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {POWER_UP_ACTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. CATEGORÍAS (31 Oficiales) */}
          <div className="mb-4 flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Categorías ({selectedCategories.length} seleccionadas)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Mínimo 1 requerida
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
              {OFFICIAL_CATEGORIES.map((cat) => {
                const isChecked = selectedCategories.includes(cat.key);
                return (
                  <label
                    key={cat.key}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl cursor-pointer text-xs transition border ${
                      isChecked
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400/50 font-bold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.key)}
                      className="accent-amber-400 w-3.5 h-3.5"
                    />
                    <span className="truncate">
                      {cat.icon} {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs text-slate-400 hover:text-white font-bold rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/40 transition cursor-pointer"
            >
              🔨 Forjar y Guardar Carta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}