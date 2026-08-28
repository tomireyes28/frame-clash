// web/src/components/layout/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, Flame, Play, Layers, ShoppingBag, Target, Trophy } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dominio', href: '/play/domination', icon: Crown },
  { name: 'Roguelike', href: '/play/roguelite', icon: Flame },
  { name: 'Trivia', href: '/play', icon: Play },
  { name: 'Álbum', href: '/inventory', icon: Layers },
  { name: 'Tienda', href: '/shop', icon: ShoppingBag },
  { name: 'Misiones', href: '/missions', icon: Target },
  { name: 'Ranking', href: '/leaderboard', icon: Trophy },
];

export default function Navigation() {
  const pathname = usePathname();

  // No mostramos la navegación en Admin ni en la landing / login
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/') {
    return null;
  }

  return (
    <>
      {/* 📱 MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-50 pb-safe shadow-2xl">
        <div className="flex justify-around items-center h-16 px-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/play' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full py-1 transition-all ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] tracking-wider mt-0.5">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 💻 DESKTOP SIDEBAR */}
      <nav className="hidden md:flex flex-col w-60 fixed top-0 left-0 h-screen bg-slate-950 border-r border-slate-800/80 z-50 p-5">
        <div className="mb-6 pl-2">
          <Link href="/">
            <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent tracking-wider uppercase drop-shadow-md">
              FRAME CLASH
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">Movie Trivia TCG</p>
          </Link>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/play' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-300 border border-amber-400/40 font-bold shadow-md shadow-amber-950/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Perfil del Usuario en Desktop */}
        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
            🎬
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">Cinéfilo</p>
            <p className="text-[10px] text-amber-400/90 font-mono">Nivel 1</p>
          </div>
        </div>
      </nav>
    </>
  );
}