import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('El parámetro userId es obligatorio para ver el perfil.');
    }
    return this.profileService.getUserProfile(userId);
  }
}