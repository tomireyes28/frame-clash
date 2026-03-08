import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@Controller('inventory')
@UseGuards(JwtAuthGuard) // 🛡️ Seguridad total
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Traer todas las cartas del jugador
  @Get()
  async getInventory(@Req() req: RequestWithJwtUser) {
    const userId = req.user.id; // 👈 Sacamos el ID del Token
    const cards = await this.inventoryService.getUserInventory(userId);
    return { success: true, data: cards };
  }

  // Mejorar una carta
  @Post('upgrade')
  async upgradeCard(
    @Req() req: RequestWithJwtUser, // 👈 Atrapamos al usuario
    @Body('cardId') cardId: string  // 🧹 Solo pedimos la carta, el usuario ya lo sabemos
  ) {
    const userId = req.user.id;
    if (!cardId) throw new BadRequestException('Falta el cardId para mejorar la carta');
    
    return this.inventoryService.upgradeCard(userId, cardId);
  }
}