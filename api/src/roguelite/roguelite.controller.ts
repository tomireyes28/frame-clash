// api/src/roguelite/roguelite.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { RogueliteService } from './roguelite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';
import { StartRunDto } from './dto/start-run.dto';
import { StartWaveDto } from './dto/start-wave.dto';
import { SubmitWaveDto } from './dto/submit-wave.dto';

@Controller('roguelite')
@UseGuards(JwtAuthGuard)
export class RogueliteController {
  constructor(private readonly rogueliteService: RogueliteService) {}

  @Get('progress')
  async getProgress(@Req() req: RequestWithJwtUser) {
    const userId = req.user.id;
    return this.rogueliteService.getUserProgress(userId);
  }

  @Post('start-run')
  async startRun(@Req() req: RequestWithJwtUser, @Body() body: StartRunDto) {
    const userId = req.user.id;
    return this.rogueliteService.startRun(userId, body.equippedCardIds);
  }

  @Post('start-wave')
  async startWave(@Req() req: RequestWithJwtUser, @Body() body: StartWaveDto) {
    const userId = req.user.id;
    return this.rogueliteService.startWave(userId, body.runId, body.categoryId);
  }

  @Post('submit-wave')
  async submitWave(@Req() req: RequestWithJwtUser, @Body() body: SubmitWaveDto) {
    const userId = req.user.id;
    return this.rogueliteService.submitWave(userId, body);
  }
}
