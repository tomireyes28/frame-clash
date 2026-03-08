import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { GoogleUser } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithGoogle(googleUser: GoogleUser): Promise<string> {
    // 1. Leemos el correo admin desde el .env (soportando múltiples separados por coma por las dudas)
    const adminEmails = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim());
    
    // 2. Verificamos si el correo que entra por Google está en la lista VIP
    const isAdmin = adminEmails.includes(googleUser.email);

    // 3. Le pasamos el rol directamente a la función creadora
    const user = await this.usersService.findOrCreate({
      email: googleUser.email,
      name: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
      image: googleUser.picture,
      role: isAdmin ? 'ADMIN' : 'USER', // 👈 ¡La magia de la coronación!
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role, // Ahora este rol viaja inyectado en el Token JWT
    };

    return this.jwtService.sign(payload);
  }
}