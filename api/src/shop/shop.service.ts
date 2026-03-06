import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackService } from '../pack/pack.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packService: PackService, // Inyectamos el Crupier
  ) {}

  async buyStandardPack(userId: string) {
    const PACK_PRICE = 100; // Cuesta 100 monedas

    // 1. Leemos la billetera del usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado en los registros.');
    }

    // 2. ¿Tiene la plata?
    if (user.coins < PACK_PRICE) {
      throw new BadRequestException('Fondos insuficientes. ¡Volvé al Coliseo a ganar más monedas!');
    }

    // 3. ¡Cobrado! Le restamos las 100 monedas de la DB
    await this.prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: PACK_PRICE } }
    });

    // 4. Le pedimos al Crupier que abra el sobre y haga el UPSERT de las cartas
    const packResult = await this.packService.openStandardPack(userId);

    // 5. Devolvemos las cartas nuevas y el vuelto (saldo actualizado)
    return {
      success: true,
      message: '¡Compra exitosa!',
      newBalance: user.coins - PACK_PRICE,
      cards: packResult.cards 
    };
  }
}