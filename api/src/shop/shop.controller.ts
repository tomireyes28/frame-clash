// src/shop/shop.controller.ts
import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';
import { BuyPackDto } from './dto/buy-pack.dto';

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('buy-pack')
  async buyPack(
    @Req() req: RequestWithJwtUser, 
    @Body() body: BuyPackDto
  ) {
    const userId = req.user.id; 
    
    // Le pasamos al servicio el ID del usuario y qué sobre quiere
    return this.shopService.buyPack(userId, body.packId);
  }
}