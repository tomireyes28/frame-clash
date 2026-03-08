// src/app/leaderboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { leaderboardService, RankedPlayer } from '@/services/leaderboard.service';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Por ahora dejamos el modo fijo en ARCADE, a futuro puede ser un botón que cambie el estado
  const currentMode = 'ARCADE'; 

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardService.getLeaderboard(currentMode);
        setPlayers(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <p className="text-red-500 font-bold text-xl">🚨 {error}</p>
      </div>
    );
  }

  // Animaciones
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  // Función utilitaria para los colores del podio
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]'; // Oro
      case 2: return 'bg-gray-300/20 border-gray-400 text-gray-300 shadow-[0_0_10px_rgba(156,163,175,0.2)]';     // Plata
      case 3: return 'bg-amber-700/20 border-amber-600 text-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.2)]';    // Bronce
      default: return 'bg-black/50 border-gray-800 text-gray-400 hover:border-gray-600';                         // Resto
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* ENCABEZADO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-md mb-2">
            Salón de la Fama
          </h1>
          <div className="inline-block bg-[#E50914] text-white font-black uppercase tracking-widest px-4 py-1 rounded-full text-sm mt-2">
            MODO {currentMode}
          </div>
        </motion.div>

        {players.length === 0 ? (
          <div className="text-center text-gray-500 font-bold py-10 bg-black/50 rounded-2xl border border-gray-800">
            Aún no hay registros en este modo. ¡Sé el primero en jugar!
          </div>
        ) : (
          /* LISTA DE JUGADORES */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            {players.map((player) => (
              <motion.div 
                key={player.userId}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${getRankStyle(player.rank)}`}
              >
                <div className="flex items-center gap-4 md:gap-6">
                  {/* Número de Puesto */}
                  <div className="w-8 md:w-12 text-center font-black text-2xl md:text-3xl">
                    {player.rank === 1 ? '👑' : `#${player.rank}`}
                  </div>
                  
                  {/* Avatar Optimizada */}
                  <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-current bg-black shrink-0">
                    {player.image ? (
                      <Image 
                        src={player.image} 
                        alt={player.name} 
                        fill 
                        sizes="64px"
                        className="object-cover" 
                      />
                    ) : (
                      <span className="text-2xl flex items-center justify-center w-full h-full">👤</span>
                    )}
                  </div>

                  {/* Nombre */}
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-wider truncate max-w-30 md:max-w-75">
                    {player.name}
                  </h3>
                </div>

                {/* Puntaje */}
                <div className="text-right">
                  <p className="text-sm md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Puntos</p>
                  <p className="text-xl md:text-3xl font-black font-mono tracking-tighter">
                    {player.score.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
}