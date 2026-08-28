// web/src/app/inventory/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { inventoryService, InventoryCard } from '@/services/inventory.service';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard, { CardData } from '@/components/game/GameCard';
import { OFFICIAL_CATEGORIES } from '@/utils/categories';
import Link from 'next/link';

const RARITY_TABS = [
  { key: 'ALL', label: 'Todas', badge: 'bg-slate-800 text-white border-slate-700' },
  { key: 'COMMON', label: 'Común', badge: 'bg-zinc-800 text-zinc-300 border-zinc-500' },
  { key: 'UNCOMMON', label: 'Inusual', badge: 'bg-emerald-950 text-emerald-300 border-emerald-500' },
  { key: 'RARE', label: 'Rara', badge: 'bg-sky-950 text-sky-300 border-sky-400' },
  { key: 'EPIC', label: 'Épica', badge: 'bg-purple-950 text-purple-300 border-purple-500' },
  { key: 'LEGENDARY', label: 'Legendaria', badge: 'bg-amber-950 text-amber-300 border-amber-400' },
];

export default function InventoryPage() {
  const [cards, setCards] = useState<InventoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadInventory = async () => {
    try {
      const data = await inventoryService.getInventory();
      setCards(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filtrado reactivo en memoria
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // 1. Filtro de rareza
      if (selectedRarity !== 'ALL' && card.rarity !== selectedRarity) {
        return false;
      }
      // 2. Filtro de categoría
      if (selectedCategory !== 'ALL') {
        const matchesCategory = card.categories?.some((c) => c.key === selectedCategory);
        if (!matchesCategory) return false;
      }
      // 3. Filtro de búsqueda por texto
      if (searchQuery.trim().length > 0) {
        const matchTitle = card.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchTitle) return false;
      }
      return true;
    });
  }, [cards, selectedRarity, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
            Álbum de Cartas
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {cards.length} Cartas Coleccionadas
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/shop"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-950/40 transition"
          >
            🛒 Comprar Sobres
          </Link>
          <Link
            href="/play"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
          >
            🎮 Ir al Juego
          </Link>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col gap-4">
        {/* Barra de Búsqueda y Selector de Categoría */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por título de película..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/60 transition cursor-pointer"
          >
            <option value="ALL">Todas las Categorías ({OFFICIAL_CATEGORIES.length})</option>
            {OFFICIAL_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pestañas de las 5 Rarezas Oficiales */}
        <div className="flex flex-wrap gap-2 pt-1">
          {RARITY_TABS.map((tab) => {
            const isSelected = selectedRarity === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedRarity(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${tab.badge} ${
                  isSelected ? 'ring-2 ring-amber-400 shadow-md scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRILLA DE CARTAS */}
      <div className="max-w-7xl mx-auto">
        {filteredCards.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-4xl mb-2">🃏</p>
            <p className="text-lg font-bold text-slate-300">No se encontraron cartas con esos filtros.</p>
            <p className="text-xs text-slate-500 mt-1">¡Abrí más sobres en la tienda para expandir tu colección!</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
          >
            <AnimatePresence>
              {filteredCards.map((card) => {
                const gameCardData: CardData = {
                  id: card.id,
                  tmdbId: card.tmdbId || 0,
                  title: card.title,
                  year: card.year || 2024,
                  posterPath: card.posterPath,
                  rarity: card.rarity || 'COMMON',
                  level: card.level || 1,
                  powerUpAction: card.powerUpAction,
                  powerUpValue: card.powerUpValue,
                  categories: card.categories || [],
                };

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={card.id}
                    className="flex flex-col items-center bg-slate-900/80 backdrop-blur-sm p-2.5 rounded-2xl border border-slate-800/80 hover:border-slate-700 shadow-lg transition-colors"
                  >
                    <div className="relative w-full aspect-[2/3] mb-2">
                      {/* Badge de Nivel */}
                      <div className="absolute -top-2 -right-2 z-30 bg-slate-950 px-2 py-0.5 text-[10px] font-black rounded-full border border-amber-400 text-amber-300 shadow-lg">
                        Lvl {card.level || 1}
                      </div>

                      {/* Badge de Copias */}
                      {card.quantity > 1 && (
                        <div className="absolute -top-2 -left-2 z-30 bg-sky-600 px-2 py-0.5 text-[10px] font-black rounded-full text-white shadow-lg border border-sky-400">
                          x{card.quantity}
                        </div>
                      )}

                      <GameCard
                        card={gameCardData}
                        size="full"
                        isFlippable={true}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}