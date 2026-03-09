'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CardsService, VaultCard, CardCategory } from '@/services/cards.service';
import EditCardModal from '@/components/admin/EditCardModal';
import { OFFICIAL_CATEGORIES } from '@/utils/categories'; // 👈 Importamos los nombres lindos

// Helper para obtener el nombre real de la categoría
const getCategoryLabel = (key: string) => {
  const cat = OFFICIAL_CATEGORIES.find(c => c.key === key);
  return cat ? cat.label : key;
};

export default function VaultDashboard() {
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<VaultCard | null>(null);

  // 🎛️ Estados de los Filtros
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

  const handleUpdateCard = async (id: string, rarity: string, categories: string[]) => {
    try {
      await CardsService.updateCard(id, rarity, categories);
      await fetchCards(); 
      setEditingCard(null); 
    } catch (error) {
      alert(`❌ ERROR al actualizar: ${error instanceof Error ? error.message : 'Desconocido'}`);
    }
  };

  // 🔥 LÓGICA DE FILTRADO (Se recalcula automáticamente cuando cambias un filtro)
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase());
      const matchesRarity = filterRarity ? card.rarity === filterRarity : true;
      const matchesCategory = filterCategory 
        ? card.categories?.some(c => c.key === filterCategory) 
        : true;

      return matchesSearch && matchesRarity && matchesCategory;
    });
  }, [cards, search, filterRarity, filterCategory]);

  // 🔥 CÁLCULO DE ESTADÍSTICAS GLOBALES
  const { rarityStats, categoryStats } = useMemo(() => {
    const rStats: Record<string, number> = { COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
    const cStats: Record<string, number> = {};

    cards.forEach(card => {
      rStats[card.rarity] = (rStats[card.rarity] || 0) + 1;
      card.categories?.forEach(cat => {
        cStats[cat.key] = (cStats[cat.key] || 0) + 1;
      });
    });

    // Ordenamos las categorías de mayor a menor cantidad
    const sortedCategories = Object.entries(cStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8); // Mostramos solo el Top 8 para no romper el diseño

    return { rarityStats: rStats, categoryStats: sortedCategories };
  }, [cards]);

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white p-8">
      {/* 🔹 HEADER */}
      <header className="mb-8 border-b border-gray-700 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-blue-400 tracking-wider drop-shadow-md">LA BÓVEDA</h1>
          <p className="text-gray-300 font-light mt-1">Dashboard Analítico del Mazo ({cards.length} cartas totales)</p>
        </div>
        <Link href="/admin" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg border border-gray-600 transition-colors shadow-lg">
          🔙 Volver a La Forja
        </Link>
      </header>

      {/* 🔹 DASHBOARD DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Panel Rarezas */}
        <div className="bg-[#09090b] p-5 rounded-xl border border-gray-700 shadow-xl">
          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Distribución por Rareza</h3>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <span className="bg-gray-800 px-3 py-1 rounded-lg border border-gray-600">⚪ Común: {rarityStats.COMMON}</span>
            <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-lg border border-green-800">🟢 P. Común: {rarityStats.UNCOMMON}</span>
            <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-lg border border-blue-800">🔵 Rara: {rarityStats.RARE}</span>
            <span className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-lg border border-purple-800">🟣 Épica: {rarityStats.EPIC}</span>
            <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-lg border border-yellow-800">🟡 Legendaria: {rarityStats.LEGENDARY}</span>
          </div>
        </div>

        {/* Panel Categorías Top */}
        <div className="bg-[#09090b] p-5 rounded-xl border border-gray-700 shadow-xl">
          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Top Categorías</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {categoryStats.map(([key, count]) => (
              <span key={key} className="bg-blue-950/50 text-blue-300 px-3 py-1 rounded-full border border-blue-800/50">
                {getCategoryLabel(key)} <strong className="text-white ml-1">{count}</strong>
              </span>
            ))}
            {categoryStats.length === 0 && <span className="text-gray-500 italic">No hay categorías asignadas aún.</span>}
          </div>
        </div>
      </div>

      {/* 🔹 BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-[#09090b] p-4 rounded-xl border border-gray-700">
        <input 
          type="text" 
          placeholder="🔎 Buscar película por nombre..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
        />
        
        <select 
          value={filterRarity} 
          onChange={(e) => setFilterRarity(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 font-bold"
        >
          <option value="">🔮 Todas las Rarezas</option>
          <option value="COMMON">⚪ Común</option>
          <option value="UNCOMMON">🟢 Poco Común</option>
          <option value="RARE">🔵 Rara</option>
          <option value="EPIC">🟣 Épica</option>
          <option value="LEGENDARY">🟡 Legendaria</option>
        </select>

        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
        >
          <option value="">🎭 Todas las Categorías</option>
          {OFFICIAL_CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* 🔹 GRILLA VISUAL DE CARTAS */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl animate-pulse text-blue-400 font-bold">Cargando la bóveda de cine...</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4 font-bold">
            Mostrando {filteredCards.length} carta{filteredCards.length !== 1 && 's'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredCards.map((card) => {
              // Colores dinámicos según rareza
              const rarityColors: Record<string, string> = {
                COMMON: 'border-gray-500 bg-gray-500',
                UNCOMMON: 'border-green-500 bg-green-500',
                RARE: 'border-blue-500 bg-blue-500',
                EPIC: 'border-purple-500 bg-purple-500',
                LEGENDARY: 'border-yellow-500 bg-yellow-500',
              };
              const colorClass = rarityColors[card.rarity] || rarityColors.COMMON;

              return (
                <div key={card.id} className={`group relative rounded-xl overflow-hidden border-2 bg-gray-900 aspect-2/3 flex flex-col transition-all hover:scale-105 hover:shadow-2xl hover:shadow-${colorClass.split('-')[1]}-500/20 ${colorClass.replace('bg-', 'border-').split(' ')[0]}`}>
                  
                  {/* PÓSTER DE FONDO */}
                  <div className="absolute inset-0 bg-gray-800 z-0">
                    {card.posterPath ? (
                      <Image 
                        src={`https://image.tmdb.org/t/p/w500${card.posterPath}`} 
                        alt={card.title} 
                        fill 
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">Sin póster</div>
                    )}
                  </div>

                  {/* OVERLAY DE DATOS */}
                  <div className="absolute inset-0 z-10 bg-linear-to-t from-black/95 via-black/50 to-transparent p-3 flex flex-col justify-end">
                    
                    {/* Badge de Rareza Arriba */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg ${colorClass} text-black`}>
                        {card.rarity}
                      </span>
                    </div>

                    <h3 className="font-black text-sm md:text-base leading-tight mb-1 text-white drop-shadow-md line-clamp-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-300 mb-2 font-bold drop-shadow-md">{card.year}</p>

                    {/* Categorías (Máximo 2 para no romper la tarjeta) */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.categories?.slice(0, 2).map((c: CardCategory) => (
                        <span key={c.key} className="text-[9px] bg-black/60 border border-gray-600 text-gray-300 px-1.5 py-0.5 rounded backdrop-blur-sm truncate max-w-22.5">
                          {getCategoryLabel(c.key)}
                        </span>
                      ))}
                      {card.categories && card.categories.length > 2 && (
                        <span className="text-[9px] bg-black/60 border border-gray-600 text-gray-300 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          +{card.categories.length - 2}
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => setEditingCard(card)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"
                    >
                      EDITAR CARTA
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-20 bg-[#09090b] rounded-xl border border-gray-700">
              <span className="text-6xl mb-4 block">👻</span>
              <h2 className="text-2xl font-bold text-gray-400">No hay cartas que coincidan</h2>
              <p className="text-gray-500 mt-2">Prueba cambiando los filtros o buscando otra película.</p>
            </div>
          )}
        </>
      )}

      {/* 🔹 MODAL DE EDICIÓN */}
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