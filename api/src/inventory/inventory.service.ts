// api/src/inventory/inventory.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Interfaces locales para garantizar un mapeo seguro y sin errores de TypeScript
 export interface CardCategory {
  id: string;
  key: string;
}

interface IncludedCard {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string | null;
  rarity: string;
  powerUpAction: string | null;
  powerUpValue: number | null;
  categories: CardCategory[];
}

interface UserCardWithCard {
  quantity: number;
  level: number;
  equippedModes: string[];
  card: IncludedCard;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mejora el nivel de una carta quemando duplicados y gastando monedas.
   */
  async upgradeCard(userId: string, cardId: string) {
    const userCard = await this.prisma.userCard.findUnique({
      where: { userId_cardId: { userId, cardId } },
      include: { card: true }
    });

    if (!userCard) throw new BadRequestException('No posees esta carta en tu inventario.');

    const currentLevel = userCard.level;
    const currentQuantity = userCard.quantity;

    // Límite del MVP: Nivel 5
    if (currentLevel >= 5) throw new BadRequestException('¡Esta carta ya alcanzó el nivel máximo!');

    const requiredDuplicates = currentLevel * 2; 
    const requiredCoins = currentLevel * 50;     

    // Verificación de recursos
    if (currentQuantity < requiredDuplicates + 1) {
      throw new BadRequestException(`Te faltan copias. Necesitas ${requiredDuplicates} repetidas y tienes ${currentQuantity - 1}.`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user || user.coins < requiredCoins) {
      throw new BadRequestException(`Te faltan monedas. Cuesta ${requiredCoins} 🪙.`);
    }

    // Transacción atómica: o se hace todo o no se hace nada
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

  /**
   * Obtiene y mapea el inventario completo de un usuario con todas sus relaciones.
   */
  async getUserInventory(userId: string) {
    const userCards = await this.prisma.userCard.findMany({
      where: { userId },
      include: { 
        card: { 
          include: { categories: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Forzamos el tipado para evitar el error de "Unsafe member access"
    const typedUserCards = userCards as unknown as UserCardWithCard[];

    return typedUserCards.map(uc => ({
      id: uc.card.id,              
      cardId: uc.card.id,          
      tmdbId: uc.card.tmdbId,      
      year: uc.card.year,          
      title: uc.card.title,
      posterPath: uc.card.posterPath,
      rarity: uc.card.rarity,
      powerUpAction: uc.card.powerUpAction,
      powerUpValue: uc.card.powerUpValue,
      quantity: uc.quantity,
      level: uc.level,
      equippedModes: uc.equippedModes,
      categories: uc.card.categories,
    }));
  }
}