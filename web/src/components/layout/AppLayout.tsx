// web/src/components/layout/AppLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import MobileTopBar from './MobileTopBar';
import MobileBottomNav from './MobileBottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = pathname === '/login';

  if (isAdmin || isAuth) {
    return <main className="min-h-screen bg-slate-950 text-white">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden md:p-4">
      {/* 🌌 CINEMATIC THEATER BACKDROP (Para pantallas de escritorio / Desktop) */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block overflow-hidden">
        {/* Luz de Proyector / Reflectores de Sala de Cine */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-500/10 via-rose-600/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-purple-900/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-sky-900/10 blur-3xl rounded-full" />
        {/* Grilla sutil arcade */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* 📱 CONSOLA / DISPOSITIVO MÓVIL DEL JUEGO */}
      <div className="w-full max-w-md min-h-screen md:min-h-[840px] md:max-h-[92vh] bg-slate-950 md:rounded-[36px] md:border-2 md:border-amber-400/30 md:shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_25px_rgba(251,191,36,0.15)] flex flex-col relative z-10 overflow-hidden">
        <MobileTopBar />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-20 no-scrollbar">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
