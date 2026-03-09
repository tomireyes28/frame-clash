// web/src/components/layout/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sword, BookOpen, Store, Target } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Coliseo', href: '/play', icon: Sword },
  { name: 'Mazo', href: '/inventory', icon: BookOpen },
  { name: 'Tienda', href: '/shop', icon: Store },
  { name: 'Misiones', href: '/missions', icon: Target },
];

export default function Navigation() {
  const pathname = usePathname();

  // 🔥 No mostramos la navegación en las rutas de Admin ni en el Login
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/') {
    return null;
  }

  return (
    <>
      {/* 📱 MOBILE BOTTOM NAV (Se oculta en pantallas medianas o grandes) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#09090b]/95 backdrop-blur-md border-t border-gray-800 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-[#E50914]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 💻 DESKTOP SIDEBAR (Se oculta en celulares) */}
      <nav className="hidden md:flex flex-col w-64 fixed top-0 left-0 h-screen bg-[#09090b] border-r border-gray-800 z-50 p-6">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-[#E50914] tracking-widest drop-shadow-md">
            FRAME<br/>CLASH
          </h1>
        </div>
        
        <div className="flex flex-col gap-4 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/50 font-black' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white font-bold'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm tracking-widest uppercase">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Perfil del Usuario en Desktop */}
        <div className="mt-auto pt-6 border-t border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-xs font-bold">
            U
          </div>
          <div>
            <p className="text-xs font-bold text-white">Jugador</p>
            <p className="text-[10px] text-gray-500">Nivel 1</p>
          </div>
        </div>
      </nav>
    </>
  );
}