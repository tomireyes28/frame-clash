import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Traer todas las cartas del jugador
  @Get()
  async getInventory(@Query('userId') userId: string) {
    if (!userId) throw new Error('Falta el userId');
    const cards = await this.inventoryService.getUserInventory(userId);
    return { success: true, data: cards };
  }

  // Mejorar una carta
  @Post('upgrade')
  async upgradeCard(
    @Body('userId') userId: string,
    @Body('cardId') cardId: string
  ) {
    if (!userId || !cardId) throw new Error('Faltan datos para mejorar la carta');
    return this.inventoryService.upgradeCard(userId, cardId);
  }
}