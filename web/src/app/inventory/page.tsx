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
  const [selectedCard, setSelectedCard] = useState<InventoryCard | null>(null);

  const loadInventory = async () => {
    try {
      const data = await inventoryService.getInventory();
      setCards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filtrado reactivo en memoria con salvaguarda
  const filteredCards = useMemo(() => {
    const cardList = Array.isArray(cards) ? cards : [];
    return cardList.filter((card) => {
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 font-mono text-sm">Cargando tu Álbum de Cartas...</p>
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
            href="/collections"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
          >
            ✨ Sets Temáticos
          </Link>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 mb-8 bg-slate-900/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-slate-800 shadow-xl">
        {/* Pestañas de Rarezas */}
        <div className="flex flex-wrap gap-2">
          {RARITY_TABS.map((tab) => {
            const isSelected = selectedRarity === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedRarity(tab.key)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/30'
                    : `${tab.badge} hover:brightness-125`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Buscador y Selector de Categorías Oficiales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar por título de película..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition cursor-pointer"
          >
            <option value="ALL">Todas las Categorías Oficiales (31)</option>
            {OFFICIAL_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.icon} {cat.label} ({cat.type === 'genre' ? 'Género' : cat.type === 'decade' ? 'Década' : 'Temática'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GRILLA DE CARTAS */}
      <div className="max-w-7xl mx-auto">
        {filteredCards.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <span className="text-5xl block mb-3">🃏</span>
            <h3 className="text-lg font-bold text-slate-300">No se encontraron cartas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Abrí sobres en la tienda o ajustá los filtros para ver tus cartas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredCards.map((item) => {
              const cardData: CardData = {
                id: item.cardId || item.id,
                tmdbId: item.tmdbId,
                title: item.title,
                year: item.year,
                posterPath: item.posterPath,
                rarity: item.rarity,
                powerUpAction: item.powerUpAction,
                powerUpValue: item.powerUpValue,
              };

              return (
                <div key={item.id} className="flex flex-col gap-2">
                  <div
                    onClick={() => setSelectedCard(item)}
                    className="w-full aspect-[2/3] cursor-pointer hover:scale-102 transition-transform"
                  >
                    <GameCard card={cardData} size="full" isFlippable={true} />
                  </div>

                  {/* Badges de Copias y Nivel */}
                  <div className="flex justify-between items-center bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-amber-400 font-bold font-mono">
                      NVL {item.level || 1}
                    </span>
                    <span className="text-slate-400 font-medium">
                      x{item.quantity || 1} {item.quantity > 1 ? 'copias' : 'copia'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE DETALLE DE CARTA */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 relative"
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>

              <div className="w-56 aspect-[2/3] my-2">
                <GameCard
                  card={{
                    id: selectedCard.cardId || selectedCard.id,
                    tmdbId: selectedCard.tmdbId,
                    title: selectedCard.title,
                    year: selectedCard.year,
                    posterPath: selectedCard.posterPath,
                    rarity: selectedCard.rarity,
                    powerUpAction: selectedCard.powerUpAction,
                    powerUpValue: selectedCard.powerUpValue,
                  }}
                  size="full"
                  isFlippable={true}
                />
              </div>

              <div className="w-full text-center">
                <h3 className="text-xl font-black text-white">{selectedCard.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Año: {selectedCard.year}</p>
                <div className="mt-3 flex justify-around bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block">Nivel</span>
                    <span className="text-amber-400 font-bold">{selectedCard.level || 1}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Cantidad</span>
                    <span className="text-white font-bold">{selectedCard.quantity || 1}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}