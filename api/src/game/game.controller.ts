// api/src/game/game.controller.ts
import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { SubmitGameDto } from './dto/submit-game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('start')
  async startRound(
    @Query('categoryId') categoryId: string,
    @Query('amount', new DefaultValuePipe(10), ParseIntPipe) amount: number, 
    @Query('userId') userId: string = 'cmm8bj5pr0000n49toufqk6gd'
  ) {
    // Al estar tipado en el servicio, TypeScript ya sabe exactamente qué es 'round'
    const round = await this.gameService.generateRound(categoryId, amount, userId);

    return {
      status: 'success',
      message: 'Ronda generada con éxito. ¡A jugar!',
      totalQuestions: round.questions.length,
      data: round.questions,
      powerUps: round.powerUps, 
    };
  }

  @Post('submit')
  async submitRound(@Body() submitData: SubmitGameDto) {
    const result = await this.gameService.submitRound(submitData);
    return result;
  }
}