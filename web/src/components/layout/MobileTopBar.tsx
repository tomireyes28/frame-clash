// web/src/components/layout/MobileTopBar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { profileService, UserProfileData } from '@/services/profile.service';
import Cookies from 'js-cookie';

export default function MobileTopBar() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const token = Cookies.get('frameclash_token');
    if (!token) return;

    profileService
      .getProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Error fetching topbar profile:', err));
  }, []);

  if (!profile) return null;

  const { user } = profile;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3 py-2 flex items-center justify-between shadow-lg">
      {/* 1. PERFIL / AVATAR + NIVEL */}
      <Link href="/profile" className="flex items-center gap-2 group cursor-pointer">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border-2 border-amber-400/80 shadow-md shadow-amber-950/40">
          {user.image ? (
            <Image src={user.image} alt={user.name || 'Avatar'} fill className="object-cover" sizes="36px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[8px] font-black px-1 rounded-full border border-slate-900">
            {user.level}
          </span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-[11px] font-black text-white leading-tight truncate max-w-[90px] group-hover:text-amber-400 transition">
            {user.name?.split(' ')[0] || 'Jugador'}
          </span>
          <span className="text-[9px] text-amber-400/90 font-mono">
            Nv. {user.level}
          </span>
        </div>
      </Link>

      {/* 2. RECURSOS DEL JUEGO (Monedas, Polvo, ELO) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Monedas */}
        <Link
          href="/shop"
          className="flex items-center gap-1 bg-slate-900/90 border border-amber-400/30 px-2 py-1 rounded-xl shadow-inner hover:border-amber-400 transition group"
        >
          <span className="text-xs">🪙</span>
          <span className="text-xs font-black text-amber-400 font-mono">
            {user.coins.toLocaleString('es-AR')}
          </span>
          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center ml-0.5 group-hover:scale-110 transition">
            +
          </span>
        </Link>

        {/* Polvo Estelar */}
        <Link
          href="/inventory"
          className="flex items-center gap-1 bg-slate-900/90 border border-purple-400/30 px-2 py-1 rounded-xl shadow-inner hover:border-purple-400 transition group"
        >
          <span className="text-xs">✨</span>
          <span className="text-xs font-black text-purple-300 font-mono">
            {user.stardust.toLocaleString('es-AR')}
          </span>
        </Link>

        {/* ELO Rating */}
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 bg-slate-900/90 border border-sky-400/30 px-2 py-1 rounded-xl shadow-inner hover:border-sky-400 transition"
        >
          <span className="text-xs">🏆</span>
          <span className="text-xs font-black text-sky-400 font-mono">
            {user.eloRating || 1000}
          </span>
        </Link>
      </div>
    </header>
  );
}
