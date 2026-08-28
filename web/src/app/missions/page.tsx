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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-slate-400 text-xs font-mono">Cargando misiones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <div className="bg-rose-950/60 border border-rose-700 p-4 rounded-2xl text-center">
          <p className="text-rose-400 font-bold text-xs mb-2">🚨 {error}</p>
          <Link href="/" className="text-xs text-slate-400 underline">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      {/* ENCABEZADO */}
      <div className="w-full text-center mb-3">
        <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
          🎯 Recompensas Diarias
        </span>
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
          Misiones Diarias
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Completá desafíos para ganar monedas y experiencia extra.
        </p>
      </div>

      {/* LISTA DE MISIONES */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full flex flex-col gap-2.5"
      >
        {missions.map((mission) => {
          const rawPercentage = (mission.currentValue / mission.targetValue) * 100;
          const progressPercentage = Math.min(rawPercentage, 100);
          const isDone = mission.isCompleted;

          return (
            <motion.div
              key={mission.id}
              variants={cardVariants}
              className={`relative overflow-hidden rounded-2xl border p-3.5 transition shadow-sm ${
                isDone
                  ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/50'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={`text-xs font-bold ${isDone ? 'text-emerald-400' : 'text-white'}`}>
                    {mission.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isDone ? '✅ Objetivo Completado' : 'En progreso'}
                  </p>
                </div>

                {/* Badge de Recompensa */}
                <div className="bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
                  <span className="text-xs">🪙</span>
                  <span className="font-black text-amber-400 text-xs">+{mission.rewardCoins}</span>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full mt-1.5">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1 font-mono">
                  <span>Progreso</span>
                  <span className={isDone ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {mission.currentValue} / {mission.targetValue}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
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
  );
}