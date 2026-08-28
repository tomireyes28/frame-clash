// api/src/pvp/pvp.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PvpService } from './pvp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';
import { CreatePvpChallengeDto } from './dto/create-pvp-challenge.dto';
import { SubmitPvpMatchDto } from './dto/submit-pvp-match.dto';

@Controller('pvp')
@UseGuards(JwtAuthGuard)
export class PvpController {
  constructor(private readonly pvpService: PvpService) {}

  @Get('matches')
  async getMyMatches(@Req() req: RequestWithJwtUser) {
    return this.pvpService.getMyMatches(req.user.id);
  }

  @Post('challenge')
  async createOrFindMatch(
    @Req() req: RequestWithJwtUser,
    @Body() dto: CreatePvpChallengeDto,
  ) {
    return this.pvpService.createOrFindMatch(req.user.id, dto);
  }

  @Post('submit')
  async submitMatch(
    @Req() req: RequestWithJwtUser,
    @Body() dto: SubmitPvpMatchDto,
  ) {
    return this.pvpService.submitMatch(req.user.id, dto);
  }
}
