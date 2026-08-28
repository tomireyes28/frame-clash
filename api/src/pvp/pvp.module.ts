// api/src/pvp/pvp.module.ts
import { Module } from '@nestjs/common';
import { PvpService } from './pvp.service';
import { PvpController } from './pvp.controller';
import { PvpGateway } from './pvp.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { GameModule } from '../game/game.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, GameModule, AuthModule],
  controllers: [PvpController],
  providers: [PvpService, PvpGateway],
  exports: [PvpService, PvpGateway],
})
export class PvpModule {}
