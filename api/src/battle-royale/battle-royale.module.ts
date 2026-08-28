// api/src/battle-royale/battle-royale.module.ts
import { Module } from '@nestjs/common';
import { BattleRoyaleGateway } from './battle-royale.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [PrismaModule, AuthModule, GameModule],
  providers: [BattleRoyaleGateway],
  exports: [BattleRoyaleGateway],
})
export class BattleRoyaleModule {}
