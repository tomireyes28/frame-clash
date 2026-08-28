// web/src/components/layout/MobileBottomNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords, Layers, ShoppingBag, Trophy, Target } from 'lucide-react';

// 📚 Vercel Best Practice: rendering-hoist-jsx
const TABS = [
  { name: 'Batalla', href: '/', icon: Swords },
  { name: 'Mazo', href: '/inventory', icon: Layers },
  { name: 'Tienda', href: '/shop', icon: ShoppingBag },
  { name: 'Ranking', href: '/leaderboard', icon: Trophy },
  { name: 'Misiones', href: '/missions', icon: Target },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // No mostrar en Admin ni en Login
  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
        {TABS.map((tab) => {
          const isHome = tab.href === '/';
          const isActive = isHome ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center w-full h-full py-1 transition-all group ${
                isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive ? (
                <div className="absolute top-0 w-8 h-1 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              ) : null}
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-amber-400/15 text-amber-400' : 'group-hover:bg-slate-900'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
