// api/src/inventory/inventory.controller.ts
import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Interfaz para el tipado estricto del usuario autenticado
interface AuthRequest {
  user: {
    userId: string;
    email?: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Obtiene el inventario completo del usuario logueado
  @Get()
  getInventory(@Req() req: AuthRequest) {
    return this.inventoryService.getUserInventory(req.user.userId);
  }

  // Sube de nivel una carta específica
  @Post(':cardId/upgrade')
  upgradeCard(@Req() req: AuthRequest, @Param('cardId') cardId: string) {
    return this.inventoryService.upgradeCard(req.user.userId, cardId);
  }
}