// web/src/components/layout/MobileTopBar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { profileService, UserProfileData } from '@/services/profile.service';
import { soundManager } from '@/utils/audio';
import Cookies from 'js-cookie';
import { Volume2, VolumeX } from 'lucide-react';

export default function MobileTopBar() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundManager.getMuted());

    const token = Cookies.get('frameclash_token');
    if (!token) return;

    profileService
      .getProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Error fetching topbar profile:', err));
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playButtonClick();
    }
  };

  if (!profile) return null;

  const { user } = profile;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-2.5 py-1.5 flex items-center justify-between shadow-lg">
      {/* 1. PERFIL / AVATAR + NIVEL */}
      <Link
        href="/profile"
        onClick={() => soundManager.playButtonClick()}
        className="flex items-center gap-2 group cursor-pointer"
      >
        <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-900 border-2 border-amber-400/80 shadow-md shadow-amber-950/40">
          {user.image ? (
            <Image src={user.image} alt={user.name || 'Avatar'} fill className="object-cover" sizes="32px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[7px] font-black px-1 rounded-full border border-slate-900">
            {user.level}
          </span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-[10px] font-black text-white leading-tight truncate max-w-[80px] group-hover:text-amber-400 transition">
            {user.name?.split(' ')[0] || 'Jugador'}
          </span>
          <span className="text-[8px] text-amber-400/90 font-mono">
            Nv. {user.level}
          </span>
        </div>
      </Link>

      {/* 2. RECURSOS DEL JUEGO (Monedas, Polvo, ELO) & AUDIO */}
      <div className="flex items-center gap-1.5">
        {/* Monedas */}
        <Link
          href="/shop"
          onClick={() => soundManager.playButtonClick()}
          className="flex items-center gap-1 bg-slate-900/90 border border-amber-400/30 px-1.5 py-0.5 rounded-xl shadow-inner hover:border-amber-400 transition group"
        >
          <span className="text-[11px]">🪙</span>
          <span className="text-[11px] font-black text-amber-400 font-mono">
            {user.coins.toLocaleString('es-AR')}
          </span>
          <span className="w-3 h-3 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black flex items-center justify-center ml-0.5 group-hover:scale-110 transition">
            +
          </span>
        </Link>

        {/* Polvo Estelar */}
        <Link
          href="/inventory"
          onClick={() => soundManager.playButtonClick()}
          className="flex items-center gap-1 bg-slate-900/90 border border-purple-400/30 px-1.5 py-0.5 rounded-xl shadow-inner hover:border-purple-400 transition group"
        >
          <span className="text-[11px]">✨</span>
          <span className="text-[11px] font-black text-purple-300 font-mono">
            {user.stardust.toLocaleString('es-AR')}
          </span>
        </Link>

        {/* ELO Rating */}
        <Link
          href="/leaderboard"
          onClick={() => soundManager.playButtonClick()}
          className="flex items-center gap-1 bg-slate-900/90 border border-sky-400/30 px-1.5 py-0.5 rounded-xl shadow-inner hover:border-sky-400 transition"
        >
          <span className="text-[11px]">🏆</span>
          <span className="text-[11px] font-black text-sky-400 font-mono">
            {user.eloRating || 1000}
          </span>
        </Link>

        {/* MUTE / UNMUTE BUTTON */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          className={`p-1.5 rounded-xl border transition cursor-pointer ${
            isMuted
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-400 hover:bg-rose-900/80'
              : 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
          }`}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </header>
  );
}
