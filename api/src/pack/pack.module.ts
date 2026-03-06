import { Module } from '@nestjs/common';
import { PackService } from './pack.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule ],
  providers: [PackService],
  exports: [PackService], 
})
export class PackModule {}