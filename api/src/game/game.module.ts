import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { ScoringService } from './scoring.service';
import { GameController } from './game.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MissionModule } from '../mission/mission.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [PrismaModule, MissionModule, LeaderboardModule],
  providers: [GameService, ScoringService],
  controllers: [GameController],
  exports: [GameService, ScoringService],
})
export class GameModule {}
