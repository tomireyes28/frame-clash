// src/app/shop/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { shopService, BuyPackResponse } from '@/services/shop.service';
import { AnimatePresence, motion } from 'framer-motion';
import ShopHeader from '@/components/shop/ShopHeader';
import PackDisplay from '@/components/shop/PackDisplay';
import PackResults from '@/components/shop/PackResults';

// 📚 Los 5 Sobres Oficiales
const AVAILABLE_PACKS = [
  {
    id: 'BRONZE',
    name: 'Bronce',
    price: 100,
    emoji: '🥉',
    colorClasses: 'bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 border-amber-700 shadow-[0_0_25px_rgba(180,83,9,0.3)]',
  },
  {
    id: 'SILVER',
    name: 'Plata',
    price: 250,
    emoji: '🥈',
    colorClasses: 'bg-gradient-to-br from-slate-700 via-zinc-800 to-stone-900 border-zinc-400 shadow-[0_0_25px_rgba(161,161,170,0.3)]',
  },
  {
    id: 'GOLD',
    name: 'Oro',
    price: 500,
    emoji: '🥇',
    colorClasses: 'bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-950 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]',
  },
  {
    id: 'PLATINUM',
    name: 'Platino',
    price: 1000,
    emoji: '💠',
    colorClasses: 'bg-gradient-to-br from-cyan-800 via-sky-900 to-slate-950 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.45)]',
  },
  {
    id: 'DIAMOND',
    name: 'Diamante',
    price: 2500,
    emoji: '💎',
    colorClasses: 'bg-gradient-to-br from-fuchsia-800 via-indigo-900 to-slate-950 border-fuchsia-400 shadow-[0_0_40px_rgba(232,121,249,0.5)]',
  },
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
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans flex flex-col items-center overflow-x-hidden">
      <ShopHeader currentCoins={currentCoins} />

      {/* Alertas de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 w-full max-w-4xl bg-rose-950/60 border border-rose-600 text-rose-200 p-4 rounded-xl text-center font-bold"
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
            className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 place-items-stretch"
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