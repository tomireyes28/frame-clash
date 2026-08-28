// web/src/components/layout/AppLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/' || pathname === '/login' || pathname.startsWith('/admin');

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isLanding ? '' : 'pb-16 md:pb-0 md:pl-60'}`}>
        {children}
      </main>
    </>
  );
}
