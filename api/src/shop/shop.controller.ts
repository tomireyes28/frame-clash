import { Controller, Post, Body } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('buy-pack')
  async buyStandardPack(@Body('userId') userId: string) {
    // Nota: Por ahora pasamos el userId por el Body para hacerlo fácil. 
    // Más adelante, cuando NextAuth esté 100% acoplado, sacaremos el ID directo del Token de seguridad.
    if (!userId) {
      throw new Error('Falta el userId');
    }
    
    return this.shopService.buyStandardPack(userId);
  }
}