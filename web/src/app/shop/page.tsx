// web/src/app/shop/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { shopService, BuyPackResponse } from '@/services/shop.service';
import { AnimatePresence, motion } from 'framer-motion';
import ShopHeader from '@/components/shop/ShopHeader';
import PackDisplay from '@/components/shop/PackDisplay';
import PackOpeningModal from '@/components/shop/PackOpeningModal';

// 📚 Los 5 Sobres Oficiales con drop rates y garantías
const AVAILABLE_PACKS = [
  {
    id: 'BRONZE',
    name: 'Bronce',
    price: 100,
    emoji: '🥉',
    guaranteeText: '3 Cartas (Común / Inusual)',
    colorClasses: 'bg-gradient-to-r from-amber-950/80 to-slate-900 border-amber-700/60 shadow-amber-950/30',
  },
  {
    id: 'SILVER',
    name: 'Plata',
    price: 250,
    emoji: '🥈',
    guaranteeText: '4 Cartas (1 Inusual garantizada)',
    colorClasses: 'bg-gradient-to-r from-slate-800 to-slate-900 border-zinc-400/60 shadow-zinc-950/30',
  },
  {
    id: 'GOLD',
    name: 'Oro',
    price: 500,
    emoji: '🥇',
    guaranteeText: '5 Cartas (1 Rara garantizada)',
    colorClasses: 'bg-gradient-to-r from-yellow-950/80 to-slate-900 border-amber-400/80 shadow-amber-950/40',
  },
  {
    id: 'PLATINUM',
    name: 'Platino',
    price: 1000,
    emoji: '💠',
    guaranteeText: '5 Cartas (1 Épica garantizada)',
    colorClasses: 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400/80 shadow-cyan-950/40',
  },
  {
    id: 'DIAMOND',
    name: 'Diamante',
    price: 2500,
    emoji: '💎',
    guaranteeText: '5 Cartas (Alta prob. Legendaria)',
    colorClasses: 'bg-gradient-to-r from-fuchsia-950/80 to-slate-900 border-fuchsia-400/80 shadow-fuchsia-950/40',
  },
];

export default function ShopPage() {
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packResult, setPackResult] = useState<BuyPackResponse | null>(null);
  const [activePackName, setActivePackName] = useState<string>('Oro');
  const [currentCoins, setCurrentCoins] = useState<number | null>(null);

  useEffect(() => {
    shopService
      .getUserBalance()
      .then((coins) => setCurrentCoins(coins))
      .catch(() => setCurrentCoins(0));
  }, []);

  const handleBuyPack = async (packId: string) => {
    setLoadingPackId(packId);
    setError(null);

    const pack = AVAILABLE_PACKS.find((p) => p.id === packId);
    if (pack) setActivePackName(pack.name);

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
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      <ShopHeader />

      {/* Alertas de error */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 w-full bg-rose-950/60 border border-rose-600 text-rose-200 p-3 rounded-2xl text-center text-xs font-bold"
        >
          🚨 {error}
        </motion.div>
      ) : null}

      <div className="w-full flex flex-col gap-2.5">
        {AVAILABLE_PACKS.map((pack) => (
          <PackDisplay
            key={pack.id}
            packId={pack.id}
            name={pack.name}
            price={pack.price}
            guaranteeText={pack.guaranteeText}
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
      </div>

      {/* MODAL 3D GACHA DE APERTURA DE SOBRE */}
      <AnimatePresence>
        {packResult ? (
          <PackOpeningModal
            packResult={packResult}
            packName={activePackName}
            onClose={() => setPackResult(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}