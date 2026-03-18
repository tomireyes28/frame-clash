// src/components/shop/ShopHeader.tsx
import React from 'react';

interface ShopHeaderProps {
  currentCoins: number | null;
}

export default function ShopHeader({ currentCoins }: ShopHeaderProps) {
  return (
    <div className="w-full max-w-4xl flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
      <h1 className="text-4xl font-black uppercase tracking-widest text-[#E50914] drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]">
        Mercado Negro
      </h1>
      <div className="bg-[#0f3a61] px-6 py-2 rounded-full border border-blue-800 shadow-lg flex items-center gap-2">
        <span className="text-xl">🪙</span>
        <span className="font-bold text-yellow-400 text-lg">
          {currentCoins !== null ? currentCoins : '???'}
        </span>
      </div>
    </div>
  );
}