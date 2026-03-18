// src/shop/shop.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackService } from '../pack/pack.service';
import { PACK_CONFIGS, PackType } from '../common/constants/packs.config';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packService: PackService,
  ) {}

  async buyPack(userId: string, packId: string) {
    const packConfig = PACK_CONFIGS[packId as PackType];

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { coins: true }
      });

      if (!user) throw new BadRequestException('Usuario no encontrado.');
      if (user.coins < packConfig.price) {
        throw new BadRequestException(`Fondos insuficientes. Necesitás ${packConfig.price} monedas.`);
      }

      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: packConfig.price } }
      });

      // Le mandamos TODA la configuración del sobre al PackService
      const packResult = await this.packService.openDynamicPack(userId, packConfig, tx);

      return {
        success: true,
        message: `¡Sobre ${packId} abierto con éxito!`,
        newBalance: user.coins - packConfig.price,
        cards: packResult.cards 
      };
    });
  }
}