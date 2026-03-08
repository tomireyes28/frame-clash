// src/app/missions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { missionService, Mission } from '@/services/mission.service';
import { motion, Variants } from 'framer-motion';

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const data = await missionService.getDailyMissions();
        setMissions(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissions();
  }, []);

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

  // Animaciones coreografiadas
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* ENCABEZADO */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-md mb-2">
            Misiones Diarias
          </h1>
          <p className="text-gray-400 font-bold">Completa los objetivos para ganar monedas extra.</p>
        </motion.div>

        {/* LISTA DE MISIONES */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5"
        >
          {missions.map((mission) => {
            // Calculamos el porcentaje, asegurándonos de que no pase del 100%
            const rawPercentage = (mission.currentValue / mission.targetValue) * 100;
            const progressPercentage = Math.min(rawPercentage, 100);
            const isDone = mission.isCompleted;

            return (
              <motion.div 
                key={mission.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                className={`relative overflow-hidden rounded-2xl border ${
                  isDone 
                    ? 'bg-linear-to-r from-green-900/40 to-black border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                    : 'bg-linear-to-r from-[#0f3a61]/50 to-black border-gray-800 hover:border-gray-600'
                } p-6 transition-all duration-300`}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-wider ${isDone ? 'text-green-400' : 'text-white'}`}>
                      {mission.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest">
                      Recompensa
                    </p>
                  </div>
                  
                  {/* Badge de Recompensa */}
                  <div className="bg-black/50 border border-gray-700 rounded-full px-4 py-1 flex items-center gap-2 shadow-inner">
                    <span className="text-xl">🪙</span>
                    <span className="font-black text-yellow-400 text-lg">{mission.rewardCoins}</span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="w-full relative z-10">
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                    <span>{isDone ? '¡COMPLETADA!' : 'Progreso'}</span>
                    <span className={isDone ? 'text-green-400' : 'text-white'}>
                      {mission.currentValue} / {mission.targetValue}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800 shadow-inner relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className={`h-full ${
                        isDone 
                          ? 'bg-linear-to-r from-green-500 to-green-400' 
                          : 'bg-linear-to-r from-[#E50914] to-red-500' // Rojo Pochoclo para el progreso
                      }`}
                    ></motion.div>
                  </div>
                </div>

                {/* Destello de fondo si está completada */}
                {isDone && (
                  <div className="absolute top-0 right-0 w-32 h-full bg-white opacity-5 skew-x-12 translate-x-10"></div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}