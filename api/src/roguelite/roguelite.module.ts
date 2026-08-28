// api/src/roguelite/roguelite.module.ts
import { Module } from '@nestjs/common';
import { RogueliteService } from './roguelite.service';
import { RogueliteController } from './roguelite.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [PrismaModule, GameModule],
  providers: [RogueliteService],
  controllers: [RogueliteController],
  exports: [RogueliteService],
})
export class RogueliteModule {}
