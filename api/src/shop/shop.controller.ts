import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';

@Controller('shop')
@UseGuards(JwtAuthGuard) // 🛡️ Seguridad total
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('buy-pack')
  async buyStandardPack(@Req() req: RequestWithJwtUser) {
    // ¡Promesa cumplida! Sacamos el ID directo del Token de seguridad.
    const userId = req.user.id; 
    
    return this.shopService.buyStandardPack(userId);
  }
}