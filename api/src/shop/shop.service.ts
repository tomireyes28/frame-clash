// api/src/shop/shop.service.ts
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

  /**
   * Obtiene el catálogo completo de sobres disponibles en la tienda
   */
  getPacksCatalog() {
    return Object.values(PACK_CONFIGS).map((pack) => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      price: pack.price,
      size: pack.size,
      icon: pack.icon,
      badgeColor: pack.badgeColor,
      dropRates: pack.dropRates,
    }));
  }

  /**
   * Compra y abre un sobre para el usuario en una transacción segura
   */
  async buyPack(userId: string, packId: string) {
    const packConfig = PACK_CONFIGS[packId as PackType];
    if (!packConfig) {
      throw new BadRequestException(`El sobre "${packId}" no existe en el catálogo.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { coins: true, stardust: true, xp: true },
      });

      if (!user) throw new BadRequestException('Usuario no encontrado.');
      if (user.coins < packConfig.price) {
        throw new BadRequestException(`Fondos insuficientes. Necesitás ${packConfig.price} monedas y tenés ${user.coins}.`);
      }

      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: packConfig.price } },
      });

      // Abrimos el sobre dinámico pasando el transaction client
      const packResult = await this.packService.openDynamicPack(userId, packConfig, tx);

      return {
        success: true,
        message: `¡${packConfig.name} abierto con éxito!`,
        newBalance: user.coins - packConfig.price,
        stardustGained: packResult.totalStardustGained,
        xpGained: packResult.xpGained,
        cards: packResult.cards,
      };
    });
  }
}