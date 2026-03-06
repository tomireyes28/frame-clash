// src/app/inventory/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { inventoryService, InventoryCard } from '@/services/inventory.service';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

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
      // Animación súper simple: recargamos el inventario para ver los nuevos datos
      await loadInventory();
      alert(`🎉 ${result.message}\nTe quedan ${result.newBalance} monedas.`);
    } catch (err) {
      if (err instanceof Error) {
        setUpgradeError(err.message);
        // Borramos el error a los 3 segundos
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
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cards.map((card) => {
          // Matemática de Fusión
          const currentLevel = card.level;
          const isMaxLevel = currentLevel >= 5;
          const requiredDupes = currentLevel * 2;
          const currentDupes = card.quantity - 1; // Restamos la carta base
          const progressPercent = Math.min((currentDupes / requiredDupes) * 100, 100);
          const canUpgrade = currentDupes >= requiredDupes && !isMaxLevel;
          const upgradeCost = currentLevel * 50;

          return (
            <div key={card.id} className="flex flex-col items-center bg-black/40 p-3 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors">
              
              {/* LA CARTA */}
              <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border-2 border-[#E50914] shadow-lg mb-4">
                {card.posterPath ? (
                  <Image src={`${TMDB_IMAGE_BASE}${card.posterPath}`} alt={card.title} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center text-center p-2 font-bold text-sm">{card.title}</div>
                )}
                
                {/* Badge de Nivel */}
                <div className="absolute top-2 right-2 bg-black/90 px-2 py-1 text-xs font-black rounded-full border border-yellow-500 text-yellow-500 shadow-md">
                  {isMaxLevel ? 'MAX' : `Nvl ${currentLevel}`}
                </div>

                {/* Acción del Poder */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-2 text-center">
                  <span className="text-[10px] md:text-xs font-black text-indigo-400 tracking-widest uppercase">
                    {card.powerUpAction} {card.powerUpValue && `(${card.powerUpValue})`}
                  </span>
                </div>
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
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
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