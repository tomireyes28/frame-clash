// api/src/domination/domination.module.ts
import { Module } from '@nestjs/common';
import { DominationService } from './domination.service';
import { DominationController } from './domination.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [PrismaModule, GameModule],
  providers: [DominationService],
  controllers: [DominationController],
  exports: [DominationService],
})
export class DominationModule {}
