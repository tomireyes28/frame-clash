// src/app/inventory/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { inventoryService, InventoryCard } from '@/services/inventory.service';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard, { CardData } from '@/components/game/GameCard';

export default function InventoryPage() {
  const [cards, setCards] = useState<InventoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);

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

  const handleUpgrade = async (cardId: string) => {
    setUpgradingId(cardId);
    setUpgradeError(null);
    try {
      const result = await inventoryService.upgradeCard(cardId);
      await loadInventory();
      alert(`🎉 ${result.message}\nTe quedan ${result.newBalance} monedas.`);
    } catch (err) {
      if (err instanceof Error) {
        setUpgradeError(err.message);
        setTimeout(() => setUpgradeError(null), 3000);
      }
    } finally {
      setUpgradingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10 border-b border-gray-800 pb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-widest text-white drop-shadow-md">
            Mi <span className="text-[#E50914]">Colección</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2">
            {cards.length} Cartas Únicas Descubiertas
          </p>
        </div>
      </div>

      {/* ERROR FLOTANTE */}
      <AnimatePresence>
        {upgradeError && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white font-bold px-6 py-3 rounded-full shadow-2xl z-50 border-2 border-red-400"
          >
            🚨 {upgradeError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRILLA DE CARTAS */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
        {cards.map((card) => {
          const currentLevel = card.level;
          const isMaxLevel = currentLevel >= 5;
          const requiredDupes = currentLevel * 2;
          const currentDupes = card.quantity - 1; 
          const progressPercent = Math.min((currentDupes / requiredDupes) * 100, 100);
          const canUpgrade = currentDupes >= requiredDupes && !isMaxLevel;
          const upgradeCost = currentLevel * 50;

          // 🔥 Tipado estricto sin ANY usando la interfaz CardData
          const gameCardData: CardData = {
            id: card.id,
            tmdbId: card.tmdbId || 0,
            title: card.title,
            year: card.year || 2024,
            posterPath: card.posterPath,
            rarity: card.rarity || 'COMMON',
            categories: card.categories || [],
          };

          return (
            <div key={card.id} className="flex flex-col items-center bg-black/40 p-3 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors">
              
              <div className="relative w-full aspect-2/3 mb-4">
                <div className="absolute -top-3 -right-3 z-30 bg-black px-2 py-1 text-[10px] md:text-xs font-black rounded-full border border-yellow-500 text-yellow-500 shadow-xl">
                  {isMaxLevel ? 'MAX' : `Nvl ${currentLevel}`}
                </div>

                <GameCard 
                  card={gameCardData} 
                  size="full" 
                  isFlippable={true} 
                />
              </div>

              {/* BARRA DE PROGRESO / BOTÓN DE MEJORA */}
              <div className="w-full">
                {isMaxLevel ? (
                  <div className="w-full py-2 bg-yellow-600/20 text-yellow-500 text-center text-xs font-black rounded uppercase tracking-widest border border-yellow-600/50">
                    Nivel Máximo
                  </div>
                ) : canUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(card.id)}
                    disabled={upgradingId === card.id}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-black rounded uppercase tracking-widest shadow-[0_0_15px_rgba(22,163,74,0.5)] transition-all flex justify-center items-center gap-1"
                  >
                    {upgradingId === card.id ? 'Mejorando...' : `Mejorar (${upgradeCost}🪙)`}
                  </button>
                ) : (
                  <>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 px-1">
                      <span>Repetidas</span>
                      <span>{currentDupes} / {requiredDupes}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}