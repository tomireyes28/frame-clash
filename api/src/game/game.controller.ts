// api/src/game/game.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // Este es el endpoint de tu Roadmap: GET /game/start
  @Get('start')
  async startRound(
    @Query('categoryId') categoryId: string,
    @Query('amount') amount?: string,
  ) {
    // 1. Validamos que el frontend nos haya mandado una categoría
    if (!categoryId) {
      throw new BadRequestException('El parámetro categoryId es obligatorio para iniciar una partida.');
    }

    // 2. Si el frontend no pasa 'amount', por defecto le damos 10 (las 10 de la ronda + potenciadores si querés pedir más)
    const questionsAmount = amount ? parseInt(amount, 10) : 10;

    // 3. Llamamos al Coliseo para que nos arme el paquete enmascarado
    const round = await this.gameService.generateRound(categoryId, questionsAmount);

    // 4. Devolvemos la respuesta formateada y prolija
    return {
      status: 'success',
      message: 'Ronda generada con éxito. ¡A jugar!',
      totalQuestions: round.length,
      data: round,
    };
  }
}