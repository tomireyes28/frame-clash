// web/src/app/admin/vault/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CardsService, VaultCard, CardCategory } from '@/services/cards.service'; 
import EditCardModal from '@/components/admin/EditCardModal';

export default function VaultDashboard() {
  // 🔥 Chau anys de los states
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<VaultCard | null>(null);

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

  // Usamos Record<string, number> para tipar el acumulador de estadísticas
  const stats = cards.reduce((acc: Record<string, number>, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { total: 0, COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 });

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white p-8">
      <header className="mb-6 border-b border-gray-700 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-400 tracking-wider drop-shadow-md">LA BÓVEDA</h1>
          <p className="text-gray-300 font-light mt-1">Gestión y Auditoría del Mazo</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border border-gray-600 transition-colors">
          🔙 Volver a La Forja
        </Link>
      </header>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="flex gap-4 text-sm font-bold bg-[#09090b] p-4 rounded-lg border border-gray-800 shadow-lg mb-8 justify-between items-center">
        <span className="text-white bg-blue-600 px-4 py-2 rounded">Total en Bóveda: {stats.total}</span>
        <div className="flex gap-6 text-lg">
          <span className="text-gray-300">⚪ {stats.COMMON}</span>
          <span className="text-green-400">🟢 {stats.UNCOMMON}</span>
          <span className="text-blue-400">🔵 {stats.RARE}</span>
          <span className="text-purple-400">🟣 {stats.EPIC}</span>
          <span className="text-yellow-400">🟡 {stats.LEGENDARY}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl animate-pulse text-blue-400 font-bold">Abriendo compuertas...</p>
        </div>
      ) : (
        <div className="bg-[#09090b] rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 uppercase text-xs tracking-wider">
                <th className="p-4">Película</th>
                <th className="p-4">Año</th>
                <th className="p-4">Rareza</th>
                <th className="p-4">Categorías</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {cards.map((card) => (
                <tr key={card.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-bold">{card.title}</td>
                  <td className="p-4 text-gray-400">{card.year}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-black ${
                      card.rarity === 'LEGENDARY' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                      card.rarity === 'EPIC' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                      card.rarity === 'RARE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                      card.rarity === 'UNCOMMON' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                      'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                    }`}>
                      {card.rarity}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-400 max-w-xs truncate">
                    {/* 🔥 Tipado estricto en el map de categorías */}
                    {card.categories?.map((c: CardCategory) => c.key).join(', ') || 'Ninguna'}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setEditingCard(card)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">La bóveda está vacía. Ve a La Forja para crear cartas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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