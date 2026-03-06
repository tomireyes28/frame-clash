import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // ⬆️ MEJORAR UNA CARTA (Level Up)
  // =========================================================
  async upgradeCard(userId: string, cardId: string) {
    // 1. Buscamos la carta específica en el inventario del usuario
    const userCard = await this.prisma.userCard.findUnique({
      where: {
        userId_cardId: { userId, cardId }
      },
      include: { card: true }
    });

    if (!userCard) {
      throw new BadRequestException('No posees esta carta en tu inventario.');
    }

    const currentLevel = userCard.level;
    const currentQuantity = userCard.quantity;

    // Límite máximo (MVP: Nivel 5)
    if (currentLevel >= 5) {
      throw new BadRequestException('¡Esta carta ya alcanzó el nivel máximo!');
    }

    // 2. Calculamos los costos basados en el nivel actual
    const requiredDuplicates = currentLevel * 2; // Nvl 1 -> 2 req, Nvl 2 -> 4 req
    const requiredCoins = currentLevel * 50;     // Nvl 1 -> 50 oro, Nvl 2 -> 100 oro

    // 3. Verificamos si tiene suficientes copias (quantity)
    // Nota: El quantity total incluye la carta base. 
    // Si necesito quemar 2, mi quantity tiene que ser al menos 3 (1 base + 2 repetidas)
    if (currentQuantity < requiredDuplicates + 1) {
      throw new BadRequestException(`Te faltan copias. Necesitas ${requiredDuplicates} repetidas y tienes ${currentQuantity - 1}.`);
    }

    // 4. Verificamos si tiene las monedas
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user || user.coins < requiredCoins) {
      throw new BadRequestException(`Te faltan monedas. Cuesta ${requiredCoins} 🪙.`);
    }

    // 5. ¡FUSIÓN! Cobramos las monedas, quemamos las copias y subimos el nivel.
    // Usamos una Transacción ($transaction) para que si algo falla, no te cobre sin darte el nivel.
    const [updatedUser, updatedCard] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: requiredCoins } }
      }),
      this.prisma.userCard.update({
        where: { userId_cardId: { userId, cardId } },
        data: {
          quantity: { decrement: requiredDuplicates },
          level: { increment: 1 }
        }
      })
    ]);

    return {
      success: true,
      message: `¡${userCard.card.title} subió a Nivel ${updatedCard.level}!`,
      newLevel: updatedCard.level,
      remainingQuantity: updatedCard.quantity,
      newBalance: updatedUser.coins
    };
  }

  // De paso, mudamos acá la función que trae el inventario (que antes estaba en GameService)
  // Así mantenemos la Responsabilidad Única (SOLID)
  async getUserInventory(userId: string) {
    const userCards = await this.prisma.userCard.findMany({
      where: { userId },
      include: { card: true },
      orderBy: { createdAt: 'desc' }
    });

    return userCards.map(uc => ({
      id: uc.card.id,
      title: uc.card.title,
      posterPath: uc.card.posterPath,
      rarity: uc.card.rarity,
      powerUpAction: uc.card.powerUpAction,
      powerUpValue: uc.card.powerUpValue,
      quantity: uc.quantity,
      level: uc.level,
      equippedModes: uc.equippedModes,
    }));
  }
}