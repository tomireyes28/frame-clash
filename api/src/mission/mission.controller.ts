import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MissionService } from './mission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@Controller('mission')
@UseGuards(JwtAuthGuard) // 🛡️ Blindamos la ruta
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get()
  async getMissions(@Req() req: RequestWithJwtUser) {
    const userId = req.user.id; 
    return this.missionService.getDailyMissions(userId);
  }
}