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

  const filteredCards = useMemo(() => {
    const cardList = Array.isArray(cards) ? cards : [];
    return cardList.filter((card) => {
      if (selectedRarity !== 'ALL' && card.rarity !== selectedRarity) {
        return false;
      }
      if (selectedCategory !== 'ALL') {
        const matchesCategory = card.categories?.some((c) => c.key === selectedCategory);
        if (!matchesCategory) return false;
      }
      if (searchQuery.trim().length > 0) {
        const matchTitle = card.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchTitle) return false;
      }
      return true;
    });
  }, [cards, selectedRarity, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 font-mono text-xs">Cargando tu Álbum de Cartas...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      {/* HEADER */}
      <div className="w-full text-center mb-3">
        <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
          🃏 Colección TCG
        </span>
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
          Álbum de Cartas
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {cards.length} Películas coleccionadas en tu cuenta
        </p>
      </div>

      {/* FILTROS TÁCTILES DESLIZABLES */}
      <div className="w-full flex flex-col gap-2 mb-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-md">
        {/* Pestañas de Rarezas */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {RARITY_TABS.map((tab) => {
            const isSelected = selectedRarity === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedRarity(tab.key)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : `${tab.badge} hover:brightness-125`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Buscador & Categorías */}
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 transition cursor-pointer"
          >
            <option value="ALL">Todas las Categorías (31)</option>
            {OFFICIAL_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GRILLA DE CARTAS 2 COLUMNAS MÓVIL */}
      <div className="w-full">
        {filteredCards.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            <span className="text-3xl block mb-2">🃏</span>
            <p className="font-bold text-slate-300">No se encontraron cartas</p>
            <Link href="/shop" className="text-amber-400 underline mt-2 block font-semibold">
              Abrir sobres en la Tienda ➔
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
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
                <div key={item.id} className="flex flex-col gap-1">
                  <div
                    onClick={() => setSelectedCard(item)}
                    className="w-full aspect-[2/3] cursor-pointer hover:scale-102 transition-transform"
                  >
                    <GameCard card={cardData} size="full" isFlippable={false} />
                  </div>

                  {/* Badges de Copias y Nivel */}
                  <div className="flex justify-between items-center bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800 text-[10px]">
                    <span className="text-amber-400 font-black font-mono">
                      NVL {item.level || 1}
                    </span>
                    <span className="text-slate-400 font-medium">
                      x{item.quantity || 1}
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
              className="bg-slate-900 border border-slate-800 w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-3 relative"
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="w-44 aspect-[2/3] my-1">
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
                <h3 className="text-sm font-black text-white">{selectedCard.title}</h3>
                <p className="text-[10px] text-slate-400">Año: {selectedCard.year}</p>
                <div className="mt-2 flex justify-around bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nivel</span>
                    <span className="text-amber-400 font-bold">{selectedCard.level || 1}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Copias</span>
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