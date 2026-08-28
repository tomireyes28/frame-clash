// api/src/collections/collections.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async getUserCollections(@Req() req: RequestWithJwtUser) {
    const userId = req.user.id;
    return this.collectionsService.getUserCollections(userId);
  }

  @Post(':id/claim')
  async claimReward(
    @Req() req: RequestWithJwtUser,
    @Param('id') collectionId: string,
  ) {
    const userId = req.user.id;
    return this.collectionsService.claimReward(userId, collectionId);
  }

  @Get('admin/list')
  async getAdminCollections() {
    return this.collectionsService.getAllAdminCollections();
  }

  @Post('admin/create')
  async createCollection(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.createCollection(dto);
  }

  @Delete('admin/:id')
  async deleteCollection(@Param('id') collectionId: string) {
    return this.collectionsService.deleteCollection(collectionId);
  }
}