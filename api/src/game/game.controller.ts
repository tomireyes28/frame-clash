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
    // NestJS se encarga de darle un 10 por defecto y convertir el string a número:
    @Query('amount', new DefaultValuePipe(10), ParseIntPipe) amount: number, 
  ) {
    // 1. Llamamos al Coliseo para que arme el paquete
    const round = await this.gameService.generateRound(categoryId, amount);

    // 2. Devolvemos la respuesta
    return {
      status: 'success',
      message: 'Ronda generada con éxito. ¡A jugar!',
      totalQuestions: round.length,
      data: round,
    };
  }

  @Post('submit')
  async submitRound(@Body() submitData: SubmitGameDto) {
    // Fíjate qué limpio queda el controlador. 
    // class-validator ya revisó que submitData sea perfecto antes de llegar a esta línea.
    const result = await this.gameService.submitRound(submitData);
    
    return result;
  }
}