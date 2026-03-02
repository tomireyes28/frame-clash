// api/src/auth/auth.controller.ts
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { GoogleUser } from './strategies/google.strategy';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: GoogleUser;
}

interface RequestWithJwtUser extends Request {
  user: User;
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: RequestWithJwtUser): User {
    return req.user;
  }
}
