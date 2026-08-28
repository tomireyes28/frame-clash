// api/src/domination/domination.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DominationService } from './domination.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';
import { StartNodeDto } from './dto/start-node.dto';
import { SubmitNodeDto } from './dto/submit-node.dto';

@Controller('domination')
@UseGuards(JwtAuthGuard)
export class DominationController {
  constructor(private readonly dominationService: DominationService) {}

  @Get('categories')
  async getAllCategoriesOverview(@Req() req: RequestWithJwtUser) {
    const userId = req.user.id;
    return this.dominationService.getAllCategoriesOverview(userId);
  }

  @Get('category/:categoryId')
  async getCategoryMap(
    @Req() req: RequestWithJwtUser,
    @Param('categoryId') categoryId: string,
  ) {
    const userId = req.user.id;
    return this.dominationService.getCategoryMap(userId, categoryId);
  }

  @Post('start-node')
  async startNode(@Req() req: RequestWithJwtUser, @Body() body: StartNodeDto) {
    const userId = req.user.id;
    return this.dominationService.startNode(userId, body);
  }

  @Post('submit-node')
  async submitNode(@Req() req: RequestWithJwtUser, @Body() body: SubmitNodeDto) {
    const userId = req.user.id;
    return this.dominationService.submitNode(userId, body);
  }
}
