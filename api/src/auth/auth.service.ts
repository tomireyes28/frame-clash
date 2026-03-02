// api/src/auth/auth.service.ts
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
    const user = await this.usersService.findOrCreate({
      email: googleUser.email,
      name: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
      image: googleUser.picture,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
