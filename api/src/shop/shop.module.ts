import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PackModule } from '../pack/pack.module'; 
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PackModule, PrismaModule],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}