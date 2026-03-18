import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { CardsModule } from './cards/cards.module';
import { QuestionsModule } from './questions/questions.module';
import { GameModule } from './game/game.module';
import { ShopModule } from './shop/shop.module';
import { PackModule } from './pack/pack.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProfileModule } from './profile/profile.module';
import { MissionModule } from './mission/mission.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { CollectionsModule } from './collections/collections.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, TmdbModule, CardsModule, QuestionsModule, GameModule, ShopModule, PackModule, InventoryModule, ProfileModule, MissionModule, LeaderboardModule, CollectionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
