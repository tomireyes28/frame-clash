// api/src/leaderboard/leaderboard.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Req() req: RequestWithJwtUser,
    @Query('type') type: string = 'SCORE',
  ) {
    const userId = req.user.id;
    const cleanType = (type || 'SCORE').toUpperCase();

    if (cleanType === 'ROGUELITE') {
      return this.leaderboardService.getRogueliteLeaderboard(userId);
    } else if (cleanType === 'DOMINATION') {
      return this.leaderboardService.getDominationLeaderboard(userId);
    } else if (cleanType === 'COLLECTOR') {
      return this.leaderboardService.getCollectorLeaderboard(userId);
    } else {
      return this.leaderboardService.getScoreLeaderboard(userId);
    }
  }
}