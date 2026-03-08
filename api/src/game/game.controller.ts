import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { SubmitGameDto } from './dto/submit-game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@Controller('game')
@UseGuards(JwtAuthGuard) // 🛡️ Ponemos el guardián a nivel de clase para blindar TODAS las rutas de este controlador
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('start')
  async startRound(
    @Query('categoryId') categoryId: string,
    @Query('amount', new DefaultValuePipe(10), ParseIntPipe) amount: number, 
    @Req() req: RequestWithJwtUser // 👈 Atrapamos al usuario validado
  ) {
    const userId = req.user.id; // 👈 Sacamos el ID real del token

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
  async submitRound(
    @Body() submitData: SubmitGameDto,
    @Req() req: RequestWithJwtUser // 👈 Atrapamos al usuario
  ) {
    // 🔒 SEGURIDAD EXTREMA: Forzamos que el userId del DTO sea el del usuario logueado.
    // Esto evita que un hacker intercepte la petición y le asigne el puntaje a otro ID.
    submitData.userId = req.user.id; 

    const result = await this.gameService.submitRound(submitData);
    return result;
  }

  @Get('inventory')
  async getInventory(
    @Req() req: RequestWithJwtUser // 👈 Atrapamos al usuario validado
  ) {
    const userId = req.user.id; // 👈 Sacamos el ID real
    const inventory = await this.gameService.getUserInventory(userId);
    
    return {
      status: 'success',
      totalCards: inventory.length,
      data: inventory
    };
  }
}