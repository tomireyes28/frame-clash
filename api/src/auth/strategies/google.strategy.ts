// api/src/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';

// Creamos nuestro tipo estricto
export type GoogleUser = {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      // Le agregamos el || '' para asegurarle a TS que nunca será undefined
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  // Usamos el tipo Profile oficial y sacamos el async porque no hay promesas adentro
  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): GoogleUser {
    const { name, emails, photos } = profile;
    // Armamos el objeto respetando la interfaz GoogleUser
    const user: GoogleUser = {
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || '',
      accessToken,
    };
    // NestJS permite retornar el usuario directamente sin usar el callback (done)
    return user;
  }
}
