// api/src/auth/auth.controller.ts
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { GoogleUser } from './strategies/google.strategy';

// Le enseñamos a TypeScript que nuestra Request viene con el usuario adentro
interface RequestWithUser extends Request {
  user: GoogleUser;
}

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Eliminamos el @Req() req porque no se usa.
    // El Guard redirige automáticamente a Google.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response): void {
    // Ahora 'user' está tipado estrictamente como GoogleUser, chau any!
    const user = req.user;

    console.log('✅ ¡Usuario logueado con éxito!', user);

    // Redirigimos al frontend (res.redirect no retorna nada, por ende la función es void)
    res.redirect('http://localhost:3001?login=success');
  }
}
