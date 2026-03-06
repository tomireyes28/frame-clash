// src/app/shop/page.tsx
'use client';

import { useState } from 'react';
import { shopService, BuyPackResponse } from '@/services/shop.service';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packResult, setPackResult] = useState<BuyPackResponse | null>(null);

  const handleBuyPack = async () => {
    setIsLoading(true);
    setError(null);
    setPackResult(null);

    try {
      const result = await shopService.buyStandardPack();
      setPackResult(result);
      
      // 🎉 ¡EXPLOSIÓN DE CONFETI DE VICTORIA!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E50914', '#EAB308', '#3B82F6', '#8B5CF6'],
        zIndex: 100
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al intentar comprar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Hace que aparezcan una tras otra (0.2s de diferencia)
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.5, rotateY: 90 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      rotateY: 0,
      transition: { type: 'spring', bounce: 0.5, duration: 0.8 } 
    },
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 font-sans flex flex-col items-center overflow-x-hidden">
      
      {/* HEADER DE LA TIENDA */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-widest text-[#E50914] drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]">
          Mercado Negro
        </h1>
        <div className="bg-[#0f3a61] px-6 py-2 rounded-full border border-blue-800 shadow-lg flex items-center gap-2">
          <span className="text-xl">🪙</span>
          <span className="font-bold text-yellow-400 text-lg">
            {packResult ? packResult.newBalance : '???'}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ZONA DE COMPRA */}
        {!packResult && (
          <motion.div 
            key="shop-front"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm bg-black/50 border border-gray-800 rounded-2xl p-8 flex flex-col items-center shadow-2xl"
          >
            {/* Animación de temblor al comprar */}
            <motion.div 
              animate={isLoading ? { 
                x: [-5, 5, -5, 5, 0], 
                y: [-2, 2, -2, 2, 0],
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ repeat: isLoading ? Infinity : 0, duration: 0.4 }}
              className="w-40 h-56 bg-linear-to-br from-purple-900 to-indigo-900 rounded-xl mb-6 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center relative overflow-hidden"
            >
              <span className="text-6xl absolute opacity-20 rotate-12">🎬</span>
              <span className="text-2xl font-black text-white z-10 uppercase tracking-widest text-center drop-shadow-lg">
                Sobre<br/>Estándar
              </span>
            </motion.div>
            
            <button
              onClick={handleBuyPack}
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-black text-xl tracking-widest uppercase transition-all flex justify-center items-center gap-2 ${
                isLoading 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
              }`}
            >
              {isLoading ? 'Abriendo...' : 'Comprar (100 🪙)'}
            </button>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-red-500 font-bold text-center bg-red-900/20 p-3 rounded-lg border border-red-900 w-full"
              >
                🚨 {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ZONA DE RESULTADOS (El Botín) */}
        {packResult && (
          <motion.div 
            key="pack-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl flex flex-col items-center"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-5xl font-black text-green-400 mb-12 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
            >
              ¡Nuevas Cartas!
            </motion.h2>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-wrap justify-center gap-4 md:gap-6"
            >
              {packResult.cards.map((card, index) => (
                <motion.div 
                  variants={cardVariants}
                  key={`${card.id}-${index}`} 
                  className="relative w-32 md:w-48 aspect-2/3 rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl bg-black"
                >
                  {card.posterPath ? (
                    <Image src={`${TMDB_IMAGE_BASE}${card.posterPath}`} alt={card.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center font-bold text-gray-400">
                      {card.title}
                    </div>
                  )}
                  
                  {/* Badge de Nueva o Repetida */}
                  {card.isNew ? (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-black px-3 py-1 text-xs md:text-sm font-black uppercase rotate-12 shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10">
                      ¡Nueva!
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs md:text-sm font-black rounded shadow-md border border-blue-400 z-10">
                      x{card.quantity}
                    </div>
                  )}
                  
                  {/* Etiqueta de Rareza */}
                  <div className="absolute bottom-0 w-full bg-linear-to-t from-black via-black/80 to-transparent pt-6 pb-2 text-center border-t border-gray-800/50">
                    <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-gray-300 drop-shadow-md">
                      {card.rarity}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }} // Aparece después de que terminen las cartas
              onClick={() => setPackResult(null)}
              className="mt-16 px-8 py-4 bg-[#E50914] text-white font-black text-lg uppercase tracking-widest rounded shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:scale-105 transition-transform"
            >
              Abrir otro sobre
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}