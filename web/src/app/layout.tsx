// web/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Frame Clash — Movie Trivia Card Game',
  description: 'Juego de trivia de cine con cartas coleccionables y power-ups estratégicos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen antialiased selection:bg-amber-500 selection:text-slate-950`}>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}