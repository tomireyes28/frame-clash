import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { MissionService } from './mission.service';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get()
  async getMissions(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('Falta el userId');
    }
    return this.missionService.getDailyMissions(userId);
  }
}