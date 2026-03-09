// web/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/layout/Navigation'; // 👈 Importamos el componente

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Frame Clash',
  description: 'El juego de cartas definitivo para cinéfilos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* Agregamos pb-16 (padding bottom) para que el BottomNav móvil no tape el contenido 
        y md:pl-64 (padding left) para que el Sidebar de escritorio no tape el contenido 
      */}
      <body className={`${inter.className} bg-black text-white pb-16 md:pb-0 md:pl-64 min-h-screen`}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}