import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MissionModule } from '../mission/mission.module';


@Module({
  imports: [PrismaModule, MissionModule],
  providers: [GameService],
  controllers: [GameController]
})
export class GameModule {}
