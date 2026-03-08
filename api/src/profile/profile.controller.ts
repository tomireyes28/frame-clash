import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@Controller('profile')
@UseGuards(JwtAuthGuard) // 🛡️ Blindamos la ruta
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: RequestWithJwtUser) {
    const userId = req.user.id; // 👈 Sacamos el ID del Token directamente
    return this.profileService.getUserProfile(userId);
  }
}