// api/src/auth/interfaces/request.interface.ts
import { Request } from 'express';
import { User } from '@prisma/client';
import { GoogleUser } from './auth.interface';

export interface RequestWithUser extends Request {
  user: GoogleUser;
}

export interface RequestWithJwtUser extends Request {
  user: User;
}