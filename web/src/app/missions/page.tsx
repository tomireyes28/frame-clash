// web/src/app/missions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { missionService, Mission } from '@/services/mission.service';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-rose-950/60 border border-rose-700 p-6 rounded-2xl text-center max-w-md">
          <p className="text-rose-400 font-bold text-lg mb-2">🚨 {error}</p>
          <Link href="/" className="text-xs text-slate-400 underline hover:text-white">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      <div className="max-w-3xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent mb-1">
              Misiones Diarias
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Completá objetivos para ganar monedas y experiencia extra.
            </p>
          </div>
          <Link
            href="/play"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition"
          >
            🎮 Jugar
          </Link>
        </div>

        {/* LISTA DE MISIONES */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {missions.map((mission) => {
            const rawPercentage = (mission.currentValue / mission.targetValue) * 100;
            const progressPercentage = Math.min(rawPercentage, 100);
            const isDone = mission.isCompleted;

            return (
              <motion.div
                key={mission.id}
                variants={cardVariants}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                  isDone
                    ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <h3 className={`text-base md:text-lg font-bold ${isDone ? 'text-emerald-400' : 'text-white'}`}>
                      {mission.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {isDone ? '✅ Objetivo Completado' : 'En progreso'}
                    </p>
                  </div>

                  {/* Badge de Recompensa */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-inner">
                    <span className="text-base">🪙</span>
                    <span className="font-extrabold text-amber-400 text-sm">+{mission.rewardCoins}</span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="w-full relative z-10 mt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 font-mono">
                    <span>{isDone ? '¡Completada!' : 'Progreso'}</span>
                    <span className={isDone ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {mission.currentValue} / {mission.targetValue}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isDone
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}