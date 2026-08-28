// web/src/app/admin/vault/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CardsService, VaultCard, CardCategory } from '@/services/cards.service';
import EditCardModal from '@/components/admin/EditCardModal';
import { OFFICIAL_CATEGORIES } from '@/utils/categories';

const getCategoryLabel = (key: string) => {
  const cat = OFFICIAL_CATEGORIES.find((c) => c.key === key);
  return cat ? `${cat.icon} ${cat.label}` : key;
};

export default function VaultDashboard() {
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<VaultCard | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await CardsService.getAllCards();
      setCards(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCard = async (
    id: string,
    rarity: string,
    categories: string[],
    powerUpAction?: string,
    powerUpValue?: number,
  ) => {
    try {
      await CardsService.updateCard(id, rarity, categories, powerUpAction, powerUpValue);
      await fetchCards();
      setEditingCard(null);
    } catch (error) {
      alert(`❌ ERROR al actualizar: ${error instanceof Error ? error.message : 'Desconocido'}`);
    }
  };

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase());
      const matchesRarity = filterRarity ? card.rarity === filterRarity : true;
      const matchesCategory = filterCategory
        ? card.categories?.some((c) => c.key === filterCategory)
        : true;

      return matchesSearch && matchesRarity && matchesCategory;
    });
  }, [cards, search, filterRarity, filterCategory]);

  const { rarityStats, categoryStats } = useMemo(() => {
    const rStats: Record<string, number> = {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0,
    };
    const cStats: Record<string, number> = {};

    cards.forEach((card) => {
      rStats[card.rarity] = (rStats[card.rarity] || 0) + 1;
      card.categories?.forEach((cat) => {
        cStats[cat.key] = (cStats[cat.key] || 0) + 1;
      });
    });

    const sortedCategories = Object.entries(cStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { rarityStats: rStats, categoryStats: sortedCategories };
  }, [cards]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-6 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Bóveda de Cine
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent">
            La Bóveda de Cartas
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-0.5">
            Inventario curado del mazo ({cards.length} cartas activas en la base de datos)
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md"
          >
            🔨 Forjar Nuevas Películas
          </Link>
          <Link
            href="/admin/collections"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
          >
            📚 Sets Curados
          </Link>
        </div>
      </header>

      {/* DASHBOARD DE ESTADÍSTICAS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Panel Rarezas */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">
            Distribución de las 5 Rarezas Oficiales
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-bold font-mono">
            <span className="bg-zinc-900 text-zinc-300 px-3 py-1 rounded-xl border border-zinc-700">
              ⚪ Común: {rarityStats.COMMON}
            </span>
            <span className="bg-emerald-950 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500">
              🟢 Inusual: {rarityStats.UNCOMMON}
            </span>
            <span className="bg-sky-950 text-sky-300 px-3 py-1 rounded-xl border border-sky-400">
              🔵 Rara: {rarityStats.RARE}
            </span>
            <span className="bg-purple-950 text-purple-300 px-3 py-1 rounded-xl border border-purple-500">
              🟣 Épica: {rarityStats.EPIC}
            </span>
            <span className="bg-amber-950 text-amber-300 px-3 py-1 rounded-xl border border-amber-400">
              🟡 Legendaria: {rarityStats.LEGENDARY}
            </span>
          </div>
        </div>

        {/* Panel Categorías Top */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">
            Top Categorías Asignadas
          </h3>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {categoryStats.map(([key, count]) => (
              <span
                key={key}
                className="bg-slate-950 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-800"
              >
                {getCategoryLabel(key)} <strong className="text-amber-400 font-mono ml-1">{count}</strong>
              </span>
            ))}
            {categoryStats.length === 0 && (
              <span className="text-slate-500 italic text-xs">No hay categorías asignadas aún.</span>
            )}
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 mb-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        <input
          type="text"
          placeholder="🔎 Buscar carta en bóveda por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-400 transition"
        />

        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-bold cursor-pointer"
        >
          <option value="">🔮 Todas las Rarezas</option>
          <option value="COMMON">⚪ Común</option>
          <option value="UNCOMMON">🟢 Inusual</option>
          <option value="RARE">🔵 Rara</option>
          <option value="EPIC">🟣 Épica</option>
          <option value="LEGENDARY">🟡 Legendaria</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="">🎭 Todas las Categorías (31)</option>
          {OFFICIAL_CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* GRILLA VISUAL DE CARTAS */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4 font-bold">
              Mostrando {filteredCards.length} carta{filteredCards.length !== 1 && 's'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {filteredCards.map((card) => {
                const rarityStyles: Record<string, { border: string; badge: string }> = {
                  COMMON: { border: 'border-zinc-600', badge: 'bg-zinc-800 text-zinc-300 border-zinc-600' },
                  UNCOMMON: { border: 'border-emerald-500', badge: 'bg-emerald-950 text-emerald-300 border-emerald-500' },
                  RARE: { border: 'border-sky-500', badge: 'bg-sky-950 text-sky-300 border-sky-400' },
                  EPIC: { border: 'border-purple-500', badge: 'bg-purple-950 text-purple-300 border-purple-500' },
                  LEGENDARY: { border: 'border-amber-400 shadow-lg shadow-amber-950/40', badge: 'bg-amber-400 text-slate-950 border-amber-300 font-black' },
                };
                const style = rarityStyles[card.rarity] || rarityStyles.COMMON;

                return (
                  <div
                    key={card.id}
                    className={`group relative rounded-2xl overflow-hidden border-2 bg-slate-900 aspect-[2/3] flex flex-col transition-all hover:scale-103 shadow-xl ${style.border}`}
                  >
                    {/* PÓSTER */}
                    <div className="absolute inset-0 bg-slate-950 z-0">
                      {card.posterPath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${card.posterPath}`}
                          alt={card.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 15vw"
                          className="object-cover opacity-65 group-hover:opacity-45 transition-opacity duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">
                          Sin póster
                        </div>
                      )}
                    </div>

                    {/* OVERLAY DE DATOS */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-2.5 flex flex-col justify-end">
                      {/* Badge de Rareza */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-md ${style.badge}`}
                        >
                          {card.rarity}
                        </span>
                      </div>

                      <h3 className="font-black text-xs leading-tight mb-0.5 text-white drop-shadow-md line-clamp-2">
                        {card.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 mb-1.5 font-mono">{card.year}</p>

                      {/* Categorías */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {card.categories?.slice(0, 2).map((c: CardCategory) => (
                          <span
                            key={c.key}
                            className="text-[8px] bg-slate-950/80 border border-slate-800 text-slate-300 px-1 py-0.5 rounded truncate max-w-[80px]"
                          >
                            {getCategoryLabel(c.key)}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setEditingCard(card)}
                        className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200 cursor-pointer shadow-md"
                      >
                        ✏️ Editar Carta
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                <span className="text-5xl mb-3 block">🎬</span>
                <h2 className="text-lg font-bold text-slate-300">No se encontraron cartas en la bóveda</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Probá forjando nuevas cartas desde el buscador de TMDB.
                </p>
                <Link
                  href="/admin"
                  className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md"
                >
                  🔨 Ir a La Forja
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingCard && (
        <EditCardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleUpdateCard}
        />
      )}
    </div>
  );
}