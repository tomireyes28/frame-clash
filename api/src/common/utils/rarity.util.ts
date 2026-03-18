// src/common/utils/rarity.util.ts
import { Rarity } from '@prisma/client';

export type DropRates = {
  LEGENDARY: number;
  EPIC: number;
  RARE: number;
  UNCOMMON: number;
  COMMON: number;
};

export function rollRarity(dropRates: DropRates): Rarity {
  const roll = Math.random() * 100;
  let cumulative = 0;

  // El orden importa: vamos de más raro a más común
  const order: Rarity[] = ['LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON'];

  for (const rarity of order) {
    cumulative += dropRates[rarity];
    if (roll <= cumulative) {
      return rarity;
    }
  }

  return 'COMMON'; // Fallback de seguridad
}