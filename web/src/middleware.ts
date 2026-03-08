import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Buscamos la cookie que guardó el AuthCatcher
  const token = request.cookies.get('frameclash_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Definimos cuáles son las Zonas VIP (Rutas Protegidas)
  const protectedRoutes = ['/play', '/profile', '/shop', '/missions', '/inventory'];

  // 3. ¿El usuario está intentando entrar a una Zona VIP?
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // ¡Alerta intruso! No tiene token. Lo pateamos de vuelta a la página principal.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si tiene token o está navegando por zonas públicas, lo dejamos pasar
  return NextResponse.next();
}

// 4. Optimizamos para que el middleware no se ejecute en imágenes, CSS o la API
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};