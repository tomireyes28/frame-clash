import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithJwtUser } from '../interfaces/request.interface'; 

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithJwtUser>();
    const user = request.user; 

    if (user && user.role === 'ADMIN') {
      return true;
    }

    throw new ForbiddenException('Acceso denegado. Esta ruta es exclusiva para Administradores de FrameClash.');
  }
}