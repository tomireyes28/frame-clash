// api/src/shop/shop.controller.ts
import { Controller, Get, Post, UseGuards, Req, Body } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/interfaces/request.interface';
import { BuyPackDto } from './dto/buy-pack.dto';

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('packs')
  getPacksCatalog() {
    return {
      status: 'success',
      data: this.shopService.getPacksCatalog(),
    };
  }

  @Post('buy-pack')
  async buyPack(
    @Req() req: RequestWithJwtUser,
    @Body() body: BuyPackDto,
  ) {
    const userId = req.user.id;
    return this.shopService.buyPack(userId, body.packId);
  }
}