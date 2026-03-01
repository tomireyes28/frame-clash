// api/src/auth/auth.controller.ts
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { GoogleUser } from './strategies/google.strategy';
import { AuthService } from './auth.service';

interface RequestWithUser extends Request {
  user: GoogleUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    // 1. Procesamos el login y obtenemos el JWT
    const token = await this.authService.loginWithGoogle(req.user);
    // 2. Redirigimos al frontend pasándole el token por la URL
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
}
