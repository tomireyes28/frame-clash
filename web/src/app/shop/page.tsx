// src/app/shop/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { shopService, BuyPackResponse } from '@/services/shop.service';
import { AnimatePresence, motion } from 'framer-motion';
import ShopHeader from '@/components/shop/ShopHeader';
import PackDisplay from '@/components/shop/PackDisplay';
import PackResults from '@/components/shop/PackResults';

// 📚 El catálogo de sobres disponibles
const AVAILABLE_PACKS = [
  {
    id: 'STANDARD',
    name: 'Estándar',
    price: 100,
    emoji: '🎬',
    colorClasses: 'bg-linear-to-br from-purple-900 to-indigo-900 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]',
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 500,
    emoji: '💎',
    colorClasses: 'bg-linear-to-br from-yellow-700 to-amber-900 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]',
  },
  {
    id: 'DIRECTOR',
    name: 'Director',
    price: 1000,
    emoji: '🎥',
    colorClasses: 'bg-linear-to-br from-red-900 to-black border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]',
  }
];

export default function ShopPage() {
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packResult, setPackResult] = useState<BuyPackResponse | null>(null);
  const [currentCoins, setCurrentCoins] = useState<number | null>(null);

  useEffect(() => {
    shopService.getUserBalance()
      .then(coins => setCurrentCoins(coins))
      .catch(() => setCurrentCoins(0));
  }, []);

  const handleBuyPack = async (packId: string) => {
    setLoadingPackId(packId);
    setError(null);
    setPackResult(null);

    try {
      const result = await shopService.buyPack(packId);
      setPackResult(result);
      setCurrentCoins(result.newBalance); 
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al conectar con la tienda.');
      }
    } finally {
      setLoadingPackId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 font-sans flex flex-col items-center overflow-x-hidden">
      
      <ShopHeader currentCoins={currentCoins} />

      {/* Alertas de error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 w-full max-w-4xl bg-red-900/40 border border-red-500 text-red-200 p-4 rounded-lg text-center font-bold"
        >
          🚨 {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!packResult ? (
          <motion.div 
            key="shop-catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center"
          >
            {AVAILABLE_PACKS.map(pack => (
              <PackDisplay
                key={pack.id}
                packId={pack.id}
                name={pack.name}
                price={pack.price}
                colorClasses={pack.colorClasses}
                emoji={pack.emoji}
                isLoading={loadingPackId === pack.id}
                disabled={
                  (loadingPackId !== null && loadingPackId !== pack.id) || 
                  (currentCoins !== null && currentCoins < pack.price)
                }
                onBuy={handleBuyPack}
              />
            ))}
          </motion.div>
        ) : (
          <PackResults 
            key="pack-results"
            packResult={packResult} 
            onClose={() => setPackResult(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}