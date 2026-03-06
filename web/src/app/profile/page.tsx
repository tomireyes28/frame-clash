// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { profileService, UserProfileData } from '@/services/profile.service';
import { motion, Variants } from 'framer-motion'; // <-- Importamos Variants
import Image from 'next/image'; // <-- Importamos el componente optimizado de Next.js

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfileData(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <p className="text-red-500 font-bold text-xl">🚨 {error || 'Error al cargar el perfil'}</p>
      </div>
    );
  }

  const { user, stats, recentActivity } = profileData;
  const progressPercentage = (user.currentLevelProgress / user.xpForNextLevel) * 100;

  // 🛠️ SOLUCIÓN: Le asignamos el tipo explícito Variants a nuestras animaciones
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* ENCABEZADO: FOTO Y NIVEL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-linear-to-r from-[#0f3a61] to-black border border-gray-800 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl mb-8"
        >
          {/* Avatar Optimizada */}
          <div className="relative w-32 h-32 rounded-full border-4 border-[#E50914] overflow-hidden bg-black flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.4)] shrink-0">
            {user.image ? (
              // 🛠️ SOLUCIÓN: Usamos Next Image
              <Image 
                src={user.image} 
                alt={user.name || 'Avatar'} 
                fill 
                sizes="(max-width: 768px) 128px, 128px"
                className="object-cover" 
              />
            ) : (
              <span className="text-5xl">👤</span>
            )}
            <div className="absolute bottom-0 w-full z-10 bg-[#E50914] text-center text-xs font-black uppercase tracking-widest py-1">
              NVL {user.level}
            </div>
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-2 drop-shadow-md">
              {user.name || 'Gladiador Anónimo'}
            </h1>
            <p className="text-gray-400 font-bold mb-6 flex items-center justify-center md:justify-start gap-4">
              <span className="flex items-center gap-1">🪙 {user.coins} Monedas</span>
              <span className="flex items-center gap-1 text-blue-400">⚡ {user.xp} XP Total</span>
            </p>

            {/* Barra de Experiencia */}
            <div className="w-full">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                <span>Progreso a Nvl {user.level + 1}</span>
                <span>{user.currentLevelProgress} / {user.xpForNextLevel} XP</span>
              </div>
              <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-linear-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GRILLA DE ESTADÍSTICAS */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-black/50 border border-gray-800 p-6 rounded-2xl text-center shadow-lg hover:border-gray-600 transition-colors">
            <span className="text-3xl block mb-2">🎮</span>
            <p className="text-3xl md:text-4xl font-black text-white">{stats.totalGames}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Partidas</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-black/50 border border-gray-800 p-6 rounded-2xl text-center shadow-lg hover:border-gray-600 transition-colors">
            <span className="text-3xl block mb-2">🏆</span>
            <p className="text-3xl md:text-4xl font-black text-green-400">{stats.highestScore}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Récord Pts</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-black/50 border border-gray-800 p-6 rounded-2xl text-center shadow-lg hover:border-gray-600 transition-colors">
            <span className="text-3xl block mb-2">📊</span>
            <p className="text-3xl md:text-4xl font-black text-blue-400">{stats.averageScore}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Promedio</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-black/50 border border-gray-800 p-6 rounded-2xl text-center shadow-lg hover:border-gray-600 transition-colors">
            <span className="text-3xl block mb-2">🃏</span>
            <p className="text-3xl md:text-4xl font-black text-yellow-400">{stats.uniqueCardsCount}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Cartas Únicas</p>
          </motion.div>
        </motion.div>

        {/* HISTORIAL RECIENTE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/50 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl"
        >
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">
            Últimas Batallas
          </h2>
          
          {recentActivity.length === 0 ? (
            <p className="text-center text-gray-500 font-bold py-8">No hay registros en el Coliseo aún.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentActivity.map((session, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚔️</span>
                    <div>
                      <p className="font-bold text-gray-300">Modo Arcade</p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()} - {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="font-black text-xl text-green-400">
                    {session.score} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}