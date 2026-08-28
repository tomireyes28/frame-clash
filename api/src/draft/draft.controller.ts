// api/src/draft/draft.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DraftService } from './draft.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';
import { PickDraftCardDto } from './dto/pick-draft-card.dto';
import { StartDraftRoundDto } from './dto/start-draft-round.dto';
import { SubmitDraftRoundDto } from './dto/submit-draft-round.dto';

@Controller('draft')
@UseGuards(JwtAuthGuard)
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Post('start')
  async startDraft(@Req() req: RequestWithJwtUser) {
    const userId = req.user.id;
    return this.draftService.startDraft(userId);
  }

  @Post('pick')
  async pickCard(@Req() req: RequestWithJwtUser, @Body() body: PickDraftCardDto) {
    const userId = req.user.id;
    return this.draftService.pickDraftCard(userId, body.sessionId, body.cardId);
  }

  @Post('start-round')
  async startRound(@Req() req: RequestWithJwtUser, @Body() body: StartDraftRoundDto) {
    const userId = req.user.id;
    return this.draftService.startDraftRound(userId, body.sessionId, body.roundNumber);
  }

  @Post('submit-round')
  async submitRound(@Req() req: RequestWithJwtUser, @Body() body: SubmitDraftRoundDto) {
    const userId = req.user.id;
    return this.draftService.submitDraftRound(userId, body);
  }
}
