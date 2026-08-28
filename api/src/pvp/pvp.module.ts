// api/src/pvp/pvp.module.ts
import { Module } from '@nestjs/common';
import { PvpService } from './pvp.service';
import { PvpController } from './pvp.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [PrismaModule, GameModule],
  controllers: [PvpController],
  providers: [PvpService],
  exports: [PvpService],
})
export class PvpModule {}
