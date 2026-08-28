// api/src/inventory/inventory.controller.ts
import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Obtiene el inventario completo del usuario logueado
  @Get()
  getInventory(@Req() req: RequestWithJwtUser) {
    return this.inventoryService.getUserInventory(req.user.id);
  }

  // Sube de nivel una carta específica
  @Post(':cardId/upgrade')
  upgradeCard(@Req() req: RequestWithJwtUser, @Param('cardId') cardId: string) {
    return this.inventoryService.upgradeCard(req.user.id, cardId);
  }
}