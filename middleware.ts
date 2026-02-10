import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Busca o cookie de sessão
  const session = request.cookies.get("usuario_session");
  const { pathname } = request.nextUrl;

  // 1. Se o usuário NÃO está logado e tenta acessar o DASHBOARD
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Se o usuário JÁ ESTÁ logado e tenta acessar o LOGIN (página raiz)
  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// O matcher define quais caminhos o middleware vai vigiar
export const config = {
  matcher: [
    /*
     * Vigia todos os caminhos exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};