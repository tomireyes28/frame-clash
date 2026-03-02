// api/src/auth/interfaces/auth.interface.ts

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}