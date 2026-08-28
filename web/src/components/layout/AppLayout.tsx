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
    <div className="min-h-screen bg-slate-950 text-white flex justify-center selection:bg-amber-400 selection:text-slate-950">
      {/* Marco de Dispositivo Móvil */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 border-x border-slate-800/60 shadow-2xl flex flex-col relative pb-20">
        <MobileTopBar />
        <main className="flex-1 w-full">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
