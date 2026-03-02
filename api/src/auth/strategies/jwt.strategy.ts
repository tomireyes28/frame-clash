import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { User } from '@prisma/client';
import 'dotenv/config';

// Tipamos estrictamente el payload que armamos en auth.service.ts
export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      // Le decimos que busque el token en la cabecera "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Rechaza tokens vencidos automáticamente
      secretOrKey: process.env.JWT_SECRET || '',
    });
  }

  // Esta función SOLO se ejecuta si la firma criptográfica es válida
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      // Si el token es válido pero borraste al usuario de la DB, lo rebota. (Seguridad Nivel Ssr)
      throw new UnauthorizedException(
        'Usuario no encontrado o sesión revocada.',
      );
    }

    // NestJS inyectará este usuario validado en el objeto "req.user" de nuestras rutas
    return user;
  }
}
