import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query('mode') mode: string = 'ARCADE') {
    // Si mañana creás el modo SURVIVAL, el frontend solo manda ?mode=SURVIVAL y esto funciona solo.
    return this.leaderboardService.getTopPlayers(mode.toUpperCase());
  }
}