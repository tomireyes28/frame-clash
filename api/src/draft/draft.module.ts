// api/src/draft/draft.module.ts
import { Module } from '@nestjs/common';
import { DraftService } from './draft.service';
import { DraftController } from './draft.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [PrismaModule, GameModule],
  providers: [DraftService],
  controllers: [DraftController],
  exports: [DraftService],
})
export class DraftModule {}
